const multer = require('multer');
const path = require('path');

//Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniquePreffix}-${file.originalname.replace(/\s/g, '-')}`);  //Replacing white spaces with hyphens.
    }
});

//File Filter Configuration for multer to accept only jpeg and png files.
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error('Only .jpeg, .png, and .pdf formats are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;