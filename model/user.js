const mongoose = require('mongoose');
const Skill = require('./skill');
const Credit = require('./credit');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        unique: true,
        required: true
    },
    designation: {
        type: String
    },
    bio: {
        type: String,
    },
    organization: {
        type: String
    },
    resume: {
        path: String
    },
    image: {
        path: String
    },
    portfolioImages: {
        path: [String]
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String
    },
    isEmailVerified: { //verified email
        type: Number, 
        enums: [0, 1], // 0: No, 1: Yes
        default: 0
    },
    isVerifiedSooprs:{ //verified sooprs (example: twitter-verified)
        type: Number,
        enums: [0, 1], // 0: No, 1: Yes
        default: 0
    },
    isBuyer: {
        type: Number,
        enums: [0, 1], // 0: No, 1: Yes
        default: 0
    },
    isOpenToHire: {
        type: Number,
        enums: [0, 1], // 0: No, 1: Yes
        default: 0
    },
    kycStatus: {
        type: Number,
        enums: [0, 1, 2, 3], // 0: not verified, 1: submitedDocuments, 2: approved, 3: rejected
        default: 0
    },
    skills:[{  //known skills
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_skill'
    }],
    verifiedSkills: [{  //verified skills after giving test
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_skill',
    }],
    spCredits:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_credit'
    },
    
    leads: [{ //Leads created by client User
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_lead'
    }],
    gigs: [{ //Gigs created by proffessional User
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_gig'
    }],
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_rating'
    }],
    jobOffers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_job_offer'
    }],
    jobs: [{ //assigned jobs of proffessional User
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_job'
    }],
    providedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sp_job'
    }],

}, {timestamps: true});

const User = mongoose.model('user', userSchema);
module.exports = User;