const mongoose = require('mongoose');

const jobOfferSchema = new mongoose.Schema({
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
    payment:{
        type: Number,
        required: true
    },
    jobRole:{
        type: String,
        required: true
    },
    jobType:{
        type: Number,
        enums: [0, 1, 2, 3], // 0: hours, 1: days, 2: weeks, 3: months
        required: true
    },
    jobDescription:{
        type: String,
        required: true
    },
    startDate:{
        type: Date,
        required: true
    },
    endDate:{
        type: Date,
        required: true
    },
    termAndCondition:{  //for uploading T&C documents
        path: [String]
    },
    isAcceptedByFreelancer:{
        type: Number,
        enums: [0, 1, 2], // 0: no-response, 1: accepted, 2: rejected
        default: 0
    }
}, {timestamps: true});

const JobOffer = mongoose.model('sp_job_offer', jobOfferSchema);
module.exports = JobOffer