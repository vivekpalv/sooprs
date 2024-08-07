const router = require('express').Router();

const {categoryHeirarchy, allSubCategory} =  require('../controller/admin/admin');

//Get
router.get('/categoryHeirarchy', categoryHeirarchy);
router.get('/allSubCategory/:categoryId', allSubCategory);


module.exports = router;