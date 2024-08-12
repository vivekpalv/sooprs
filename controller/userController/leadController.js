const User = require('../../model/user');
const Lead = require('../../model/lead');
const Bid = require('../../model/bid');
const Milestone = require('../../model/milestone');
const { creditChargeCalculation } = require('../../utility/creditChargeCalculation');
const { manageCredit } = require('../../service/creditManagerService');
const mongoose = require('mongoose');

//create a new lead
exports.createLead = async (req, res) => {
    const { email, mobile, leadTitle, leadDescription, minBudget, maxBudget} = req.body;
    if(!email || !mobile || !leadTitle || !leadDescription || !minBudget || !maxBudget){return res.status(400).json({message: 'All fields are required', status: 400});}
    const userId = req.id;
    try {
        // const lead = new Lead({userId: userId, email: email, mobile: mobile, leadTitle: leadTitle, leadDescription: leadDescription, minBudget: minBudget, maxBudget: maxBudget});
        const lead = new Lead({clientUserId: userId, email: email, mobile: mobile, leadTitle: leadTitle, leadDescription: leadDescription, minBudget: minBudget, maxBudget: maxBudget});
        if(req.files){
            const attachmentsArray = [];
            const attachments=req.files.map((file)=>{
                const uploadDirIndex = file.path.indexOf('uploads');
                const relativePath = file.path.substring(uploadDirIndex);
                attachmentsArray.push(relativePath);
            });
            lead.leadAttachments = {path: attachmentsArray};
        }

        const currentUser = await User.findById(userId);
        if(!currentUser){return res.status(404).json({message: 'User not found by this id', status: 404});}

        currentUser.leads.push(lead._id);

        await lead.save();
        await currentUser.save();
        return res.status(200).json({message: 'Lead created successfully', lead: lead, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//do bid on a lead
exports.doBid = async (req, res) =>{
    const {leadId, bidAmount, bidMessage} = req.body;
    const professionalUserId = req.id;
    const isCredit = 0; //because bid is a deduction of spCredits of professional
    const remarks = 'Bid-on-Lead';
    if(!mongoose.Types.ObjectId.isValid(leadId) || !bidAmount){return res.status(400).json({message: `leadId: ${leadId} , bidAmount: ${bidAmount} | all fields are required and 'id' lenght should be 24`, status: 400});}

    try {
        const lead = await Lead.findById(leadId);
        if(!lead){return res.status(404).json({message: 'Lead not found by this id', status: 404});}
        if(lead.clientUserId.equals(professionalUserId)){return res.status(401).json({message: 'You are not authorized to bid on this lead, because this lead is created by you', status: 401});}
        if(lead.assignedTo){return res.status(409).json({message: 'Lead is already assigned to someone', status: 409});}

        // const bid = new Bid({leadId: leadId, professionalUserId: professionalUserId, bidAmount: bidAmount, bidMessage: bidMessage});
        const bid = new Bid({leadId: leadId, userId: professionalUserId, bidAmount: bidAmount, bidMessage: bidMessage});
        
        const integerAmount = await creditChargeCalculation(bidAmount); //calculating usedCredits for bid
        if(!integerAmount){return res.status(409).json({message: 'conflict in creditChargeCalculation()', status: 409});}
        bid.usedCredits = Math.floor(integerAmount); //converting float to integer (if value is in float).
        const manageCreditResult = await manageCredit(professionalUserId, bid.usedCredits, isCredit, remarks);
        if(!manageCreditResult){return res.status(409).json({message: 'conflict in menageCredit()', status: 409});}
        
        await bid.save();
        lead.bids.push(bid._id);
        await lead.save();

        return res.status(200).json({message: 'Bid placed successfully', bid: bid, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//accepted bid's status of professionalUser by clientUser
exports.approveBid = async (req, res) => {
    const bidId=req.params.bidId;
    if(!bidId){return res.status(400).json({message: 'bidId is required', status: 400});}
    const currentUserId = req.id;

    try {
        const bid = await Bid.findById(bidId);
        if(!bid){return res.status(404).json({message: 'Bid not found by this id', status: 404});}
        
        const lead = await Lead.findById(bid.leadId);
        if(!lead){return res.status(404).json({message: 'Lead not found by this id', status: 404});}

        // if(!lead.userId.equals(currentUserId)){return res.status(401).json({message: 'You are not authorized to approve this bid, because this bid is not belongs to your lead', status: 401});}
        if(!lead.clientUserId.equals(currentUserId)){return res.status(401).json({message: 'You are not authorized to approve this bid, because this bid is not belongs to your lead', status: 401});}
        if(lead.assignedTo){return res.status(409).json({message: 'Lead is already assigned to someone', status: 409});}
        if(bid.bidStatus === 1){return res.status(401).json({message: 'Bid is already approved', status: 401});}
        
        bid.bidStatus = 1
        await bid.save();
        return res.status(200).json({message: 'Bid approved successfully', bid: bid, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//assigned lead to professionalUser
exports.assignLead = async (req, res) => {
    const bidId=req.params.bidId;
    const currentUserId = req.id;
    if(!bidId){return res.status(400).json({message: 'bidId is required', status: 400});}

    try {
        const bid = await Bid.findById(bidId);
        if(!bid){return res.status(404).json({message: 'Bid not found by this id', status: 404});}
        if(bid.bidStatus !== 1){return res.status(401).json({message: 'Bid is not approved yet, first approve bid then assign it to someone', status: 401});}
        
        const lead = await Lead.findById(bid.leadId);
        if(!lead){return res.status(404).json({message: 'Lead not found by this id', status: 404});}
        // if(!lead.userId.equals(currentUserId)){return res.status(401).json({message: 'You are not authorized to assign this lead, because this lead is not created by you', status: 401 });}
        if(!lead.clientUserId.equals(currentUserId)){return res.status(401).json({message: 'You are not authorized to assign this lead, because this lead is not created by you', status: 401 });}
        if(lead.assignedTo){return res.status(401).json({message: 'Lead is already assigned to someone', status: 401});}
        
        // lead.assignedTo = bid.professionalUserId;
        lead.assignedTo = bid.userId;
        await lead.save();
        return res.status(200).json({message: 'Lead assigned successfully', lead: lead, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//create a milestone for a lead by professionalUser
exports.createMilestone = async (req, res) => {
    const {leadId, milestoneTitle, milestoneDescription, milestoneAmount, milestomeDeadline} = req.body;
    if(!leadId || !milestoneTitle || !milestoneDescription || !milestoneAmount || !milestomeDeadline){return res.status(400).json({message: 'All fields are required', status: 400});}
    try {
        const lead = await Lead.findById(leadId);

        //if milestone is not created by the 'assigned professionalUser' of the lead, then it will not be created
        if(!lead.assignedTo.equals(req.id)){return res.status(401).json({message: 'You are not authorized to create milestone for this lead, because this lead is not assigned to you by clientUser.', status: 401});}

        const milestone = new Milestone({leadId: leadId, milestoneTitle: milestoneTitle, milestoneDescription: milestoneDescription, milestoneAmount: milestoneAmount, milestomeDeadline: milestomeDeadline});
        await milestone.save();
        return res.status(200).json({message: 'Milestone created successfully', milestone: milestone, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//approve milestone by clientUser
exports.approveMilestone = async (req, res) => {
    const milestoneId=req.params.milestoneId;
    if(!milestoneId){return res.status(400).json({message: 'milestoneId is required', status: 400});}
    const currentClientUserId = req.id;

    try {
        const milestone = await Milestone.findById(milestoneId);
        if(!milestone){return res.status(404).json({message: 'Milestone not found by this id', status: 404});}
        if(milestone.isApprovedByClient === 1){return res.status(401).json({message: 'Milestone is already approved', status: 401});}

        const lead = await Lead.findById(milestone.leadId);
        // if(!lead.userId.equals(currentClientUserId)){return res.status(401).json({message: 'You are not authorized to approve this milestone, because this is not milestone not belongs to your created lead', status: 401});}
        if(!lead.clientUserId.equals(currentClientUserId)){return res.status(401).json({message: 'You are not authorized to approve this milestone, because this is not milestone not belongs to your created lead', status: 401});}
        
        milestone.isApprovedByClient = 1;
        lead.milestones.push(milestone._id);
        await milestone.save();
        await lead.save();
        return res.status(200).json({message: 'Milestone approved successfully', milestone: milestone, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//receive payment for a milestone by clientUser and update the status of milestone to In-progress from not-started.
exports.updateMilestoneToInProgress = async (req, res) => {
    const milestoneId=req.params.milestoneId;
    if(!milestoneId){return res.status(400).json({message: 'milestoneId is required', status: 400});}
    const currentClientUserId = req.id;

    try {
        const milestone = await Milestone.findById(milestoneId);
        if(!milestone){return res.status(404).json({message: 'Milestone not found by this id', status: 404});}
        if(milestone.isPaymentReceived === 1){return res.status(401).json({message: 'Payment is already received', status: 401});}

        const lead = await Lead.findById(milestone.leadId);
        // if(!lead.userId.equals(currentClientUserId) || milestone.isApprovedByClient !== 1){return res.status(401).json({message: 'You are not authorized to make payment for this milestone, because this milestone not belongs to your lead || this milestone not approved by you.', status: 401});}
        if(!lead.clientUserId.equals(currentClientUserId) || milestone.isApprovedByClient !== 1){return res.status(401).json({message: 'You are not authorized to make payment for this milestone, because this milestone not belongs to your lead || this milestone not approved by you.', status: 401});}
        
        milestone.isPaymentReceived = 1;
        milestone.milestoneStatus = 1;  
        await milestone.save();
        return res.status(200).json({message: 'Payment received successfully', milestone: milestone, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};

//complete milestone by clientUser
exports.completeMilestone = async (req, res) => {
    const milestoneId=req.params.milestoneId;
    if(!milestoneId){return res.status(400).json({message: 'milestoneId is required', status: 400});}
    const currentClientUserId = req.id;

    try {
        const milestone = await Milestone.findById(milestoneId);
        if(!milestone){return res.status(404).json({message: 'Milestone not found by this id', status: 404});}
        if(milestone.milestoneStatus === 2){return res.status(401).json({message: 'Milestone is already completed', status: 401});}

        const lead = await Lead.findById(milestone.leadId);
        // if(!lead.userId.equals(currentClientUserId) || milestone.isApprovedByClient !== 1 || milestone.isPaymentReceived !== 1){return res.status(401).json({message: 'You are not authorized to complete this milestone, because this milestone not belongs to your lead || this milestone not approved by you || payment is not received for this milestone.', status: 401});}
        if(!lead.clientUserId.equals(currentClientUserId) || milestone.isApprovedByClient !== 1 || milestone.isPaymentReceived !== 1){return res.status(401).json({message: 'You are not authorized to complete this milestone, because this milestone not belongs to your lead || this milestone not approved by you || payment is not received for this milestone.', status: 401});}
        
        milestone.milestoneStatus = 2;
        await milestone.save();
        return res.status(200).json({message: 'Milestone completed successfully', milestone: milestone, status: 200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error', status: 500});
    }
};