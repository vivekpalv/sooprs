const User = require('../../model/user');
const Rating = require('../../model/rating');
const Gig = require('../../model/gig');
const Feedback = require('../../model/feedback');
const { default: mongoose } = require('mongoose');

//provide rating to professional after completion of lead
exports.provideRating = async (req, res) => {
    const { userId, rating, ratedUserId } = req.body;

    if(Number(rating) < 1 || Number(rating) > 5){ return res.status(400).json({message: `Rating should be between 1 to 5 | passed rating : ${rating} `, status: 400});}
    if(!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(ratedUserId)){
        return res.status(400).json({message: `Invalid id | rating provider userId: '${userId}' | rated userId: '${ratedUserId}' `, status: 400});
    }

    try {
        const user = await User.findById(userId);
        const ratedUser = await User.findById(ratedUserId);
        if(!user || !ratedUser){ return res.status(404).json({message: `User not found | user id: '${userId}' | rated user id: '${ratedUserId}' `, status: 404});}

        const newRating = new Rating({
            userId: userId,
            rating: rating,
            ratedUserId: ratedUserId
        });

        // if(gigId){
        //     if(!mongoose.Types.ObjectId.isValid(gigId)){ return res.status(400).json({message: `Invalid gig id: '${gigId}'`, status: 400});}
        //     const gig = await Gig.findById(gigId);
        //     if(!gig){ return res.status(404).json({message: `Gig not found | gig id: '${gigId}'`, status: 404});}
        //     newRating.gigId = gigId;
        // }

        ratedUser.ratings.push(newRating._id);

        await newRating.save();
        return res.status(200).json({message: `Rating provided successfully`, rating: newRating,status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: `Internal server error`, status: 500});
    }
};

//feedback and rating to gig and rating to professional also.
exports.provideFeedbackOrRatingToGig = async (req, res) => {
    const { userId, gigId, feedback, clientUserId, rating } = req.body; 
    if(!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(gigId) || !mongoose.Types.ObjectId.isValid(clientUserId)){
        return res.status(400).json({message: `Invalid id | user id: '${userId}' | gig id: '${gigId}' | client user id: '${clientUserId}'`, status: 400});
    }
    if(!feedback || !rating || Number(rating) < 1 || Number(rating) > 5){ return res.status(400).json({message: `Feedback and rating are required | rating should be 1-5 `, status: 400});}

    try {
        const user = await User.findById(userId); //professional
        const clientUser = await User.findById(clientUserId); //client
        const gig = await Gig.findById(gigId);
        
        if(!user || !clientUser || !gig){ return res.status(404).json({message: `User or gig not found | user id: '${userId}' | gig id: '${gigId}' | client user id: '${clientUserId}'`, status: 404});}

        
        let savedFeedback = null;
        let savedRating = null;
        
        if(feedback){ 
            const newFeedback = new Feedback({ userId: userId, gigId: gigId, clientUserId: clientUserId, feedbackMessage: feedback });
            isFeedbackProvided = await newFeedback.save();
        }
        if(rating){ // in-case of rating provided to gig, then we also save gigId in rating schema.
            const newRating = new Rating({ userId: clientUserId, rating: rating, ratedUserId: userId, gigId: gigId }); 
            isRatingProvided = await newRating.save(); 
        }

        if( savedFeedback && savedRating ){
            savedFeedback.rating = savedRating._id;
            await savedFeedback.save();
        }

        return res.status(200).json({message: `Feedback and rating provided successfully`, feedback: savedFeedback, rating: savedRating, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: `Internal server error`, status: 500});
    }
};