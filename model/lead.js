const mongoose = require('mongoose');
const User = require('./user');

const leadSchema = new mongoose.Schema({
    // userId:{  //change to clientUserId
    clientUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    email:{
        type: String
    },
    mobile:{
        type: Number
    },
    skillsRequired:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'sp_skill'
    },
    subSubCategory:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'sub_sub_category'
    }, 
    leadTitle:{
        type: String
    },
    leadDescription:{
        type: String
    },
    leadAttachments:{
        path: [String]
    },
    leadRequirements:{ //user can post requirements after finalizing over chat.
        path: [String]
        // approvedBy: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}] //approved by professional
    },
    minBudget:{
        type: Number
    },
    maxBudget:{
        type: Number
    },
    isActive:{
        type: Number,
        emums: [0, 1], // 0: not-active, 1: active
        default: 1
    },
    leadStatus:{
        type: Number,
        enums: [0, 1, 2], // 0: not-assigned, 1: In-progress, 2: completed
        default: 0
    },
    assignedTo:{  //user can asign lead to professional after finalizing over chat.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    managerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_manager'
    },
    bids:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_bid'
    }], 
    milestones:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_milestone'
    }]

}, {timestamps: true});

const Lead = mongoose.model('sp_lead', leadSchema);
module.exports = Lead