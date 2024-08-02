const Kyc = require('../../model/kyc');
const User = require('../../model/user');

//Approve KYC
exports.approveKyc = async (req, res) => {
    const { kycId } = req.body;
    try {
        const kyc = await Kyc.findById(kycId);
        if(!kyc){return res.status(404).json({message: 'KYC not found', status: 404});}
        
        const user = await User.findById(kyc.userId);
        if(!user){return res.status(404).json({message: 'User not found', status: 404});}
        
        user.kycStatus = 2; //2 means kyc approved by admin
        
        await user.save();
        return res.status(200).json({message: 'KYC approved successfully', status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//Reject KYC
exports.rejectKyc = async (req, res) => {
    const { kycId } = req.body;

    try {
        const kyc = await Kyc.findById(kycId);
        if(!kyc){return res.status(404).json({message: 'KYC not found', status: 404});}

        const user = await User.findById(kyc.userId);
        if(!user){return res.status(404).json({message: 'User not found', status: 404});}

        user.kycStatus = 3; //3 means kyc rejected by admin

        await user.save();
        return res.status(200).json({message: 'KYC rejected successfully', status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};