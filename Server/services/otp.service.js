const {redisClient}=require('../config/redis')

const saveOTP = async (email, data) => {
    const key = `signup:${email}`;
    await redisClient.set(
        key,
        JSON.stringify(data),
        {
            EX: 300,
            ex: 300
        }
    );
};

const getOTP = async (email) => {
    const key = `signup:${email}`;
    const data = await redisClient.get(key);
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
};

const deleteOTP = async (email) => {
    const key = `signup:${email}`;
    await redisClient.del(key);
};

const saveResetOTP = async (email, data) => {
    const key = `reset:${email}`;
    try {
        if (redisClient && redisClient.isReady) {
            await redisClient.set(key, JSON.stringify(data), { EX: 600 });
            return;
        }
    } catch (e) {}

    // Fallback in-memory map
    global.resetOtpMap = global.resetOtpMap || new Map();
    global.resetOtpMap.set(key, { ...data, expiresAt: Date.now() + 600000 });
};

const getResetOTP = async (email) => {
    const key = `reset:${email}`;
    try {
        if (redisClient && redisClient.isReady) {
            const data = await redisClient.get(key);
            if (!data) return null;
            return typeof data === 'string' ? JSON.parse(data) : data;
        }
    } catch (e) {}

    global.resetOtpMap = global.resetOtpMap || new Map();
    const item = global.resetOtpMap.get(key);
    if (!item || Date.now() > item.expiresAt) return null;
    return item;
};

const deleteResetOTP = async (email) => {
    const key = `reset:${email}`;
    try {
        if (redisClient && redisClient.isReady) {
            await redisClient.del(key);
            return;
        }
    } catch (e) {}

    global.resetOtpMap = global.resetOtpMap || new Map();
    global.resetOtpMap.delete(key);
};

module.exports = {
    saveOTP,
    getOTP,
    deleteOTP,
    saveResetOTP,
    getResetOTP,
    deleteResetOTP
};