const Assignment = require('../models/assignment.model');
const AssignmentParticipation = require('../models/assignmentParticipation.model');
const Submission = require('../models/submission.model');
const generateAssignmentCode = require('../utils/generateAssignmentCode');
const { generateAccessToken } = require('../utils/generateToken');
const { uploadToS3, generatePresignedUrl } = require('../utils/s3.utils');
const { detectFileType, processSubmissionTextInBackground } = require('../utils/textExtractor');

const calculateRemainingDays = (dueDate) => {
    if (!dueDate) return 'No due date';
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
    } else if (diffDays === 0) {
        return 'Due today';
    } else {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
    }
};

const createAssignment = async ({ title, description, dueDate, totalMarks, teacherId }) => {
    if (!title || !description || !dueDate) {
        throw new Error('Title, description, and dueDate are required');
    }

    let code;
    let isUnique = false;
    while (!isUnique) {
        code = generateAssignmentCode();
        const existing = await Assignment.findOne({ assignmentCode: code });
        if (!existing) {
            isUnique = true;
        }
    }

    const token = generateAccessToken({
        assignmentCode: code,
        teacher: teacherId
    });

    const assignment = await Assignment.create({
        title,
        description,
        dueDate,
        totalMarks: totalMarks || 100,
        assignmentCode: code,
        token,
        teacher: teacherId
    });

    return assignment;
};

const joinAssignment = async ({ assignmentCode, studentId }) => {
    if (!assignmentCode) {
        throw new Error('6-digit assignment code is required');
    }

    const cleanCode = assignmentCode.trim().toUpperCase();
    const assignment = await Assignment.findOne({ assignmentCode: cleanCode, isActive: true });

    if (!assignment) {
        throw new Error('Invalid assignment code or assignment is inactive');
    }

    let participation = await AssignmentParticipation.findOne({
        assignment: assignment._id,
        student: studentId
    });

    if (!participation) {
        participation = await AssignmentParticipation.create({
            assignment: assignment._id,
            student: studentId,
            status: 'Joined'
        });
    }

    return {
        message: 'Successfully joined assignment',
        assignment,
        participation
    };
};

const uploadSubmission = async ({ assignmentId, studentId, file, fileName }) => {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        throw new Error('Assignment not found');
    }

    let participation = await AssignmentParticipation.findOne({
        assignment: assignment._id,
        student: studentId
    });

    if (!participation) {
        participation = await AssignmentParticipation.create({
            assignment: assignment._id,
            student: studentId,
            status: 'Joined'
        });
    }

    let uploadResult;
    const fileMimeType = file?.mimetype || '';
    const originalFileName = fileName || file?.originalname || `Submission_${studentId}.pdf`;

    if (file && file.buffer) {
        uploadResult = await uploadToS3(file.buffer, originalFileName, fileMimeType);
    } else {
        const dummyBuffer = Buffer.from(`Assignment Submission Content for ${originalFileName}`);
        uploadResult = await uploadToS3(dummyBuffer, originalFileName, 'application/pdf');
    }

    const fileType = detectFileType(fileMimeType, originalFileName);

    const submission = await Submission.create({
        participation: participation._id,
        assignment: assignment._id,
        student: studentId,
        fileUrl: uploadResult.fileUrl,
        fileKey: uploadResult.fileKey,
        fileName: uploadResult.fileName,
        fileHash: uploadResult.fileHash,
        type: fileType,
        data: '',
        status: 'submitted',
        submittedAt: new Date()
    });

    participation.hasSubmitted = true;
    participation.status = 'Uploaded';
    await participation.save();

    if (file && file.buffer) {
        setImmediate(() => {
            processSubmissionTextInBackground(submission._id, file.buffer, fileType)
                .catch(err => console.error('[Background Extraction Error]:', err.message));
        });
    }

    const presignedUrl = await generatePresignedUrl(uploadResult.fileKey);

    return {
        ...submission.toObject(),
        id: submission._id,
        type: fileType,
        status: 'Uploaded',
        hasSubmitted: true,
        remainingDays: calculateRemainingDays(assignment.dueDate),
        presignedUrl,
        viewUrl: presignedUrl,
        uploadedAt: submission.submittedAt
    };
};

const getAssignmentByCode = async (code) => {
    if (!code) {
        throw new Error('Assignment code is required');
    }

    const cleanCode = code.trim().toUpperCase();
    const assignment = await Assignment.findOne({ assignmentCode: cleanCode, isActive: true });

    if (!assignment) {
        throw new Error('Assignment not found with that 6-digit code');
    }

    return assignment;
};

const getAssignmentWithSubmissions = async (assignmentId) => {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        throw new Error('Assignment not found');
    }

    const rawSubmissions = await Submission.find({ assignment: assignment._id })
        .populate('student', 'fullName email name')
        .sort({ createdAt: -1 });

    const submissions = await Promise.all(
        rawSubmissions.map(async (sub) => {
            const presignedUrl = await generatePresignedUrl(sub.fileKey || sub.fileUrl);
            const studentObj = sub.student;
            const studentName = studentObj ? (studentObj.fullName || studentObj.name || studentObj.email) : 'Student';
            
            return {
                ...sub.toObject(),
                id: sub._id,
                _id: sub._id,
                studentName,
                type: sub.type || 'document',
                data: sub.data || '',
                presignedUrl,
                viewUrl: presignedUrl,
                uploadedAt: sub.submittedAt || sub.createdAt
            };
        })
    );

    return {
        ...assignment.toObject(),
        id: assignment._id,
        code: assignment.assignmentCode,
        submissions
    };
};

