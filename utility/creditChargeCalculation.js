const CreditLogic = require('../model/creditLogic');

exports.creditChargeCalculation = async (bidAmount) => {
    try {
        const creditLogic = await CreditLogic.findOne();
        if(!creditLogic){return {status: 404, message: 'Credit logic not found'};}
        if(bidAmount <= 0){return 0};
        
        const usedCredits = bidAmount * creditLogic.chargingPercentage / 100;
        return usedCredits;
    } catch (error) {
        console.log(error);
        return {status: 500, message: 'Internal server error'};
    }
};