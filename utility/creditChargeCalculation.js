const CreditLogic = require('../model/creditLogic');

exports.creditChargeCalculation = async (bidAmount) => {
    try {
        const creditLogic = await CreditLogic.findOne();
        if(!creditLogic){return false;}
        if(bidAmount <= 0){
            console.log('Bid amount should be greater than 0');
            return false;
        };
        
        const usedCredits = bidAmount * creditLogic.chargingPercentage / 100;
        return usedCredits;
    } catch (error) {
        console.log(error);
        return false;
    }
};