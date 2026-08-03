const User = require('../models/user.model');

const findByEmail = async (email) => {
    return await User.findOne({ email });
};

const findByEmailWithPassword = async (email) => {
    return await User.findOne({ email }).select('+password');
};

const createUser = async (userData) => {
    return await User.create(userData);
};

const findById = async (userId) => {
    return await User.findById(userId);
};

module.exports = {
    findByEmail,
    findByEmailWithPassword,
    createUser,
    findById,
};