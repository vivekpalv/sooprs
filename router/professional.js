const router = require('express').Router();
const upload = require('../middleware/multerConfig');

const { addVerifiedSkills, addSkill, uploadResume } = require('../controller/userController/user');
const { doKyc } = require('../controller/userController/kyc');
const { createMilestone, doBid } = require('../controller/userController/leadController');
const { createGig, approveOrderRequirementsByProfessional, gigOrderCancelByProfessional, requestOtpForGigOrderCompletion, completeOrderByProfessional } = require('../controller/userController/gigController');
const { acceptOrRejectJobOffer } = require('../controller/userController/hire');

//Actions
router.patch('/addSkill', addSkill); //both verifiedSkill and skill

//Profile
router.post('/uploadResume', upload.single('resume'), uploadResume);

//KYC
router.post('/doKyc', upload.array('images', 2), doKyc);

//Lead
router.post('/createMilestone', createMilestone);
router.post('/doBid', doBid);

//Gig
router.post('/createGig', upload.array('images', 10), createGig);
router.patch('/approveOrderRequirementsByProfessional', approveOrderRequirementsByProfessional);
router.patch('/gigOrderCancelByProfessional', gigOrderCancelByProfessional);
router.patch('/requestOtpForGigOrderCompletion/:id', requestOtpForGigOrderCompletion);
router.patch('/completeOrderByProfessional', completeOrderByProfessional);

//Hire
router.patch('/acceptOrRejectJobOffer', acceptOrRejectJobOffer);

module.exports = router;