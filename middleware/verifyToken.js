const jwt = require('jsonwebtoken');
const User = require('../model/user');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');

dotenv.config();

//Token verification
exports.verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({message: 'Token is missing, token is required for authentication', status: 401});
    }
    const tokenWithoutBearer = token.split(' ')[1];
    if(!tokenWithoutBearer){
        return res.status(401).json({message: 'Unable to split token', status: 401});
    }

    try {
        const tokenDecoding = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, async (err, decoded) => {
            if(err){
                return res.status(401).json({message: 'Invalid token', status: 401});
            }
            if(!decoded.id){
                return res.status(401).json({message: 'id not found inside of token | (inside verifyToken middleware)', status: 401});
            }
            
            const loggedInUser = await User.findById(decoded.id);
            if(!loggedInUser){
                return res.status(404).json({message: 'User not found | (inside verifyToken middleware)', status: 404});
            }

            req.id = loggedInUser._id;
            req.isBuyer = loggedInUser.isBuyer;

            // console.log('id:', req.id, 'isBuyer:', req.isBuyer);

            next();
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error | (inside catch block of verifyToken funtion in middleware)', status: 500});
    }
};

exports.isClient = async (req, res, next) => {
    const user = await User.findById(req.id);
    if(!mongoose.Types.ObjectId.isValid(req.id)){return res.status(400).json({message: `id is required & provide it in valid format | id: '${req.id}' `, status: 400});}
    
    if(user.isBuyer !== 1){
        return res.status(401).json({message: 'You are not authorized to access this route, because you are not currently logged in as a Client', status: 401});
    }
    if(user.isEmailVerified !== 1){
        return res.status(401).json({message: 'You are not authorized to access this route, because your email is not verified', status: 401});
    }
    
    next();
};

exports.isProfessional = async (req, res, next) => {
    const user = await User.findById(req.id);
    if(!mongoose.Types.ObjectId.isValid(req.id)){return res.status(400).json({message: `id is required & provide it in valid format | id: '${req.id}' `, status: 400});}

    if(user.isBuyer !== 0){
        return res.status(401).json({message: 'You are not authorized to access this route, because you are not currently logged in as a Professional', status: 401});
    }
    if(user.isEmailVerified !== 1){
        return res.status(401).json({message: 'You are not authorized to access this route, because your email is not verified', status: 401});
    }

    next();
};
