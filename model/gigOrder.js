const mongoose = require('mongoose');

const gigOrderSchema = new mongoose.Schema({
    gigId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_gig',
        required: true
    },
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
    orderAmount:{
        type: Number,
        required: true
    },
    razorpayOrderId:{
        type: String
    },
    razorpayPaymentId:{
        type: String
    },
    paymentStatus:{
        type: Number,
        enums: [0, 1, 2], // 0: pending, 1: successfull, 2: failed
        default: 0
    },
    deadline:{
        type: Date
    },
    orderRequirements:{
        description: {type: String},
        path: [String]
    },
    isRequirementApproved:{
        type: Number,
        emums: [0, 1, 2, 3], // 0: No-one, 1: by-client, 2: by-professional, 3: by-both
        default: 0,
    },
    orderStatus:{
        type: Number,
        enums: [0, 1, 2, 3, 4], // 0: not-started, 1: In-progress, 2: completed, 3: cancelled-by-client, 4: cancelled-by-professional
        default: 0
    }

}, {timestamps: true});

const GigOrder = mongoose.model('sp_gig_order', gigOrderSchema);
module.exports = GigOrder