const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    senderUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    filePaths:{
        type: [String]
    },
    status:{
        type: Number,
        enums: [0, 1, 2, 3], // 0: sended, 1: read, 2: delivered, 3: deleted
        default: 0
    }

}, {timestamps: true});

const Message = mongoose.model('sp_message', userSchema);
module.exports = Message