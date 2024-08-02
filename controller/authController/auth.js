const User = require('../../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const {generateUniqueSlug} = require('../../service/slugService');
const {isEmailValid, isMobileValid, isPasswordValid} = require('../../service/validation');

dotenv.config();


// Register
exports.register = async (req, res) => {
    const {name, email, mobile, password, country, isBuyer} = req.body;

    // Validations
    if(!name || !email || !mobile || !password || !country){return res.status(400).json({message: '(name, email, mobile, password, country) fields are required'});}
    // if(String(mobile).length !== 10 || isNaN(mobile)){return res.status(400).json({message: 'Mobile is must be a number && must be of 10 digits'});}
    if(password.length < 6){return res.status(400).json({message: 'Password must be atleast 6 characters long'});}
    if(isBuyer !== 0 && isBuyer !== 1){return res.status(400).json({message: 'isBuyer must be either 0 or 1'});}
    if(!isEmailValid(email)){return res.status(400).json({message: 'Email is invalid'});}
    if(!isMobileValid(mobile)){return res.status(400).json({message: 'Mobile number is invalid'});}
    if(!isPasswordValid(password)){return res.status(400).json({message: 'Password must be of 8 characters and should contain atleast one uppercase, one lowercase, one number and one special character'});}

    try {
        const user = await User.findOne({email: email});
        const userMobile = await User.findOne({mobile: mobile});
        if(user){return res.status(400).json({message: `User already exists with this '${email}' email`, status: 400});}
        if(userMobile){return res.status(400).json({message: `User already exists with this '${mobile}' mobile number`, status: 400});}

        const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
        const newUser = new User({name: name, email: email, mobile: mobile, password: hashedPassword, country: country, isBuyer: isBuyer});
        const slug = await generateUniqueSlug(name);
        newUser.slug = slug;
        await newUser.save();

        // Generate token
        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRY});

        return res.status(200).json({message: 'Registered successfully', token: token, user: newUser, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

// Login
exports.login = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){return res.status(400).json({message: '(email, password) fields are required'});}

    try {
        const user = await User.findOne({email: email});
        if(!user){return res.status(400).json({message: `User not found with this '${email}' email`, status: 400});}
        const isMatch = await bcrypt.compare(password, user.password); // if you don't use "await" here, it will return a promise instead of a boolean and then user can login without correct password
        // console.log("is Match: ",isMatch);
        if(!isMatch){return res.status(400).json({message: 'Please pass the correct password', status: 400});}

        // Generate token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRY});

        return res.status(200).json({message: 'Logged in successfully', token: token, user: user, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};
