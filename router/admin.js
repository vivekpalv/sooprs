const router = require('express').Router();
const upload = require('../middleware/multerConfig');

const {addCategory, createSkill, updatingChargingPercentage, createCredit} = require('../controller/admin/admin');

//Get
router.post('/addCategory', addCategory);

//skill
router.post('/createSkill', upload.single('badge'),createSkill);

//Credit
router.post('/updatingChargingPercentage/:percentage', updatingChargingPercentage);
router.post('/createCredit', createCredit);


module.exports = router;