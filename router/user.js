const router = require('express').Router();
const upload = require('../middleware/multerConfig');

const {currentUser, switchToBuyer, addVerifiedSkillsToUser, updateProfile, uploadProfileImage, uploadResume} = require('../controller/userController/user');
const {doKyc} = require('../controller/userController/kyc');
const { createLead, doBid, approveBid, approveMilestone, assignLead, createMilestone, updateMilestoneToInProgress, completeMilestone } = require('../controller/userController/leadController');

//Profile
router.get('/currentUser', currentUser);
router.patch('/updateProfile', updateProfile);
router.post('/uploadImage', upload.single('image'), uploadProfileImage);
router.post('/uploadResume', upload.single('resume'), uploadResume);

//Actions
router.post('/switchToBuyer', switchToBuyer);
router.post('/addVerifiedSkills', addVerifiedSkillsToUser);

//KYC
router.post('/doKyc', upload.array('images', 2), doKyc);

//Lead
router.post('/createLead', upload.array('attachments', 10),createLead);
router.post('/doBid', doBid);
router.post('/approveBid/:bidId', approveBid);
router.post('/assignLead/:bidId', assignLead);
router.post('/createMilestone', createMilestone);
router.post('/approveMilestone/:milestoneId', approveMilestone);
router.post('/updateMilestoneToInProgress/:milestoneId', updateMilestoneToInProgress);
router.post('/completeMilestone/:milestoneId', completeMilestone);

module.exports = router;