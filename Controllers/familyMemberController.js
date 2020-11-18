const Household = require('../Models/householdModel');
const FamilyMember = require('../Models/familyMemberModel');
const constants = require('../Utils/constants');

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

    if (!constants.GENDERS.includes(familyMember.gender)) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Gender must be Male or Female');
    
    } else if (!constants.MARRIAGE_STATUSES.includes(familyMember.maritalStatus)) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Marital Status must be Single, Married or Widowed');
    
    } else if (familyMember.maritalStatus === constants.MARRIAGE_STATUSES[0]
        && familyMember.spouse) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Single must not have spouse');
    
    } else if (familyMember.maritalStatus === constants.MARRIAGE_STATUSES[1]
        && !familyMember.spouse) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Married must have spouse');
    
    } else if (!constants.OCCUPATION_TYPES.includes(familyMember.occupationType)) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Occupation must be Unemployed, Student or Employed');
    
    } else if (isNaN(familyMember.annualIncome) || familyMember.annualIncome < 0) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Annual income must be a non-negative number');

    } else {

        await familyMember.save();
        await household.save();

        response.json({
            message: "New family member has been added",
            data: familyMember
        });
    }

    // TODO: Spouse pair validation
    // TODO: DOB Validation
};

exports.getAllFamilyMembers = async function (request, response, next) {
    const allFamilyMembers = await FamilyMember.find().lean();
    response.status(constants.STATUS_OK).json({
        data: allFamilyMembers       
    });
};
