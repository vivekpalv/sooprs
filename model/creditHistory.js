const mongoose = require('mongoose');
const User = require('./user');
const Credit = require('./credit');

const creditHistorySchema = new mongoose.Schema({
    creditId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_credit'
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    transactionAmount:{
        type: Number,
        required: true
    },
    transactionType:{
        type: Number,
        enums: [0, 1], // 0: debit/deducted, 1: credit/added
        required: true
    },
    remarks:{
        type: String
    }
}, {timestamps: true});

const CreditHistory = mongoose.model('sp_creditHistory', creditHistorySchema);
module.exports = CreditHistory