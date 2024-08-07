const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId, //user who provide rating
        ref: 'User',
        required: true
    },
    ratedUserId:{
        type: mongoose.Schema.Types.ObjectId, //user who take rating
        ref: 'User',
        required: true
    },
    gigId:{
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'sp_gig'
    },
    rating:{
        type: Number,
        enums: [1, 2, 3, 4, 5], // 1: worst, 2: bad, 3: good, 4: very good, 5: excellent,
        min: 1,
        max: 5,
        required: true
    }

}, {timestamps: true});

const Rating = mongoose.model('sp_rating', ratingSchema);
module.exports = Rating