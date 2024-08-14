const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    jobId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_job',
        required: true
    },
    paymentAmount:{
        type: Number,
        required: true
    },
    paymentStatus:{
        type: Number,
        enums: [0, 1, 2], // 0: pending, 1: successful, 2: failed
        default: 0
    }
}, {timestamps: true});

const Salary = mongoose.model('sp_salary', salarySchema);
module.exports = Salary