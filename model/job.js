const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiterUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancerUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    managerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_manager',
    },
    jobStatus:{
        type: Number,
        enums: [0, 1, 2, 3], // 0: not-started, 1: In-progress, 2: completed, 3: cancelled
        default: 0
    },
    jobDetails:{
        type: mongoose.Schema.Types.ObjectId, //object id of jobOffer
        ref: 'sp_job_offer'
    },
    salaryHistory:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_salary'
    }]
    // managerRequests:[{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'sp_manager_request'
    // }]
}, {timestamps: true});

const Job = mongoose.model('sp_job', jobSchema);
module.exports = Job

