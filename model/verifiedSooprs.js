const mongoose = require('mongoose');
const User = require('./user');

const verifiedSooprsSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedFrom:{
        type: Date,
        required: true
    },
    verifiedTo:{
        type: Date,
        required: true
    },
    amount:{
        type: Number,
        required: true
    }
    
}, {timestamps: true});

const VerifiedSooprs = mongoose.model('sp_verified_sooprs', verifiedSooprsSchema);
module.exports = VerifiedSooprs