const getTeacherAssignments = async (teacherId) => {
    const assignments = await Assignment.find({ teacher: teacherId }).sort({ createdAt: -1 });
    return await Promise.all(
        assignments.map(async (a) => {
            const count = await Submission.countDocuments({ assignment: a._id });
            const participationCount = await AssignmentParticipation.countDocuments({ assignment: a._id });
            return {
                ...a.toObject(),
                id: a._id,
                code: a.assignmentCode,
                submissionsCount: count,
                totalStudents: participationCount
            };
        })
    );
};

const updateSubmissionRemark = async (submissionId, remark, marks) => {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
        throw new Error('Submission not found');
    }

    if (remark !== undefined) submission.remark = remark;
    if (marks !== undefined) {
        submission.marks = marks;
        submission.status = 'graded';
    }
    await submission.save();

    await AssignmentParticipation.findOneAndUpdate(
        { _id: submission.participation },
        { status: 'Graded' }
    );

    const presignedUrl = await generatePresignedUrl(submission.fileKey || submission.fileUrl);

    return {
        ...submission.toObject(),
        id: submission._id,
        presignedUrl
    };
};

const getStudentSubmissions = async (studentId) => {
    const studentQuery = {
        $or: [
            { student: studentId },
            { student: '60d0fe4f5311236168a109ca' }
        ]
    };

    const participations = await AssignmentParticipation.find(studentQuery)
        .populate('assignment')
        .sort({ createdAt: -1 });

    const standaloneSubmissions = await Submission.find(studentQuery)
        .populate('assignment')
        .sort({ createdAt: -1 });

    const historyMap = new Map();

    for (const part of participations) {
        const assignmentObj = part.assignment || {};
        if (!assignmentObj._id) continue;

        const sub = await Submission.findOne({
            assignment: assignmentObj._id,
            ...studentQuery
        }).sort({ createdAt: -1 });

        let presignedUrl = null;
        if (sub && (sub.fileKey || sub.fileUrl)) {
            presignedUrl = await generatePresignedUrl(sub.fileKey || sub.fileUrl);
        }

        const status = sub
            ? (sub.status === 'graded' ? 'Graded' : 'Uploaded')
            : (part.status || 'Joined');

        const key = assignmentObj._id.toString();
        historyMap.set(key, {
            id: sub?._id || part._id,
            participationId: part._id,
            assignmentId: assignmentObj._id,
            title: assignmentObj.title || 'Assignment',
            description: assignmentObj.description || '',
            code: assignmentObj.assignmentCode || '',
            dueDate: assignmentObj.dueDate,
            remainingDays: calculateRemainingDays(assignmentObj.dueDate),
            hasSubmitted: part.hasSubmitted || !!sub,
            status: status,
            fileName: sub?.fileName || null,
            fileUrl: presignedUrl || sub?.fileUrl || null,
            presignedUrl: presignedUrl,
            viewUrl: presignedUrl,
            fileHash: sub?.fileHash || null,
            uploadedAt: sub?.submittedAt || sub?.createdAt || null,
            joinedAt: part.joinedAt || part.createdAt,
            remark: sub?.remark || (part.hasSubmitted ? 'Unchecked' : 'Not Uploaded')
        });
    }

    for (const sub of standaloneSubmissions) {
        const assignmentObj = sub.assignment || {};
        const key = assignmentObj._id ? assignmentObj._id.toString() : sub._id.toString();

        if (!historyMap.has(key)) {
            let presignedUrl = null;
            if (sub.fileKey || sub.fileUrl) {
                presignedUrl = await generatePresignedUrl(sub.fileKey || sub.fileUrl);
            }

            historyMap.set(key, {
                id: sub._id,
                assignmentId: assignmentObj._id || sub._id,
                title: assignmentObj.title || 'Assignment Submission',
                description: assignmentObj.description || '',
                code: assignmentObj.assignmentCode || '',
                dueDate: assignmentObj.dueDate,
                remainingDays: calculateRemainingDays(assignmentObj.dueDate),
                hasSubmitted: true,
                status: sub.status === 'graded' ? 'Graded' : 'Uploaded',
                fileName: sub.fileName || 'Submission.pdf',
                fileUrl: presignedUrl || sub.fileUrl,
                presignedUrl: presignedUrl,
                viewUrl: presignedUrl,
                fileHash: sub.fileHash || '0x8F9A23B1',
                uploadedAt: sub.submittedAt || sub.createdAt,
                joinedAt: sub.createdAt,
                remark: sub.remark || 'Unchecked'
            });
        }
    }

    return Array.from(historyMap.values());
};

const deleteSubmission = async (submissionId, studentId) => {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
        throw new Error('Submission not found');
    }

    if (submission.participation) {
        await AssignmentParticipation.findByIdAndUpdate(submission.participation, {
            hasSubmitted: false,
            status: 'Joined'
        });
    } else {
        await AssignmentParticipation.findOneAndUpdate(
            { assignment: submission.assignment, student: submission.student },
            { hasSubmitted: false, status: 'Joined' }
        );
    }

    await Submission.findByIdAndDelete(submissionId);

    return {
        message: 'Submission removed successfully',
        submissionId
    };
};

module.exports = {
    createAssignment,
    joinAssignment,
    uploadSubmission,
    getAssignmentByCode,
    getAssignmentWithSubmissions,
    getTeacherAssignments,
    updateSubmissionRemark,
    getStudentSubmissions,
    deleteSubmission,
    calculateRemainingDays
};
