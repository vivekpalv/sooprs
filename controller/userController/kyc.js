const User = require('../../model/user');
const Kyc = require('../../model/kyc');

exports.doKyc = async (req, res) => {
    const { documentType, name, mobile, country, city, pincode } = req.body;
    const userId = req.id;
    // if(!validityFrom || !validityTo || !kycDocuments || !documentType || !name || !mobile || !country || !city || !pincode){
    //     return res.status(400).json({message: 'All fields are required', status: 400});
    // }
    if(!req.files){
        return res.status(400).json({message: 'images are are required', status: 400});
    }
    
    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User not found', status: 404});
        }

        const images=req.files.map((file)=>{
            const uploadDirIndex = file.path.indexOf('uploads');
            const relativePath = file.path.substring(uploadDirIndex);
            return { path: relativePath };
        });

        const kyc = new Kyc({userId: user._id, documentType: documentType, name: name, mobile: mobile, country: country, city: city, pincode: pincode, kycDocuments: images});
        user.kycStatus = 1; //1 means kyc submitted by user
        await user.save();
        await kyc.save();
        return res.status(200).json({message: 'KYC submitted successfully', user: user, kyc: kyc, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
}