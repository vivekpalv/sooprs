const mongoose = require('mongoose');
const SubCategory = require('./subCategory');

const subSubCategorySchema = new mongoose.Schema({
    subSubCategoryType:{
        type: String,
        required: true
    },
    subCategoryId:{
        type: mongoose.Schema.Types.ObjectId,
        // ref: SubCategory,
        ref: 'sp_sub_category',
        required: true
    },

}, {timestamps: true});

const SubSubCategory = mongoose.model('sp_sub_sub_category', subSubCategorySchema); 
module.exports = SubSubCategory