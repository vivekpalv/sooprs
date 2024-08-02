const Category = require('../../model/category');
const SubCategory = require('../../model/subCategory');
const SubSubCategory = require('../../model/subSubCategory');
const Skill = require('../../model/skill');
const CreditLogic = require('../../model/creditLogic');
const Credit = require('../../model/credit');

// Add category
exports.addCategory = async (req, res) => {
    const {categoryType, subCategoryType, subSubCategoryType} = req.body;
    try {

        if(categoryType && !subCategoryType && !subSubCategoryType){
            // console.log(1);
            if(!categoryType){
                return res.status(400).json({message: 'categoryType is required', status: 400});
            }
            const isCategoryExist = await Category.findOne({categoryType: categoryType.toUpperCase()});
            if(isCategoryExist){return res.status(400).json({message: 'Category already exist', status: 400});}

            const category = new Category({categoryType: categoryType.toUpperCase()});
            await category.save();
            return res.status(200).json({message: 'Category added successfully', category: category, status: 200});
        }

        if(categoryType && subCategoryType && !subSubCategoryType){
            // console.log(2);
            const isCategoryExist = await Category.findOne({categoryType: categoryType.toUpperCase()});
            const isSubCategoryExist = await SubCategory.findOne({subCategoryType: subCategoryType.toUpperCase()});
            if(!isCategoryExist){return res.status(400).json({message: 'Category not exist', status: 400});}
            if(isSubCategoryExist){return res.status(400).json({message: 'Sub category already exist', status: 400});}

            const subCategory = new SubCategory({subCategoryType: subCategoryType.toUpperCase(), categoryId: isCategoryExist._id});
            await subCategory.save();
            return res.status(200).json({message: 'Sub category added successfully', subCategory: subCategory, status: 200});
        }

        if(categoryType && subCategoryType && subSubCategoryType){
            // console.log(3);
            const isCategoryExist = await Category.findOne({categoryType: categoryType.toUpperCase()});
            const isSubCategoryExist = await SubCategory.findOne({subCategoryType: subCategoryType.toUpperCase()});
            const isSubSubCategoryExist = await SubSubCategory.findOne({subSubCategoryType: subSubCategoryType.toUpperCase()});
            if(!isCategoryExist){return res.status(400).json({message: 'Category not exist', status: 400});}
            if(!isSubCategoryExist){return res.status(400).json({message: 'Sub category not exist', status: 400});}
            if(isSubSubCategoryExist){return res.status(400).json({message: 'Sub sub category already exist', status: 400});}

            const subSubCategory = new SubSubCategory({subSubCategoryType: subSubCategoryType.toUpperCase(), subCategoryId: isSubCategoryExist._id});
            await subSubCategory.save();
            return res.status(200).json({message: 'Sub sub category added successfully', subSubCategory: subSubCategory, status: 200});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//create skill
exports.createSkill = async (req, res) => {
    const {name} = req.body;
    if(!name){
        return res.status(400).json({message: 'name is required', status: 400});
    }
    if(!req.file){
        return res.status(400).json({message: 'Image is required', status: 400});
    }

    try {
        const isSkillExist = await Skill.findOne({name: name.toUpperCase()});
        if(isSkillExist){
            return res.status(400).json({message: 'Skill already exist', status: 400});
        }

        const uploadDirIndex = req.file.path.indexOf('uploads');
        const relativePath = req.file.path.substring(uploadDirIndex);
        const imagePath = {path: relativePath};

        const skill = new Skill({name: name.toUpperCase()});
        skill.badge = imagePath;
        await skill.save();
        return res.status(200).json({message: 'Skill created successfully', skill: skill,status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//create credit logic
exports.updatingChargingPercentage = async (req, res) => {
    const percentage = req.params.percentage;
    if(!percentage || percentage<=0 || percentage>100){return res.status(400).json({message: 'percentage is required and must be between 1-100', status: 400});}
    if(isNaN(percentage)){return res.status(400).json({message: 'percentage must be a number', status: 400});}

    try {
        const creditLogic = await CreditLogic.findOne();
        if(!creditLogic){
            const newCreditLogic = new CreditLogic({chargingPercentage: percentage});
            await newCreditLogic.save();
            return res.status(200).json({message: 'Charging percentage added successfully', chargingPercentage: newCreditLogic.chargingPercentage, status: 200});
        }else{
            creditLogic.chargingPercentage = percentage;
            await creditLogic.save();
            return res.status(200).json({message: 'Charging percentage updated successfully', chargingPercentage: creditLogic.chargingPercentage, status: 200});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//create spCredit/wallet by user_id
exports.createCredit = async (req, res) => {
    const {professionalUserId, creditAmount} = req.body;
    if(!professionalUserId || !creditAmount){return res.status(400).json({message: 'userId and createAmount fields are required', status: 400});}
    if(isNaN(creditAmount)){return res.status(400).json({message: 'createAmount must be a number', status: 400});}

    try {
        const credit = new Credit({userId: professionalUserId, availableAmount: creditAmount});
        await credit.save();
        return res.status(200).json({message: 'Credit created successfully', credit: credit, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//get category heirarchy
exports.categoryHeirarchy=async(req,res)=>{
    try {
        const categoryHierarchy = [];
        const subCategoryHierarchy = [];
        const categories = await Category.find();
        for (let i = 0; i < categories.length; i++) {
            const subCategories = await SubCategory.find({categoryId: categories[i]._id});
            for (let j = 0; j < subCategories.length; j++) {
                const subSubCategories = await SubSubCategory.find({subCategoryId: subCategories[j]._id});
                subCategoryHierarchy.push({subCategory: subCategories[j], subSubCategory: subSubCategories});
            }
            categoryHierarchy.push({category: categories[i], subCategory: subCategoryHierarchy});
        }
        return res.status(200).json({categoryHierarchy: categoryHierarchy, status: 200});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//Get all sub-categories of a category by category id
exports.allSubCategory=async(req,res)=>{
    const {categoryId}=req.params;
    if(!categoryId){
        return res.status(400).json({message: 'categoryId is required', status: 400});
    }
    try {
        const subCategories = await SubCategory.find({categoryId: categoryId});
        return res.status(200).json({subCategories: subCategories, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};


