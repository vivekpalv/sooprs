const router = require('express').Router();
const upload = require('../middleware/multerConfig');

const { createLead, approveBid, approveMilestone, assignLead, updateMilestoneToInProgress, completeMilestone, uploadRequirements, requestManagerLead } = require('../controller/userController/leadController');
const { createOrder, approveOrderRequirementsByClient, uploadOrderRequirements, gigOrderCancelByClient } = require('../controller/userController/gigController');
const { provideRating, provideFeedbackOrRatingToGig } = require('../controller/userController/rating');
const { requestManagerJob, makeJobOffer, sendSalary, completeJobOtp, completeJob} = require('../controller/userController/hire');

//Lead
router.post('/createLead', upload.array('attachments', 10), createLead);
router.post('/approveBid/:bidId', approveBid);
router.post('/assignLead/:bidId', assignLead);
router.post('/approveMilestone/:milestoneId', approveMilestone);
router.post('/updateMilestoneToInProgress/:milestoneId', updateMilestoneToInProgress); //After payment
router.post('/completeMilestone/:milestoneId', completeMilestone);
router.patch('/uploadRequirements', upload.array('attachments', 10), uploadRequirements);
router.post('/requestManagerLead', requestManagerLead);

//Gig
router.post('/createOrder', createOrder);
router.patch('/uploadOrderRequirements', upload.array('attachments', 10), uploadOrderRequirements);
router.patch('/approveOrderRequirementsByClient', approveOrderRequirementsByClient);
router.patch('/gigOrderCancelByClient', gigOrderCancelByClient);

// ************************** for client only **************************
// //Lead
// router.post('/createLead', upload.array('attachments', 10), createLead);
// router.post('/approveBid/:bidId', approveBid);
// router.post('/assignLead/:bidId', assignLead);
// router.post('/approveMilestone/:milestoneId', approveMilestone);
// router.post('/updateMilestoneToInProgress/:milestoneId', updateMilestoneToInProgress); //After payment
// router.post('/completeMilestone/:milestoneId', completeMilestone); //After milestone completion

//Rating
router.post('/provideRating', provideRating);
router.post('/provideFeedbackOrRatingToGig', provideFeedbackOrRatingToGig);

//Hire
router.post('/requestManagerJob', requestManagerJob);
router.post('/makeJobOffer', makeJobOffer);


module.exports = router;