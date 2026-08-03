const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Teacher routes
router.post('/', authenticateToken, assignmentController.createAssignment);
router.post('/create', authenticateToken, assignmentController.createAssignment);
router.get('/', authenticateToken, assignmentController.getTeacherAssignments);
router.put('/:id', authenticateToken, assignmentController.updateAssignment);

// Student routes
router.post('/join', authenticateToken, assignmentController.joinAssignment);
router.post('/code/:code/join', authenticateToken, assignmentController.joinAssignment);
router.get('/code/:code', assignmentController.getAssignmentByCode);
router.get('/student/history', authenticateToken, assignmentController.getStudentSubmissions);
router.get('/student/submissions', authenticateToken, assignmentController.getStudentSubmissions);

// Submission S3 upload endpoint (Student side)
router.post('/:id/upload', upload.single('file'), assignmentController.uploadSubmission);
router.post('/submissions/upload', upload.single('file'), assignmentController.uploadSubmission);

// Teacher viewing assignment & submissions with S3 pre-signed URLs
router.get('/:id', authenticateToken, assignmentController.getAssignmentDetailsAndSubmissions);
router.get('/:id/submissions', authenticateToken, assignmentController.getAssignmentDetailsAndSubmissions);

// Single submission pre-signed URL & remark update endpoints
router.get('/submissions/single/:submissionId', assignmentController.getSubmissionPresignedUrl);
router.put('/submissions/:submissionId/remark', authenticateToken, assignmentController.updateRemark);
router.delete('/submissions/:submissionId', authenticateToken, assignmentController.deleteSubmission);
router.delete('/student/submissions/:submissionId', authenticateToken, assignmentController.deleteSubmission);

module.exports = router;
