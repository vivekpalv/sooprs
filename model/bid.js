const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    leadId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_lead'
    },
    professionalUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bidAmount:{
        type: Number,
        required: true
    },
    usedCredits:{
        type: Number,
        required: true
    },
    bidMessage:{
        type: String
    },
    bidStatus:{
        type: Number,
        enums: [0, 1], // 0: placed, 1: accepted
        default: 0
    },
    isActive:{
        type: Number,
        emums: [0, 1],
        default: 1
    }
}, {timestamps: true});

const Bid = mongoose.model('sp_bid', bidSchema);
module.exports = Bid