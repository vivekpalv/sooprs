const mongoose = require('mongoose');
const Category = require('./category');

const subCategorySchema = new mongoose.Schema({
    subCategoryType:{
        type: String,
        required: true
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_category',
        required: true
    }

}, {timestamps: true});

const SubCategory = mongoose.model('sp_sub_category', subCategorySchema);
module.exports = SubCategory