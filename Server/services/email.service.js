const nodemailer=require('nodemailer')

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

const sendOTP = async (email, otp) => {
    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "GlobalAssign - Email Verification",
                html: `<h2>Email Verification</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 5 minutes only</p>`
            });
            console.log('OTP Sent');
        } else {
            console.log(`[Email DEV Fallback] Signup OTP for ${email}: ${otp}`);
        }
    } catch (error) {
        console.error("Email Error:", error);
        console.log(`[Email DEV Fallback] Signup OTP for ${email}: ${otp}`);
    }
};

const sendResetOTP = async (email, otp) => {
    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "GlobalAssign - Reset Your Password",
                html: `<h2>Password Reset Request</h2>
                <p>Use the following 6-digit OTP code to reset your password:</p>
                <h1 style="letter-spacing:4px;">${otp}</h1>
                <p>This OTP code is valid for 10 minutes only.</p>`
            });
            console.log(`Password reset OTP sent to ${email}`);
        } else {
            console.log(`[Email DEV Fallback] Password Reset OTP for ${email}: ${otp}`);
        }
    } catch (error) {
        console.error("Email Error:", error);
        console.log(`[Email DEV Fallback] Password Reset OTP for ${email}: ${otp}`);
    }
};

module.exports = { sendOTP, sendResetOTP };