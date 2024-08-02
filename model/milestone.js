const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    leadId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_lead'
    },
    milestoneTitle:{
        type: String
    },
    milestoneDescription:{
        type: String
    },
    milestoneAmount:{
        type: Number
    },
    milestoneStatus:{
        type: Number,
        enums: [0, 1, 2], // 0: not-started, 1: In-progress, 2: completed
        default: 0
    },
    milestomeDeadline:{
        type: Date
    },
    isApprovedByClient:{
        type: Number,
        emums: [0, 1], // 0: No, 1: Yes
        default: 0
    },
    isPaymentReceived:{
        type: Number,
        emums: [0, 1], // 0: No, 1: Yes
        default: 0
    }
}, {timestamps: true});

const Milestone = mongoose.model('sp_milestone', milestoneSchema);
module.exports = Milestone