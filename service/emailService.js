const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vivekpalvp0770@gmail.com', // Enter your email address
        pass: 'bgknyktnzuwtaqdt' // Enter your email password
    }
});

module.exports.sendEmailOtp = async (email, otp) => {
    const mailOptions = {
        from: '', // Enter your email address
        to: email,
        subject: 'OTP for Email Verification',
        text: `Your OTP for Email Verification is ${otp}`
    };
    await transporter.sendMail(mailOptions);
};