const router = require('express').Router();
const upload = require('../middleware/multerConfig');

const { currentUser ,switchToBuyer, updateProfile, uploadProfileImage } = require('../controller/userController/user');

//Profile
router.get('/currentUser', currentUser);
router.patch('/updateProfile', updateProfile);
router.patch('/profileImage', upload.single('image'), uploadProfileImage);
router.patch('/switchToBuyer', switchToBuyer);

module.exports = router;