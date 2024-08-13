const User = require('../../model/user');
const Job = require('../../model/job');
const JobOffer = require('../../model/jobOffer');
const {default: mongoose} = require('mongoose');
const {scheduleJobStatusChangeOnSpecificDate} = require('../../service/scheduler');

//send job offer to freelancer (sent by recruiter)
exports.makeJobOffer = async (req, res) => {
    const { freelancerUserId, payment, jobType, jobDescription} = req.body;
    const currentRecruiterUserId = req.id;

    if(!mongoose.Types.ObjectId.isValid(freelancerUserId) || !mongoose.Types.ObjectId.isValid(currentRecruiterUserId)){return res.status(400).json({message: `Invalid id | recruiterUserId: ${freelancerUserId} | freelancerUserId: ${currentRecruiterUserId}`})}
    if(!payment || !jobType || !jobDescription){return res.status(400).json({message: `All fields are required`})}
    if(jobType < 0 || jobType > 3){return res.status(400).json({message: `jobType should b/w 0-3 | jobType: ${jobType}`})};
    if(!req.files){return res.status(400).json({message: `Please T&C files in .pdf format`})};

    try {
        const freelancer = await User.findById(freelancerUserId);
        const recruiter = await User.findById(currentRecruiterUserId);
        const jobOfferExists = await JobOffer.findOne({recruiterUserId: currentRecruiterUserId, freelancerUserId: freelancerUserId});
        if(!freelancer || !recruiter){return res.status(404).json({message: `User not found | recruiterUserId: ${freelancerUserId} | freelancerUserId: ${currentRecruiterUserId}`})}
        if(freelancer.isOpenToHire !== 1){return res.status(400).json({message: `Freelancer is not open to hire | freelancerUserId: ${freelancerUserId}`})};
        
        //check if job offer already exists
        if(jobOfferExists){
            return res.status(400).json({message: `you already sent job offer to this freelancer | current status of job offer is: ${jobOfferExists.isAcceptedByFreelancer} | 0: no-response, 1: accepted, 2: rejected`});
        }

        const TnCFiles = req.files.map((file)=>{
            const uploadDirIndex = file.path.indexOf('uploads');
            const relativePath = file.path.substring(uploadDirIndex);
            return relativePath;
        });

        const jobOffer = new JobOffer({
            recruiterUserId: currentRecruiterUserId,
            freelancerUserId: freelancerUserId,
            payment: payment,
            jobType: jobType,
            jobDescription: jobDescription
        });

        jobOffer.termAndCondition.importantDocuments = TnCFiles;

        await jobOffer.save();
        freelancer.jobOffers.push(jobOffer._id);
        await freelancer.save();

        return res.status(200).json({message: `Job offer sent successfully to freelancer`, jobOffer: jobOffer, status: 200});
    } catch (error) {
        console.log('Error in makeJobOffer: ', error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//accept or reject job offer by freelancer
exports.acceptOrRejectJobOffer = async (req, res) => {
    const { jobOfferId, isAccepted } = req.body;
    const currentFreelancerUserId = req.id;

    if(!mongoose.Types.ObjectId.isValid(jobOfferId) || !mongoose.Types.ObjectId.isValid(currentFreelancerUserId)){return res.status(400).json({message: `Invalid id | jobOfferId: ${jobOfferId} | freelancerUserId: ${currentFreelancerUserId}`})}
    if(isAccepted !== 1 || isAccepted !== 2){return res.status(400).json({message: `isAccepted should be 1 or 2 | isAccepted: ${isAccepted}`})};

    try {
        const jobOffer = await JobOffer.findById(jobOfferId);
        const freelancer = await User.findById(currentFreelancerUserId);
        if(!jobOffer || !freelancer){return res.status(404).json({message: `Job offer or freelancer not found | jobOfferId: ${jobOfferId} | freelancerUserId: ${currentFreelancerUserId}`})}

        if(jobOffer.freelancerUserId.toString() !== currentFreelancerUserId){return res.status(400).json({message: `You are not authorized to accept or reject this job offer`})}

        jobOffer.isAcceptedByFreelancer = isAccepted;
        await jobOffer.save();

        if(isAccepted === 1){
            freelancer.jobOffers.push(jobOffer._id);
            // await freelancer.save();

            const job = new Job({
                recruiterUserId: jobOffer.recruiterUserId,
                freelancerUserId: jobOffer.freelancerUserId,
                jobDetails: jobOffer._id
            });
            await job.save();
            freelancer.jobs.push(job._id);
            await freelancer.save();

            const sheduleJobStatusChange = scheduleJobStatusChangeOnSpecificDate(jobOffer.startDate, job._id);
        }

        return res.status(200).json({message: `Job offer ${isAccepted === 1 ? 'accepted' : 'rejected'} successfully`, jobOffer: jobOffer, status: 200});
    } catch (error) {
        console.log('Error in acceptOrRejectJobOffer: ', error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//get all