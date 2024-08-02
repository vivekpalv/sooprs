const User = require('../../../model/user');
const Lead = require('../../../model/lead');
const Bid = require('../../../model/bid');
const Milestone = require('../../../model/milestone');

exports.userHome = async (req, res) => {
    const currentClient= req.id;

    try {
        const user = await User.findById(currentClient).populate('leads');
        if(!user){return res.status(404).json({message: 'User not found', status: 404});}
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};