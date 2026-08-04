const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;