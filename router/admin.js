const router = require('express').Router();
const upload = require('../middleware/multerConfig');

const {addCategory, createSkill, updatingChargingPercentage, createCredit} = require('../controller/admin/admin');
const {approveKyc, rejectKyc, getKycByUserId} = require('../controller/admin/kycAdmin');

//Get
router.post('/addCategory', addCategory);

//skill
router.post('/createSkill', upload.single('badge'),createSkill);

//Credit
router.post('/updatingChargingPercentage/:percentage', updatingChargingPercentage);
router.post('/createCredit', createCredit);

//KYC
router.get('/getKycByUserId/:userId', getKycByUserId);
router.post('/approveKyc', approveKyc);
router.post('/rejectKyc', rejectKyc);


module.exports = router;