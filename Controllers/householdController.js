const Household = require('../models/householdModel');
const FamilyMember = require('../models/familyMemberModel');
const constants = require('../utils/constants');

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
        message: 'New household has been added.',
        data: household
    });
};

exports.getAllHouseholds = async function (request, response, next) {

    const allHouseholds = await Household.find().lean();

    for (const household of allHouseholds) {
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
        data: allHouseholds
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

exports.removeHousehold = async function (request, response, next) {
    
    const householdToRemove = await Household.findById(request.params.household_id);

    if (!householdToRemove) {
        response.status(constants.STATUS_NOT_ACCEPTABLE).send('Household not found');
        return next();
    }

    await FamilyMember.deleteMany({
        householdId : householdToRemove._id
    })

    await householdToRemove.remove();
    response.status(constants.STATUS_OK).send('Removed household with id: ' + householdToRemove._id);
}
