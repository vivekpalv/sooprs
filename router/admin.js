const router = require('express').Router();
const upload = require('../middleware/multerConfig');

const {addCategory, createSkill, updatingChargingPercentage, createCredit, jobManagerRequest, leadManagerRequest} = require('../controller/admin/admin');
const {approveKyc, rejectKyc, getKycByUserId} = require('../controller/admin/kycAdmin');

//Get
router.post('/addCategory', addCategory);

//skill
router.post('/createSkill', upload.single('badge'),createSkill);

//Credit
router.post('/createCredit', createCredit);
router.post('/updatingChargingPercentage/:percentage', updatingChargingPercentage);

//KYC
router.get('/getKycByUserId/:userId', getKycByUserId);
router.post('/approveKyc', approveKyc);
router.post('/rejectKyc', rejectKyc);

//Manager Request
router.post('/jobManagerRequest', jobManagerRequest);
router.post('/leadManagerRequest', leadManagerRequest);


module.exports = router;