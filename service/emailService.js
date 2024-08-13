const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vivekpalvp0770@gmail.com', // Enter your email address
        pass: 'bgknyktnzuwtaqdt' // Enter your email password
    }
});

module.exports.sendEmailOtp = async (email, otp, subject, message) => {
    // console.log(email, otp);
    const mailOptions = {
        from: '', // Enter your email address
        to: email,
        // to: 'vivekpalvp0770gmail.com',
        subject: subject,
        text: `${message} ${otp}`
    };
    await transporter.sendMail(mailOptions);
};