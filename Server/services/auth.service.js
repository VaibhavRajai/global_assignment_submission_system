const userRepostiry = require('../repositories/user.repository');
const hashPassword = require('../utils/hashPassword');
const generateOTP = require('../utils/generateOTP');
const { generateTokens, verifyRefreshToken } = require('../utils/generateToken');
const otpService = require('../services/otp.service');
const emailService = require('../services/email.service');
const bcrypt = require('bcrypt');

const signup = async (userData) => {
    const { fullname, fullName, name, email, password, role } = userData;
    const userName = fullName || fullname || name;
    const existingUser = await userRepostiry.findByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    await otpService.saveOTP(email, {
        fullName: userName,
        fullname: userName,
        email,
        hashedPassword,
        role,
        provider: "local",
        provide: "local",
        otp
    });
    await emailService.sendOTP(email, otp);
    return {
        success: true,
        message: 'OTP sent successfully'
    };
};

const verifyOTP = async ({ email, otp }) => {
    const redisUser = await otpService.getOTP(email);
    if (!redisUser) {
        throw new Error("OTP Expired");
    }
    if (String(redisUser.otp) !== String(otp)) {
        throw new Error("Invalid OTP");
    }
    const user = await userRepostiry.createUser({
        fullName: redisUser.fullName || redisUser.fullname,
        email: redisUser.email,
        password: redisUser.hashedPassword || redisUser.password,
        role: redisUser.role,
        provider: redisUser.provider || redisUser.provide || "local"
    });
    await otpService.deleteOTP(email);
    const { accessToken, refreshToken } = generateTokens({
        id: user._id,
        role: user.role
    });
    return { user, accessToken, refreshToken, token: accessToken };
};

const login = async ({ email, password }) => {
    const user = await userRepostiry.findByEmailWithPassword(email);
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
    const { accessToken, refreshToken } = generateTokens({
        id: user._id,
        role: user.role
    });
    user.lastLogin = new Date();
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, accessToken, refreshToken, token: accessToken };
};

const refreshAuthToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error("Refresh token required");
    }
    const decoded = verifyRefreshToken(refreshToken);
    const user = await userRepostiry.findById(decoded.id);
    if (!user) {
        throw new Error("User not found");
    }
    const tokens = generateTokens({
        id: user._id,
        role: user.role
    });
    return { user, ...tokens };
};

const forgotPassword = async ({ email }) => {
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const user = await userRepostiry.findByEmail(cleanEmail);
    if (!user) {
        throw new Error("No account found with this email address");
    }
    const otp = generateOTP();
    await otpService.saveResetOTP(cleanEmail, { email: cleanEmail, otp });
    await emailService.sendResetOTP(cleanEmail, otp);
    return {
        success: true,
        message: "Password reset OTP sent to your email address."
    };
};

const resetPassword = async ({ email, otp, newPassword }) => {
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const resetData = await otpService.getResetOTP(cleanEmail);
    if (!resetData) {
        throw new Error("OTP expired or invalid. Please request a new code.");
    }
    if (String(resetData.otp) !== String(otp).trim()) {
        throw new Error("Invalid OTP code. Please verify the code sent to your email.");
    }
    const user = await userRepostiry.findByEmailWithPassword(cleanEmail);
    if (!user) {
        throw new Error("User not found");
    }
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    await otpService.deleteResetOTP(cleanEmail);

    return {
        success: true,
        message: "Password reset successfully! You can now log in with your new password."
    };
};

module.exports = { signup, verifyOTP, login, refreshAuthToken, forgotPassword, resetPassword };