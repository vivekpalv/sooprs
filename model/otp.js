const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otpCode:{
        type: String,
        required: true
    },
    userId:{ //if otp for email verification in that case professional and user id not matter
        type: mongoose.Schema.Types.ObjectId, // OTP receiver
        ref: 'User',
        required: true
    },
    gigOrderId:{  //assign this variable only if otp is for gigOrder
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_gig'
    },
    senderId:{
        type: mongoose.Schema.Types.ObjectId, // OTP sender
        ref: 'User'
    },
    jobId:{  //assign this variable only if otp is for job
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_job'
    },
    createdAt:{
        type: Date,
        default: Date.now,
        expires: 300
    }
});

const Otp = mongoose.model('sp_otp', otpSchema);
module.exports = Otp