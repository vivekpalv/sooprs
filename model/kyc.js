const mongoose = require('mongoose');
const User = require('./user');

const kycSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validityFrom:{
        type: Date
    },
    validityTo:{
        type: Date
    },
    kycDocuments:[{
        path: String
    }],
    documentType:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    mobile:{
        type: Number
    },
    country:{
        type: String
    },
    city:{
        type: String
    },
    pincode:{
        type: Number
    }
    
}, {timestamps: true});

const Kyc = mongoose.model('sp_kyc', kycSchema);
module.exports = Kyc