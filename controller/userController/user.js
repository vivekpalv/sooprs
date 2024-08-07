const Skill = require('../../model/skill');
const User = require('../../model/user');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { isEmailValid, isMobileValid, isPasswordValid } = require('../../service/validation');

dotenv.config();

//Upload professional image
exports.uploadProfileImage = async (req, res) => {
    const currentId = req.id;
    if (!req.file) {
        return res.status(400).json({ message: 'Image is required', status: 400 });
    }

    try {
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ message: 'Professional not found', status: 404 });
        }

        //Extracting image path
        const uploadDirIndex = req.file.path.indexOf('uploads');
        const relativePath = req.file.path.substring(uploadDirIndex);
        const imagePath = { path: relativePath };

        user.image = imagePath;
        await user.save();
        return res.status(200).json({ message: 'Image uploaded successfully', user: user, status: 200 });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};

//create Profile
exports.updateProfile = async (req, res) => {
    const { name, email, mobile, designation, bio, organization, city, password } = req.body;
    const currentId = req.id;
    if (!currentId) { return res.status(401).json({ message: 'UserId is empty', status: 401 }); };

    try {
        const user = await User.findById(currentId);
        if (!user) { return res.status(404).json({ message: `User not found by userId: ${currentId}`, status: 404 }); }

        if (name) { user.name = name; }
        if (designation) { user.designation = designation; }
        if (bio) { user.bio = bio; }
        if (organization) { user.organization = organization; }
        if (city) { user.city = city; }

        if (email) {
            if (!isEmailValid(email)) { return res.status(400).json({ message: 'Email is invalid', status: 400 }); }
            const isExistingUser = await User.findOne({ email: email });
            if (isExistingUser) { return res.status(400).json({ message: `User already exists with this email: ${email}`, status: 400 }); }
            user.email = email;
        }
        if (mobile) {
            if (!isMobileValid(mobile)) { return res.status(400).json({ message: 'Mobile number is invalid', status: 400 }); }
            const isExistingMobile = await User.findOne({ mobile: mobile });
            if (isExistingMobile) { return res.status(400).json({ message: `User already exists with this mobile: ${mobile}`, status: 400 }); }
            user.mobile = mobile;
        }
        if (password) {
            if (!isPasswordValid(password)) { return res.status(400).json({ message: 'Password must be of 8 characters and should contain atleast one uppercase, one lowercase, one number and one special character', status: 400 }); }

            //Check if the password is same as the previous one
            const isMatch = await bcrypt.compare(password, user.password);
            //If password is same as the previous one, then return message.
            if (isMatch) { return res.status(400).json({ message: 'dont use previous password as your new passowrd', status: 400 }); }

            //if password is not same as the previous one, then hash the password and save it.
            const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
            user.password = hashedPassword;
        }

        await user.save();
        return res.status(200).json({ message: 'Profile updated successfully', user: user, status: 200 });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};

//upoad resume
exports.uploadResume = async (req, res) => {
    const currentId = req.id;
    if (!req.file) { return res.status(400).json({ message: 'Resume is required', status: 400 }); }

    try {
        const user = await User.findById(currentId);
        if (!user) { return res.status(404).json({ message: 'user not found', status: 404 }); }

        // allow only pdf files
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ message: 'Only PDF files are allowed', status: 400 });
        }

        //Extracting resume path
        const uploadDirIndex = req.file.path.indexOf('uploads');
        const relativePath = req.file.path.substring(uploadDirIndex);
        const resumePath = { path: relativePath };

        user.resume = resumePath;
        await user.save();
        return res.status(200).json({ message: 'Resume uploaded successfully', user: user, status: 200 });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};

//add verified skills to professional
exports.addVerifiedSkills = async (req, res) => {
    const { skillId } = req.body;
    const userId = req.id;
    if (!userId || !skillId) {
        return res.status(400).json({ message: 'userId, skillProficiency and skillId are required', status: 400 });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }
        const skill = await Skill.findById(skillId);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found', status: 404 });
        }
        user.verifiedSkills.push(skillId);
        await user.save();
        return res.status(200).json({ message: 'Skill added successfully', user: user, status: 200 });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};

//make isBuyer 1
exports.switchToBuyer = async (req, res) => {
    const userId = req.id;
    if (!userId) {
        return res.status(400).json({ message: 'userId is required', status: 400 });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }

        user.isBuyer = 1;
        await user.save();
        return res.status(200).json({ message: 'User is now a buyer', user: user, status: 200 });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};

//current user logged-in User
exports.currentUser = async (req, res) => {
    const userId = req.id;
    try {
        const userAsClient = await User.findById(userId).populate('leads').populate('ratings');
        const userAsProfessional = await User.findById(userId).populate('gigs').populate('ratings').populate('spCredits').populate('verifiedSkills');
        if (!userAsClient || !userAsProfessional){return res.status(404).json({message: `user id invalid | userId: '${userId}' `, status: 404});}

        if(userAsClient.isBuyer === 1){
            return res.status(200).json({message: 'User found as buyer', user: userAsClient, status: 200});
        }else{
            return res.status(200).json({message: 'User found as professional', user: userAsProfessional, status: 200});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};