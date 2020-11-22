const Household = require('../models/household.model');
const FamilyMember = require('../models/family-member.model');
const constants = require('../utility/constants');

function verifyGender (familyMember, response) {

    if (!constants.GENDERS.includes(familyMember.gender)) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Gender must be Male or Female');
        return false;
    }

    return true;
}

async function verifyMaritalStatus (familyMember, response) {

    if (!constants.MARRIAGE_STATUSES.includes(familyMember.maritalStatus)) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Marital Status must be Single or Married');
        return false;
    }
    
    if (familyMember.maritalStatus === constants.MARRIAGE_STATUSES[0] && familyMember.spouse) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Single must not have spouse');
        return false;
    }
    
    if (familyMember.maritalStatus === constants.MARRIAGE_STATUSES[1]) {

        if (!familyMember.spouse) {
            response.status(constants.STATUS_NOT_ACCEPTABLE).send('Married must have spouse');
            return false;
        }

        const spouse = await FamilyMember.findById(familyMember.spouse);

        if (!spouse) {
            response.status(constants.STATUS_NOT_ACCEPTABLE).send('Spouse must be existing');
            return false;
        }

        if (spouse.maritalStatus === constants.MARRIAGE_STATUSES[1]) {
            response.status(constants.STATUS_NOT_ACCEPTABLE).send('Spouse is already married to someone else');
            return false;
        }

        if (spouse.gender === familyMember.gender) {
            response.status(constants.STATUS_NOT_ACCEPTABLE).send('Spouse cannot be of the same gender');
            return false;
        }

        if (spouse.householdId !== familyMember.householdId) {
            response.status(constants.STATUS_NOT_ACCEPTABLE).send('Spouse must be in the same household');
            return false;
        }

        const familyMemberDob = Date.parse(familyMember.dateOfBirth);
        const spouseDob = Date.parse(familyMember.dateOfBirth);
        const eighteenYearOldBirthdate = new Date();
        eighteenYearOldBirthdate.setYear(eighteenYearOldBirthdate.getFullYear() - 18);

        if (familyMemberDob > eighteenYearOldBirthdate || spouseDob > eighteenYearOldBirthdate) {
            response.status(constants.STATUS_NOT_ACCEPTABLE).send('Legal age for marriage is 18');
            return false;
        }
    }

    return true;
}

function verifyOccupationType (familyMember, response) {

    if (!constants.OCCUPATION_TYPES.includes(familyMember.occupationType)) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Occupation must be Unemployed, Student or Employed');
        return false;
    }

    return true;
}

function verifyAnnualIncome (familyMember, response) {
    if (isNaN(familyMember.annualIncome) || familyMember.annualIncome < 0) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Annual income must be a non-negative number');
        return false;
    }

    return true;
}

function verifyDateOfBirth (familyMember, response) {

    const checkDate = Date.parse(familyMember.dateOfBirth);

    if (isNaN(checkDate) || checkDate > Date.now()) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Date must be in the past and in yyyy-mm-dd format');
        return false;
    }

    return true;
}

exports.addFamilyMember = async function (request, response, next) {

    const householdId = request.body.householdId ? request.body.householdId : constants.EMPTY_STRING;
    const household = await Household.findById(householdId);

    if (!household) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Household id must be existing');
        return next();
    }

    const familyMember = new FamilyMember();

    familyMember.householdId = householdId;
    familyMember.name = request.body.name ? request.body.name : constants.EMPTY_STRING;
    familyMember.gender = request.body.gender ? request.body.gender : constants.EMPTY_STRING;
    familyMember.maritalStatus = request.body.maritalStatus ? request.body.maritalStatus : constants.EMPTY_STRING;
    familyMember.spouse = request.body.spouse ? request.body.spouse : constants.EMPTY_STRING;
    familyMember.occupationType = request.body.occupationType ? request.body.occupationType : constants.EMPTY_STRING;
    familyMember.annualIncome = request.body.annualIncome ? parseFloat(request.body.annualIncome).toFixed(2) : 0;
    familyMember.dateOfBirth = request.body.dateOfBirth ? request.body.dateOfBirth : constants.EMPTY_STRING;

    const newHouseholdIncome = (parseFloat(household.householdIncome) + parseFloat(familyMember.annualIncome)).toFixed(2);
    household.householdIncome = newHouseholdIncome;

    if (!verifyGender(familyMember, response)
        || !await verifyMaritalStatus(familyMember, response)
        || !verifyOccupationType(familyMember, response)
        || !verifyAnnualIncome(familyMember, response)
        || !verifyDateOfBirth(familyMember, response)) {

        return next();
    } 

    await familyMember.save();

    if (familyMember.maritalStatus === constants.MARRIAGE_STATUSES[1]) {
        await FamilyMember.findByIdAndUpdate(familyMember.spouse,
        {
            maritalStatus : constants.MARRIAGE_STATUSES[1],
            spouse: familyMember._id
        });
    }

    await household.save();

    response.json({
        message: 'New family member has been added',
        data: familyMember
    });
    
};

exports.getAllFamilyMembers = async function (request, response, next) {
    const allFamilyMembers = await FamilyMember.find().lean();
    response.status(constants.STATUS_OK).json({
        data: allFamilyMembers       
    });
};

exports.getFamilyMember = async function (request, response, next) {
    const familyMember = await FamilyMember.findById(request.params.family_member_id).lean();
    response.status(constants.STATUS_OK).json({
        data: familyMember
    });
}

exports.removeFamilyMember = async function(request, response, next) {

    const familyMemberToRemove = await FamilyMember.findById(request.params.family_member_id);

    if (!familyMemberToRemove) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Family member not found');
        return next();
    }

    const familyMemberId = familyMemberToRemove._id;

    // Update household income
    const household = await Household.findById(familyMemberToRemove.householdId);
    const newHouseholdIncome = (parseFloat(household.householdIncome) - parseFloat(familyMemberToRemove.annualIncome)).toFixed(2);
    household.householdIncome = newHouseholdIncome;
    await household.save();
    
    // Update spouse to be single
    if (familyMemberToRemove.spouse) {
        await FamilyMember.findByIdAndUpdate(familyMemberToRemove.spouse, 
        {
            maritalStatus : constants.MARRIAGE_STATUSES[0],
            spouse: constants.EMPTY_STRING
        });
    }

    await familyMemberToRemove.remove();
    response.status(constants.STATUS_OK).send('Removed family member with id: ' + familyMemberId);
}
