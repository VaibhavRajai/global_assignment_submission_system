const jwt = require('jsonwebtoken');

const getAccessSecret = () => process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'default_access_secret';
const getRefreshSecret = () => process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'default_refresh_secret');

const generateAccessToken = (payload) => {
    return jwt.sign(payload, getAccessSecret(), {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
    });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, getRefreshSecret(), {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
    });
};

const generateTokens = (payload) => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, getAccessSecret());
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, getRefreshSecret());
};

// Legacy alias for single-token usage
const generateToken = (payload) => generateAccessToken(payload);

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    generateToken
};