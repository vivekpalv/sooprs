const User = require('../../model/user');
const Job = require('../../model/job');
const JobOffer = require('../../model/jobOffer');
const Salary = require('../../model/salary');
const Otp = require('../../model/otp');
const Manager = require('../../model/manager');
const ManagerRequest = require('../../model/managerRequest');
const {default: mongoose} = require('mongoose');
const {scheduleJobStatusChangeOnSpecificDate} = require('../../service/scheduler');
const { sendEmailOtp } = require('../../service/emailService');

//send job offer to freelancer (sent by recruiter)
exports.makeJobOffer = async (req, res) => {
    const { freelancerUserId, payment, jobType, jobDescription} = req.body;
    const currentRecruiterUserId = req.id;

    if(!mongoose.Types.ObjectId.isValid(freelancerUserId) || !mongoose.Types.ObjectId.isValid(currentRecruiterUserId)){return res.status(400).json({message: `Invalid id | recruiterUserId: ${freelancerUserId} | freelancerUserId: ${currentRecruiterUserId}`, status: 400})}
    if(!payment || !jobType || !jobDescription){return res.status(400).json({message: `All fields are required`, status: 400})};
    if(jobType < 0 || jobType > 3){return res.status(400).json({message: `jobType should b/w 0-3 | jobType: ${jobType}`, status: 400})};
    if(!req.files){return res.status(400).json({message: `Please T&C files in .pdf format`})};

    try {
        const freelancer = await User.findById(freelancerUserId);
        const recruiter = await User.findById(currentRecruiterUserId);
        const jobOfferExists = await JobOffer.findOne({recruiterUserId: currentRecruiterUserId, freelancerUserId: freelancerUserId});
        if(!freelancer || !recruiter){return res.status(404).json({message: `User not found | recruiterUserId: ${freelancerUserId} | freelancerUserId: ${currentRecruiterUserId}`, status: 404})};
        if(freelancer.isOpenToHire !== 1){return res.status(400).json({message: `Freelancer is not open to hire | freelancerUserId: ${freelancerUserId}`, status: 400})};
        
        //check if job offer already exists
        if(jobOfferExists){
            return res.status(400).json({message: `you already sent job offer to this freelancer | current status of job offer is: ${jobOfferExists.isAcceptedByFreelancer} | 0: no-response, 1: accepted, 2: rejected`, status: 400});
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

    if(!mongoose.Types.ObjectId.isValid(jobOfferId) || !mongoose.Types.ObjectId.isValid(currentFreelancerUserId)){return res.status(400).json({message: `Invalid id | jobOfferId: ${jobOfferId} | freelancerUserId: ${currentFreelancerUserId}`, status: 400})};
    if(isAccepted !== 1 || isAccepted !== 2){return res.status(400).json({message: `isAccepted should be 1 or 2 | isAccepted: ${isAccepted}`, status: 400})};

    try {
        const jobOffer = await JobOffer.findById(jobOfferId);
        const freelancer = await User.findById(currentFreelancerUserId);
        if(!jobOffer || !freelancer){return res.status(404).json({message: `Job offer or freelancer not found | jobOfferId: ${jobOfferId} | freelancerUserId: ${currentFreelancerUserId}`, status: 404})};
        const recruiter = await User.findById(jobOffer.recruiterUserId);
        
        if(jobOffer.freelancerUserId.toString() !== currentFreelancerUserId){return res.status(400).json({message: `You are not authorized to accept or reject this job offer`, status: 400})};

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
            
            recruiter.providedJobs.push(job._id);
            await recruiter.save();

            const sheduleJobStatusChange = scheduleJobStatusChangeOnSpecificDate(jobOffer.startDate, job._id);
        }

        return res.status(200).json({message: `Job offer ${isAccepted === 1 ? 'accepted' : 'rejected'} successfully`, jobOffer: jobOffer, status: 200});
    } catch (error) {
        console.log('Error in acceptOrRejectJobOffer: ', error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//send salary to freelancer (by recruiter)
exports.sendSalary = async (req, res) => {
    const { jobId, paymentAmount } = req.body;
    const currentRecruiterUserId = req.id;

    if(!mongoose.Types.ObjectId.isValid(jobId)){return res.status(400).json({message: `Invalid id | jobId: ${jobId}`, status: 400})};
    if(!paymentAmount){return res.status(400).json({message: `paymentAmount is required`, status: 400})};

    try {
        const job = await Job.findById(jobId);
        const recruiter = await User.findById(currentRecruiterUserId);

        if(!job || !recruiter){return res.status(404).json({message: `Job or recruiter not found | jobId: ${jobId} | recruiterUserId: ${currentRecruiterUserId}`, status: 404})};
        if(job.recruiterUserId.equals(currentRecruiterUserId)){return res.status(400).json({message: `You are not authorized to send salary for this job`, status: 400})};
        if(job.jobStatus !== 1){return res.status(400).json({message: `Job is not in progress`, status: 400})};

        const salary = new Salary({
            jobId: jobId,
            paymentAmount: paymentAmount
        });

        salary.paymentStatus = 1; //successful
        await salary.save();

        job.salaryHistory.push(salary._id);
        job.jobStatus = 1; //In-progress (after receiving salary)
        await job.save();

        return res.status(200).json({message: `Salary sent successfully`, salary: salary, recruiter: recruiter, status: 200});
    } catch (error) {
        console.log('Error in sendSalary: ', error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//sent otp to freelancer for job completion (by recruiter)
exports.completeJobOtp = async (req, res) => {
    const { jobId } = req.body;
    const currentRecruiterUserId = req.id;

    if(!mongoose.Types.ObjectId.isValid(jobId)){return res.status(400).json({message: `Invalid id | jobId: ${jobId}`, status: 400})};

    try {
        const job = await Job.findById(jobId);
        const recruiter = await User.findById(currentRecruiterUserId);
        const freelancer = await User.findById(job.freelancerUserId);

        if(!job || !recruiter || !freelancer){return res.status(404).json({message: `Invalid id | jobId: ${jobId} | recruiterUserId: ${currentRecruiterUserId} | freelancerUserId: ${job.freelancerUserId}`, status: 404})};
        if(job.recruiterUserId.equals(currentRecruiterUserId)){return res.status(400).json({message: `You are not authorized to send otp for this job`, status: 400})};
        if(job.jobStatus !== 1){return res.status(400).json({message: `Job is not in progress`, status: 400})};

        const otp = new Otp({
            otpCode: Math.floor(100000 + Math.random() * 900000).toString(),
            userId: job.freelancerUserId,
            senderId: job.recruiterUserId,
            jobId: jobId
        });

        await otp.save();

        //send otp to freelancer
        const subject = 'OTP for job completion';
        const message = 'Your OTP for job completion is';

        await sendEmailOtp(freelancer.email, job.otpCode, subject, message);

        return res.status(200).json({message: `Otp sent successfully`, recruiter: recruiter, status: 200});
    } catch (error) {
        console.log('Error in otptoCompleteJob: ', error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//complete job by job id (by recruiter) after receiving otp from freelancer
exports.completeJob = async (req, res) => {
    const { jobId, otp } = req.body;
    const currentRecruiterUserId = req.id;

    if(!mongoose.Types.ObjectId.isValid(jobId)){return res.status(400).json({message: `Invalid id | jobId: ${jobId}`, status: 400})};
    if(!otp){return res.status(400).json({message: `otp is required`, status: 400})};

    try {
        const job = await Job.findById(jobId);
        const recruiter = await User.findById(currentRecruiterUserId);

        if(!job || !recruiter){return res.status(404).json({message: `Job or recruiter not found | jobId: ${jobId} | recruiterUserId: ${currentRecruiterUserId}`, status: 404})};
        if(!job.recruiterUserId.equals(currentRecruiterUserId)){return res.status(400).json({message: `You are not authorized to complete this job, because you are not the recruiter of this job`, status: 400})};
        if(job.jobStatus !== 1){return res.status(400).json({message: `Job is not in progress`, status: 400})};

        //check otp
        const otpExists = await Otp.findOne({jobId: jobId, otp: otp, userId: job.freelancerUserId, senderId: currentRecruiterUserId});
        if(!otpExists){return res.status(400).json({message: `Invalid otp`})};

        job.jobStatus = 2; //completed
        await job.save();

        return res.status(200).json({message: `Job completed successfully`, job: job, recruiter: recruiter, status: 200});
    } catch (error) {
        console.log('Error in completeJob: ', error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//request to assign manager to job (by recruiter) by manager id
exports.requestManagerJob = async (req, res) => {
    const { jobId } = req.body;
    const currentRecruiterUserId = req.id;

    if(!mongoose.Types.ObjectId.isValid(jobId)){return res.status(400).json({message: `Invalid id | jobId: ${jobId}`, status: 400})};

    try {
        const job = await Job.findById(jobId);
        // const manager = await Manager.findById(managerId);
        // const recruiter = await User.findById(currentRecruiterUserId);

        if(!job){return res.status(404).json({message: `Job or manager or recruiter not found | jobId: ${jobId} | recruiterUserId: ${currentRecruiterUserId}`, status: 404})}
        if(!job.recruiterUserId.equals(currentRecruiterUserId)){return res.status(400).json({message: `You are not authorized to request manager for this job, because you are not recruiter of this job`, status: 400})};
        if(job.managerId){return res.status(400).json({message: `Manager already assigned to this job`, status: 400})}

        const managerRequest = new ManagerRequest({
            jobId: jobId,
            status: 0  //pending-request
        });

        await managerRequest.save();
        // job.managerRequests.push(managerRequest._id);
        // await job.save();

        return res.status(200).json({message: `Manager request sent successfully`, managerRequest: managerRequest, recruiter: recruiter, status: 200});
    } catch (error) {
        console.log('Error in requestManagerJob: ', error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};
