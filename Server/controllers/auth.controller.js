const authServices = require('../services/auth.service');

const signup = async (req, res, next) => {
    try {
        const response = await authServices.signup(req.body);
        return res.status(201).json(response);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Signup failed'
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { user, accessToken, refreshToken, token } = await authServices.verifyOTP(req.body);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user,
            accessToken,
            refreshToken,
            token
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'OTP verification failed'
        });
    }
};

const login = async (req, res) => {
    try {
        const { user, accessToken, refreshToken, token } = await authServices.login(req.body);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user,
            accessToken,
            refreshToken,
            token
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.body?.refreshToken || req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required'
            });
        }
        const { accessToken, refreshToken: newRefreshToken, user } = await authServices.refreshAuthToken(token);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken,
            token: accessToken,
            user
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message || 'Invalid or expired refresh token'
        });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Logout failed'
        });
    }
};

module.exports = { signup, verifyOTP, login, refreshToken, logout };