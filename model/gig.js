const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    userId:{  //treat as professional
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    gigImg:{
        path: [String]
    },
    usingSkills:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'sp_skill'
    },
    completionDays:{
        type: Number,
        required: true
    },
    categoryId:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'sp_category'
    },
    gigOrders:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'sp_gig_order'
    },
    feedbacks:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'sp_feedback'
    },
    isActive:{
        type: Number,
        enums: [0, 1], // 0: not-active, 1: active
        default: 1
    }
    
}, {timestamps: true});

const Gig = mongoose.model('sp_gig', gigSchema);
module.exports = Gig