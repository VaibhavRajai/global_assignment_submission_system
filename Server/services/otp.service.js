const {redisClient}=require('../config/redis')

const saveOTP=async(email,data)=>{
    const key=`signup:${email}`;
    await redisClient.set(
        key,
        JSON.stringify(data),
        {
            EX:300,
            ex:300
        }
    )
}

const getOTP=async(email)=>{
    const key=`signup:${email}`
    const data=await redisClient.get(key);
    if(!data)return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
}

const deleteOTP=async(email)=>{
     const key = `signup:${email}`;

    await redisClient.del(key);
}
module.exports = {
    saveOTP,
    getOTP,
    deleteOTP,
};