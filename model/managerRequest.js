const mongoose = require('mongoose');

const managerRequestSchema = new mongoose.Schema({
    managerId:{  //if managerId is null, then it means request is pending or not accepted yet by admin | if managerId is not null, then it means request is accepted and assigned by admin
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_manager',
        // required: true
    },
    jobId:{ // only assign this key if managerRequest for a job
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_job',
        // required: true
    },
    leadId:{ // only assign this key if managerRequest for a lead
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_lead',
    },
    status:{ //if status is 0 more than 3 days, then it will be automatically rejected because of 'cron-job'
        type: Number,
        enums: [0, 1, 2], // 0: pending-request, 1: accepted-request, 2: rejected-request
        default: 0
    },
    message:{  //message can be set only by Admin (because only admin can accept/reject managerRequest to a job | this for providing reason/message for rejection/acceptance)
        type: String
    }
}, {timestamps: true});

const ManagerRequest = mongoose.model('sp_manager_request', managerRequestSchema);
module.exports = ManagerRequest