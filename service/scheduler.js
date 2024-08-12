const schedule = require('node-schedule');
const User = require('../model/user');
const Job = require('../model/job');
const JobOffer = require('../model/jobOffer');

exports.scheduleJobStatusChangeOnSpecificDate = async (date, jobId)=>{
    if(!(date instanceof Date)){throw new Error('please provide date in date fromat')}

    const changeStatutOfJob = schedule.scheduleJob(date, async () => {
        const job = await Job.findById(jobId);
        job.jobStatus = 1 // 1: In-progress
    });

    return changeStatutOfJob;
}