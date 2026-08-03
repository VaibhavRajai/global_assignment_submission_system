const {createClient}=require('redis')

const redisClient=createClient({
    uri:process.env.REDIS_URL
})
redisClient.on("error",(err)=>{
    console.error("Redis Error",err)
})
redisClient.on("connect",()=>{
    console.log("Redis connected")
})

const connectRedis=async()=>{
    try{
        await redisClient.connect()
    }
    catch(error){
        console.error("Redis Connection Failed");
        console.error(err);
        process.exit(1);
    }
}
module.exports={
    redisClient,connectRedis
}