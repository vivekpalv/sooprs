const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    profileImage:{
        path: String
    },
    experience: {
        type: Number,
        required: true // in months
    },
    technicalSkills: [{
        type: String
    }],
    softSkills: [{
        type: String
    }],
    assignedJobs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_job'
    }],
    assignedLeads:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_lead'
    }],
    
}, {timestamps: true});

const Manager = mongoose.model('sp_manager', managerSchema);
module.exports = Manager