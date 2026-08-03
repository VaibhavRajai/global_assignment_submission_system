const assignmentService = require('../services/assignment.service');
const { generatePresignedUrl } = require('../utils/s3.utils');

const createAssignment = async (req, res) => {
    try {
        const teacherId = req.user?.id || req.body.teacher;
        if (!teacherId) {
            return res.status(401).json({
                success: false,
                error: 'Teacher authorization required'
            });
        }
        const { title, description, dueDate, totalMarks } = req.body;
        const assignment = await assignmentService.createAssignment({
            title,
            description,
            dueDate,
            totalMarks,
            teacherId
        });
        return res.status(201).json({
            success: true,
            message: 'Assignment created successfully',
            data: {
                ...assignment.toObject(),
                id: assignment._id,
                code: assignment.assignmentCode
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to create assignment'
        });
    }
};

const joinAssignment = async (req, res) => {
    try {
        const studentId = req.user?.id || req.body.studentId || req.body.student;
        const code = req.body.assignmentCode || req.body.code || req.params.code;
        if (!studentId) {
            return res.status(401).json({
                success: false,
                error: 'Student authorization required'
            });
        }
        const result = await assignmentService.joinAssignment({
            assignmentCode: code,
            studentId
        });
        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                ...result.assignment.toObject(),
                id: result.assignment._id,
                code: result.assignment.assignmentCode,
                participation: result.participation
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to join assignment'
        });
    }
};

const uploadSubmission = async (req, res) => {
    try {
        const assignmentId = req.params.id || req.body.assignmentId || req.body.assignment;
        const studentId = req.user?.id || req.body.studentId || req.body.student || '60d0fe4f5311236168a109ca';
        const file = req.file;
        const fileName = req.body.fileName || file?.originalname;

        const submissionData = await assignmentService.uploadSubmission({
            assignmentId,
            studentId,
            file,
            fileName
        });

        return res.status(201).json({
            success: true,
            message: 'Assignment submitted and stored on S3 successfully',
            data: submissionData
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to upload submission to S3'
        });
    }
};

const getAssignmentDetailsAndSubmissions = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const data = await assignmentService.getAssignmentWithSubmissions(assignmentId);
        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: error.message || 'Assignment not found'
        });
    }
};

const getAssignmentByCode = async (req, res) => {
    try {
        const code = req.params.code;
        const assignment = await assignmentService.getAssignmentByCode(code);
        return res.status(200).json({
            success: true,
            data: {
                ...assignment.toObject(),
                id: assignment._id,
                code: assignment.assignmentCode
            }
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: error.message || 'Assignment not found'
        });
    }
};

const getTeacherAssignments = async (req, res) => {
    try {
        const teacherId = req.user?.id;
        const assignments = await assignmentService.getTeacherAssignments(teacherId);
        return res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to fetch assignments'
        });
    }
};

const updateRemark = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { remark, marks } = req.body;
        const updated = await assignmentService.updateSubmissionRemark(submissionId, remark, marks);
        return res.status(200).json({
            success: true,
            message: 'Remark updated successfully',
            data: updated
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to update remark'
        });
    }
};

const getSubmissionPresignedUrl = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { fileKey } = req.query;
        const presignedUrl = await generatePresignedUrl(fileKey || submissionId);
        return res.status(200).json({
            success: true,
            presignedUrl
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to generate presigned URL'
        });
    }
};

const getStudentSubmissions = async (req, res) => {
    try {
        const studentId = req.user?.id || req.params.studentId;
        if (!studentId) {
            return res.status(401).json({
                success: false,
                error: 'Student authorization required'
            });
        }
        const history = await assignmentService.getStudentSubmissions(studentId);
        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to fetch student submission history'
        });
    }
};

const deleteSubmission = async (req, res) => {
    try {
        const submissionId = req.params.submissionId || req.params.id;
        const studentId = req.user?.id || req.user?.userId || req.user?._id;
        
        const result = await assignmentService.deleteSubmission(submissionId, studentId);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to remove submission'
        });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, totalMarks } = req.body;
        const Assignment = require('../models/assignment.model');
        const updated = await Assignment.findByIdAndUpdate(
            id,
            { title, description, dueDate, totalMarks },
            { new: true }
        );
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = {
    createAssignment,
    joinAssignment,
    uploadSubmission,
    getAssignmentDetailsAndSubmissions,
    getAssignmentByCode,
    getTeacherAssignments,
    updateRemark,
    getSubmissionPresignedUrl,
    getStudentSubmissions,
    deleteSubmission,
    updateAssignment
};
