const mongoose = require('mongoose');
const CreditHistory = require('./creditHistory');
const User = require('./user');

const creditSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    availableAmount:{
        type: Number,
        required: true
    },
    creditHistory:[{
        type: mongoose.Schema.Types.ObjectId,
        // ref: CreditHistory
        ref: 'sp_creditHistory'
    }],
}, {timestamps: true});

const Credit = mongoose.model('sp_credit', creditSchema);
module.exports = Credit