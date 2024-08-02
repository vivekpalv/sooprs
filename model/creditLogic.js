const mongoose = require('mongoose');

const logicSchema = new mongoose.Schema({
    chargingPercentage:{
        type: Number,
        min: 0,
        max: 100,
        required: true
    }
},{timestamps: true});

const CreditLogic = mongoose.model('sp_creditLogic', logicSchema);
module.exports = CreditLogic;