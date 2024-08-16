const Category = require('../../model/category');
const SubCategory = require('../../model/subCategory');
const SubSubCategory = require('../../model/subSubCategory');
const Skill = require('../../model/skill');
const CreditLogic = require('../../model/creditLogic');
const Credit = require('../../model/credit');
const mongoose = require('mongoose');
const User = require('../../model/user');
const ManagerRequest = require('../../model/managerRequest');
const Manager = require('../../model/manager');
const Job = require('../../model/job');
const Lead = require('../../model/lead');

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

    if(!name){return res.status(400).json({message: 'name is required', status: 400});}
    if(!req.file){return res.status(400).json({message: 'Image is required', status: 400});}

    try {
        const isSkillExist = await Skill.findOne({name: name.toUpperCase()});
        if(isSkillExist){return res.status(400).json({message: 'Skill already exist', status: 400});}

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
    if(!mongoose.Types.ObjectId.isValid(professionalUserId)){return res.status(400).json({message: `Invalid id: ${professionalUserId}`, status: 400});}
    if(isNaN(creditAmount) || !creditAmount ){return res.status(400).json({message: 'createAmount is required and must be a number', status: 400});}

    try {
        const user = await User.findById(professionalUserId);
        if(!user){return res.status(400).json({message: `User not found for this id: ${professionalUserId}`, status: 400});}

        const isCreditExist = await Credit.findOne({userId: professionalUserId});
        if(isCreditExist){ return res.status(400).json({message: `sp_credit already exist for this userId: ${professionalUserId}`, status: 400});}

        const credit = new Credit({userId: professionalUserId, availableAmount: creditAmount});
        await credit.save();
        user.spCredits = credit._id;
        await user.save();
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

//accept or reject manager request for 'job'
exports.jobManagerRequest=async(req,res)=>{
    const {managerRequestId, managerId, isAccepted, message}=req.body;

    if(!mongoose.Types.ObjectId.isValid(managerRequestId)){return res.status(400).json({message: `Invalid id: ${managerRequestId}`, status: 400});}
    if(typeof isAccepted!== 'boolean'){return res.status(400).json({message: 'acceptOrReject must be true/false ( false: reject | true: accept ) ', status: 400});}
    if(!message){return res.status(400).json({message: 'message is required', status: 400});}

    try {
        const managerRequest = await ManagerRequest.findById(managerRequestId);
        const job = await Job.findById(managerRequest.jobId);
        const manager = await Manager.findById(managerId);

        if(!managerRequest || !job){return res.status(400).json({message: `managerRequest or job not found | managerRequestId: ${managerRequestId} | jobId: ${managerRequest.jobId}`, status: 400});}
        if(!manager){return res.status(400).json({message: `Manager not found | managerId: ${managerId}`, status: 400});}
        if(managerRequest.status!==0){return res.status(400).json({message: `Manager request already accepted(1) or rejected(2) | request status: ${managerRequest.status}`, status: 400});}

        if(isAccepted){
            managerRequest.status = 1; //accepted
            managerRequest.message = message;
            managerRequest.managerId = managerId;
            // job.managerId = managerRequest.managerId;

            job.managerId = managerId;  // **assigning managerId to job
            manager.assignedJobs.push(job._id);  // **assigning jobId to manager

            await job.save();
            await managerRequest.save();
            await manager.save();

            return res.status(200).json({message: 'Manager request accepted successfully', managerRequest: managerRequest, status: 200});
        } else {
            
            managerRequest.status = 2; //rejected
            managerRequest.message = message;

            await managerRequest.save();
            return res.status(200).json({message: 'Manager request rejected successfully', managerRequest: managerRequest, status: 200});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//accept or reject manager request for 'lead'
exports.leadManagerRequest=async(req,res)=>{
    const {managerRequestId, managerId, isAccepted, message}=req.body;

    if(!mongoose.Types.ObjectId.isValid(managerRequestId) || !mongoose.Types.ObjectId.isValid(managerId)){return res.status(400).json({message: `Invalid id | managerRequestId: ${managerRequestId} | managerId: ${managerId}`, status: 400});};
    if(typeof isAccepted!== 'boolean'){return res.status(400).json({message: 'acceptOrReject must be true/false ( false: reject | true: accept ) ', status: 400});}
    if(!message){return res.status(400).json({message: 'message is required', status: 400});}

    try {
        const managerRequest = await ManagerRequest.findById(managerRequestId);
        const manager = await Manager.findById(managerId);
        const lead = await Lead.findById(managerRequest.leadId);

        if(!managerRequest){return res.status(400).json({message: `managerRequest not found | managerRequestId: ${managerRequestId}`, status: 400});}
        if(!manager){return res.status(400).json({message: `Manager not found | managerId: ${managerId}`, status: 400});}
        if(managerRequest.status!==0){return res.status(400).json({message: `Manager request already accepted(1) or rejected(2) | request status: ${managerRequest.status}`, status: 400});}

        if (isAccepted) {
            managerRequest.status = 1; //accepted
            managerRequest.message = message;
            managerRequest.managerId = managerId;

            lead.managerId = managerId;  // **assigning managerId to lead
            manager.assignedLeads.push(lead._id);  // **assigning leadId to manager

            await managerRequest.save();
            await lead.save();
            await manager.save();

            return res.status(200).json({message: 'Manager request accepted successfully', managerRequest: managerRequest, status: 200});
        } else {

            managerRequest.status = 2; //rejected
            managerRequest.message = message;

            await managerRequest.save();
            return res.status(200).json({message: 'Manager request rejected successfully', managerRequest: managerRequest, status: 200});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//get all manager requests by managerId
exports.allAcceptedManagerRequests=async(req,res)=>{
    const {managerId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(managerId)){return res.status(400).json({message: `Invalid manager id: ${managerId}`, status: 400});}

    try {
        const managerRequests = await ManagerRequest.find({managerId: managerId, status: 1}).populate('jobId').populate('leadId');
        return res.status(200).json({managerRequests: managerRequests, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};


