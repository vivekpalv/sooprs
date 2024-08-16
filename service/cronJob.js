const cron = require('node-cron');
const ManagerRequest = require('../model/managerRequest');

//Cron job to move pending manager requests to rejected state after 3 days
cron.schedule('0 0 * * *', async () => {
    
    try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // day * hour * minute * second * millisecond
        await ManagerRequest.updateMany({status: 0, createdAt: {$lte: threeDaysAgo}}, {status: 2});
    } catch (error) {
        console.log("error in cron: ",error);
    }
}); 