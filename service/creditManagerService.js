const Credit = require('../model/credit');
const CreditLogic = require('../model/creditLogic');
const User = require('../model/user');
const CreditHistory = require('../model/creditHistory');

exports.manageCredit = async (professionalUserId, spCreditAmount, isCredit, remarks) => {
    if (!professionalUserId){return false;}
    console.log('type ======= ',typeof spCreditAmount, '| spCredit: ',spCreditAmount);
    try {
        //isCredit = 1 means spCredit is added, 0 means spCredit is deducted

        console.log("=====1=====");
        const usersCredit = await Credit.findOne({ userId: professionalUserId });
        if (!usersCredit) { 
            console.log(`sp_credit Schema not found for this userId: ${professionalUserId} `);
            return false; 
        }
        
        if (isCredit === 1) {
            usersCredit.availableAmount += spCreditAmount;
        }
        if (isCredit === 0) {
            if (usersCredit.availableAmount < spCreditAmount) { 
                console.log(`Insufficient balance for placing this bid | userId: ${professionalUserId} `);
                return false; 
            }
            
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