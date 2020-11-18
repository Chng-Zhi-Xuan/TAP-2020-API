const Household = require('../Models/householdModel');
const FamilyMember = require('../Models/familyMemberModel');
const constants = require('../Utils/constants');

exports.addHousehold = async function (request, response, next) {

    const household = new Household();

    household.housingType = request.body.housingType ? request.body.housingType : EMPTY_STRING;
    household.householdFamily = [];
    household.householdIncome = 0;

    // Housing Type Validation
    if (!constants.HOUSING_TYPES.includes(household.housingType)) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Housing Type must be Landed, Condominium or HDB.');
        return next();
    }

    await household.save();

    response.status(constants.STATUS_CREATED).json({
        message: "New household has been added.",
        data: household
    });
};

exports.getAllHouseholds = async function (request, response, next) {

    const allHousehold = await Household.find().lean();

    for (const household of allHousehold) {
        const familyMembers = await FamilyMember.find({
            householdId: household._id
        }).lean();

        if (familyMembers) {
            household.familyMembers = familyMembers;
        } else {
            household.familyMembers = [];
        }
    }

    response.status(constants.STATUS_OK).json({
        data: allHousehold
    });
};

exports.getHousehold = async function (request, response, next) {

    const household = await Household.findById(request.params.household_id).lean();

    if (household) {
        const familyMembers = await FamilyMember.find({
            householdId: household._id
        }).lean();

        if (familyMembers) {
            household.familyMembers = familyMembers;
        } else {
            household.familyMembers = [];
        }
    }

    response.status(constants.STATUS_OK).json({
        data: household
    });
};