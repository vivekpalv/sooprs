const Credit = require('../model/credit');
const CreditLogic = require('../model/creditLogic');
const User = require('../model/user');
const CreditHistory = require('../model/creditHistory');

exports.manageCredit = async (professionalUserId, spCreditAmount, isCredit, remarks) => {
    if (!professionalUserId){return false;}
    console.log('type ======= ',typeof spCreditAmount, spCreditAmount);
    try {
        //isCredit = 1 means credit is added, 0 means credit is deducted

        console.log("=====1=====");
        const usersCredit = await Credit.findOne({ userId: professionalUserId });
        if (!usersCredit) { return false; }
        
        if (isCredit === 1) {
            usersCredit.availableAmount += spCreditAmount;
        }
        if (isCredit === 0) {
            if (usersCredit.availableAmount < spCreditAmount) { return false; }
            usersCredit.availableAmount -= spCreditAmount;
            spCreditAmount = -spCreditAmount;
        }

        const creditHistory = new CreditHistory({ creditId: usersCredit._id, userId: professionalUserId, transactionAmount: spCreditAmount, transactionType: isCredit, remarks: remarks });
        console.log("=====2=====");
        await creditHistory.save();
        usersCredit.creditHistory.push(creditHistory._id);
        await usersCredit.save();
        console.log("=====3=====");
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};