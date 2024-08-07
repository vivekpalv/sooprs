const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    clientUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gigId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_gig',
        required: true
    },
    feedbackMessage:{
        type: String,
        required: true
    },
    rating:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_rating'
    }
    
}, {timestamps: true});

const Feedback = mongoose.model('sp_feedback', feedbackSchema);
module.exports = Feedback