const nodemailer=require('nodemailer')

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

const sendOTP=async(email,otp)=>{
    try{
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:email,
            subject:"GlobalAssign - Email Verification",
            html:`<h2>Email Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP is valid for 5 minutes only</p>
            `
        })
        console.log('OTP Sent')
    }
    catch(error){
         console.error("Email Error:", error);
        throw new Error("Failed to send OTP");
    }
}

module.exports={sendOTP}