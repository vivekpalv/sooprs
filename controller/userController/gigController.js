const User = require('../../model/user');
const Gig = require('../../model/gig');
const GigOrder = require('../../model/gigOrder');
const Rating = require('../../model/rating');
const Feedback = require('../../model/feedback');
const Otp = require('../../model/otp');
const { default: mongoose } = require('mongoose');

const { sendEmailOtp } = require('../../service/emailService');

//create gig
exports.createGig = async (req, res) => {
    const { title, description, price, completionDays, usingSkills } = req.body;
    const currentProfessional = req.id;

    if (!title || !description || !price || !completionDays) { return res.status(400).json({ error: 'All fields are required', status: 400 }); }

    try {
        const user = await User.findById(currentProfessional);
        if (!user) { return res.status(400).json({ error: `User not exist by userId: '${currentProfessional}' `, status: 400 }); }

        const gig = new Gig({
            userId: currentProfessional,
            title: title,
            description: description,
            price: price,
            completionDays: completionDays,
        });

        if (req.files) {
            const images = req.files.map((file) => {
                const uploadDirIndex = file.path.indexOf('uploads');
                const relativePath = file.path.substring(uploadDirIndex);
                return relativePath;
            });
            console.log('images: ', images);
            gig.gigImg = { path: images };
        }

        if (usingSkills) { gig.usingSkills = usingSkills; };
        await gig.save();

        user.gigs.push(gig._id);
        await user.save();

        return res.status(200).json({ message: 'Gig created successfully', gig: gig, user: user, status: 200 });
    } catch (error) {
        console.log('Error in createGig(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};

//upload order requirements by client
exports.uploadOrderRequirements = async (req, res) => {
    const { gigOrderId, orderRequirements } = req.body;
    const currentClientUser = req.id;
    if (!req.files) { return res.status(400).json({ error: 'Please upload requirements files', status: 400 }); }
    if (!mongoose.Types.ObjectId.isValid(gigOrderId) || !orderRequirements) { return res.status(400).json({ error: `orderId and orderRequirements is required, and ID should be in valid format | orderId: '${gigOrderId}' `, status: 400 }); }

    try {
        const gigOrder = await GigOrder.findById(gigOrderId);
        if (!gigOrder) { return res.status(400).json({ error: `GigOrder not exist by orderId: '${gigOrderId}' `, status: 400 }); }
        if (!gigOrder.clientUserId.equals(currentClientUser)) { return res.status(400).json({ error: 'You are not authorized to upload requirements for this order, because you not done payment for this order', status: 400 }); }
        if (gigOrder.isRequirementApproved === 3) { return res.status(400).json({ error: 'Order requirements already approved by both, now you cannot update requirements' }); }

        const requirements = req.files.map((file) => {
            const uploadDirIndex = file.path.indexOf('uploads');
            const relativePath = file.path.substring(uploadDirIndex);
            return relativePath;
        });

        gigOrder.orderRequirements = { description: orderRequirements, path: requirements };
        gigOrder.isRequirementApproved = 1; // '1' means approved by client
        await gigOrder.save();

        return res.status(200).json({ message: 'Order requirements uploaded successfully', gigOrder: gigOrder, status: 200 });
    } catch (error) {
        console.log('Error in uploadOrderRequirements(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};

//gig order approve by client
exports.approveOrderRequirementsByClient = async (req, res) => {
    const { gigOrderId } = req.body;
    const currentClientUser = req.id;

    if (!mongoose.Types.ObjectId.isValid(gigOrderId)) { return res.status(400).json({ error: `orderId is required | orderId: ${gigOrderId}' `, status: 400 }); }

    try {
        const gigOrder = await GigOrder.findById(gigOrderId);
        if (!gigOrder) { return res.status(400).json({ error: `GigOrder not exist by orderId: '${gigOrderId}' `, status: 400 }); }
        if (!gigOrder.clientUserId.equals(currentClientUser)) { return res.status(400).json({ error: 'You are not authorized to approve requirements for this order, because you not done payment for this order', status: 400 }); }
        if (gigOrder.isRequirementApproved === 3) { return res.status(400).json({ error: 'Order requirements already approved by both' }); }

        if (gigOrder.isRequirementApproved === 2) {
            gigOrder.isRequirementApproved = 3;
            gigOrder.orderStatus = 1; //'1' means In-progress
        } else {
            gigOrder.isRequirementApproved = 1;
        }

        await gigOrder.save();

        return res.status(200).json({ message: 'Order requirements approved successfully', gigOrder: gigOrder, status: 200 });
    } catch (error) {
        console.log('Error in approveOrderRequirementsByClient(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};

//gig order approve by professional
exports.approveOrderRequirementsByProfessional = async (req, res) => {
    const { gigOrderId } = req.body;
    const currentProfessional = req.id;

    if (!mongoose.Types.ObjectId.isValid(gigOrderId)) { return res.status(400).json({ error: `orderId is required | orderId: ${gigOrderId}`, status: 400 }); }

    try {
        const gigOrder = await GigOrder.findById(gigOrderId);
        if (!gigOrder) { return res.status(400).json({ error: `GigOrder not exist by orderId: '${gigOrderId}' `, status: 400 }); }
        // console.log(`${gigOrder.userId} | ${currentProfessional}`);

        console.log(gigOrder.userId, ' | ', currentProfessional);
        if (!gigOrder.userId.equals(currentProfessional)) { return res.status(400).json({ error: 'You are not authorized to approve requirements for this order, because you not professional of this order', status: 400 }); }
        if (gigOrder.isRequirementApproved === 3) { return res.status(400).json({ error: 'Order requirements already approved by both' }); }

        if (gigOrder.isRequirementApproved === 1) {
            gigOrder.isRequirementApproved = 3;
            gigOrder.orderStatus = 1; // '1' means In-progress
        } else {
            gigOrder.isRequirementApproved = 2;
        }

        await gigOrder.save();

        return res.status(200).json({ message: 'Order requirements approved successfully', gigOrder: gigOrder, status: 200 });
    } catch (error) {
        console.log('Error in approveOrderRequirementsByProfessional(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};

//gig order cancel by client
exports.gigOrderCancelByClient = async (req, res) => {
    const { orderId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) { return res.status(400).json({ error: `orderId is required | orderId: ${orderId}`, status: 400 }); }

    try {
        const gigOrder = await GigOrder.findById(orderId);
        if (!gigOrder) { return res.status(400).json({ error: `GigOrder not exist by orderId: '${orderId}' `, status: 400 }); }
        if (gigOrder.orderStatus !== 0) { return res.status(400).json({ error: `You cannot cancel order, because order status is not 0 | current order status: '${gigOrder.orderStatus}' , 0: not-started, 1: In-progress, 2: completed, 3: cancelled-by-client, 4: cancelled-by-professional `, status: 400 }); }
        gigOrder.orderStatus = 3; // '3' means cancelled-by-client
        await gigOrder.save();

        return res.status(200).json({ message: 'Order cancelled successfully', gigOrder: gigOrder, status: 200 });
    } catch (error) {
        console.log('Error in gigOrderCancelByClient(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};

//gig order cancel by professional
exports.gigOrderCancelByProfessional = async (req, res) => {
    const { orderId } = req.body;
    const currentProfessional = req.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) { return res.status(400).json({ error: `orderId is required | orderId: ${orderId}`, status: 400 }); }

    try {
        const gigOrder = await GigOrder.findById(orderId);
        if (!gigOrder) { return res.status(400).json({ error: `GigOrder not exist by orderId: '${orderId}' `, status: 400 }); }
        if (gigOrder.orderStatus !== 0) { return res.status(400).json({ error: `You cannot cancel order, because order status is not 0 | current order status: '${gigOrder.orderStatus}' , 0: not-started, 1: In-progress, 2: completed, 3: cancelled-by-client, 4: cancelled-by-professional `, status: 400 }); }
        if (!gigOrder.userId.equals(currentProfessional)) { return res.status(400).json({ error: 'You are not authorized to cancel order, because you not professional of this order', status: 400 }); }

        gigOrder.orderStatus = 4; // '4' means cancelled-by-professional
        await gigOrder.save();

        return res.status(200).json({ message: 'Order cancelled successfully', gigOrder: gigOrder, status: 200 });
    } catch (error) {
        console.log('Error in gigOrderCancelByProfessional(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};

//order create by client
exports.createOrder = async (req, res) => {
    const { gigId, razorpayOrderId, razorpayPaymentId } = req.body;
    const currentClientUser = req.id;

    if (!mongoose.Types.ObjectId.isValid(gigId)) { return res.status(400).json({ error: `gigId is should be in valid format | gigId: '${gigId}' `, status: 400 }); }
    if (!razorpayOrderId || !razorpayPaymentId) { return res.status(400).json({ error: 'All fields are required', status: 400 }); }

    try {

        const gig = await Gig.findById(gigId);
        if (!gig) { return res.status(400).json({ error: `Gig not exist by gigId: '${gigId}' `, status: 400 }); }
        if (gig.userId.equals(currentClientUser)) { return res.status(400).json({ error: 'You cannot order your own gig', status: 400 }); }

        const user = await User.findById(currentClientUser);
        if (!user) { return res.status(400).json({ error: `User not exist by userId: '${currentClientUser}' `, status: 400 }); }

        const gigOrder = new GigOrder({
            gigId: gigId,
            clientUserId: currentClientUser,
            userId: gig.userId,
            orderAmount: gig.price,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
        });

        await gigOrder.save();
        gig.gigOrders.push(gigOrder._id);
        await gig.save();

        return res.status(200).json({ message: 'Order created successfully', gigOrder: gigOrder, status: 200 });
    } catch (error) {
        console.log('Error in createOrder(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};

//request otp for order completion (by freelancer)
exports.requestOtpForGigOrderCompletion = async (req, res) => {
    const gigOrderId = req.params.id;
    const currentProfessionalUserId = req.id;
    if (!mongoose.Types.ObjectId.isValid(gigOrderId)) { return res.status(400).json({ error: `orderId is required | orderId: ${gigOrderId}`, status: 400 }); }

    try {
        const gigOrder = await GigOrder.findById(gigOrderId);
        if (!gigOrder) { return res.status(400).json({ error: `GigOrder not exist by orderId: '${gigOrderId}' `, status: 400 }); }
        if (!gigOrder.userId.equals(currentProfessionalUserId)) { return res.status(400).json({ error: 'You are not authorized to request otp for this order, because you are not professional of this order', status: 400 }); }
        if (!gigOrder.orderStatus === 2) { return res.status(400).json({ error: 'You cannot request otp for this order, because order is already completed', status: 400 }); }

        const clientUser = await User.findById(gigOrder.clientUserId);
        if (!clientUser) { return res.status(400).json({ error: `clientUserId not exist in gigOrder | clientUserId: '${gigOrder.clientUserId}' `, status: 400 }); }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpDocument = new Otp({ otpCode: otp, senderId: gigOrder.userId, gigOrderId: gigOrder._id, userId: gigOrder.clientUserId });
        await otpDocument.save();

        const subject = 'OTP for Order Completion';
        const message = 'Your OTP for Order Completion is';

        await sendEmailOtp(clientUser.email, otp, subject, message);

        return res.status(200).json({ message: `OTP sent successfully to email: ${clientUser.email}`, status: 200 });
    } catch (error) {
        console.log('Error in requestOtpForGigOrderCompletion(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};

//order complete by professional after requesting otp from client
exports.completeOrderByProfessional = async (req, res) => {
    const { gigOrderId, otpCode } = req.body;
    const currentProfessionalUserId = req.id;

    if (!mongoose.Types.ObjectId.isValid(gigOrderId)) { return res.status(400).json({ error: `orderId is required | orderId: ${orderId}`, status: 400 }); }

    try {
        const gigOrder = await GigOrder.findById(gigOrderId);
        const user = await User.findById(currentProfessionalUserId);
        if (!gigOrder || !user) { return res.status(400).json({ error: `GigOrder or User not exist | gigOrderId: ${gigOrderId} | userId: '${currentProfessionalUserId}' `, status: 400 }); }
        if (!gigOrder.userId.equals(currentProfessionalUserId)) { return res.status(400).json({ error: 'You are not authorized to complete order, because you are not professional of this order', status: 400 }); }

        const otpDocument = await Otp.findOne({ senderId: gigOrder.userId, otpCode: otpCode, gigOrderId: gigOrderId, userId: gigOrder.clientUserId });
        if (!otpDocument) { return res.status(400).json({ error: 'Invalid OTP', status: 400 }); }

        gigOrder.orderStatus = 2; //'2' means completed
        await gigOrder.save();

        // Delete OTP document
        await otpDocument.deleteOne();

        return res.status(200).json({ message: 'Order completed successfully', gigOrder: gigOrder, status: 200 });
    } catch (error) {
        console.log('Error in completeOrderByProfessional(): ', error);
        return res.status(500).json({ error: 'Internal server error', status: 500 });
    }
};