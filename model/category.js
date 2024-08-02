const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryType:{
        type: String,
        required: true
    }
}, {timestamps: true});

const Category = mongoose.model('sp_category', categorySchema);
module.exports = Category