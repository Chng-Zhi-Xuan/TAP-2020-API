const Household = require('../Models/householdModel');
const FamilyMember = require('../Models/familyMemberModel');

const EMPTY_STRING = '';

const YOLO_GST_MAX_HOUSEHOLD_INCOME = 100000

const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_NOT_ACCEPTABLE = 406;

const HOUSING_TYPES = ['Landed', 'Condominium', 'HDB'];
const GENDERS = ['Male', 'Female'];
const MARRIAGE_STATUSES = ['Single', 'Married', 'Widowed'];
const OCCUPATION_TYPES = ['Unemployed', 'Student', 'Employed'];

exports.addHousehold = async function (request, response, next) {

    let household = new Household();

    household.housingType = request.body.housingType ? request.body.housingType : EMPTY_STRING;
    household.householdFamily = [];
    household.householdIncome = 0;

    // Housing Type Validation
    if (!HOUSING_TYPES.includes(household.housingType)) {
        response.status(STATUS_NOT_ACCEPTABLE).send('Housing Type must be Landed, Condominium or HDB.');
        return next();
    }

    await household.save();

    response.status(STATUS_CREATED).json({
        message: "New household has been added.",
        data: household
    });
};

exports.getAllHouseholds = async function (request, response, next) {

    let allHousehold = await Household.find().lean();

    for (let household of allHousehold) {
        const familyMembers = await FamilyMember.find({
            householdId: household._id
        }).lean();

        if (familyMembers) {
            household.familyMembers = familyMembers;
        } else {
            household.familyMembers = [];
        }
    }

    response.status(STATUS_OK).json({
        data: allHousehold
    });
};

exports.getHousehold = async function (request, response, next) {

    let household = await Household.findById(request.params.household_id).lean();

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

    response.status(STATUS_OK).json({
        data: household
    });
};

exports.addFamilyMember = async function (request, response, next) {

    const householdId = request.body.householdId ? request.body.householdId : EMPTY_STRING;
    let household = await Household.findById(householdId);

    if (!household) {
        response.status(STATUS_NOT_ACCEPTABLE).send('Household id must be existing');
        return next();
    }

    let familyMember = new FamilyMember();

    familyMember.householdId = householdId;
    familyMember.name = request.body.name ? request.body.name : EMPTY_STRING;
    familyMember.gender = request.body.gender ? request.body.gender : EMPTY_STRING;
    familyMember.maritalStatus = request.body.maritalStatus ? request.body.maritalStatus : EMPTY_STRING;
    familyMember.spouse = request.body.spouse ? request.body.spouse : EMPTY_STRING;
    familyMember.occupationType = request.body.occupationType ? request.body.occupationType : EMPTY_STRING;
    familyMember.annualIncome = request.body.annualIncome ? parseFloat(request.body.annualIncome).toFixed(2) : 0;
    familyMember.dateOfBirth = request.body.dateOfBirth ? request.body.dateOfBirth : EMPTY_STRING;

    const newHouseholdIncome = (parseFloat(household.householdIncome) + parseFloat(familyMember.annualIncome)).toFixed(2);
    household.householdIncome = newHouseholdIncome;

    if (!GENDERS.includes(familyMember.gender)) {
        response.status(STATUS_NOT_ACCEPTABLE).send('Gender must be Male or Female');
    
    } else if (!MARRIAGE_STATUSES.includes(familyMember.maritalStatus)) {
        response.status(STATUS_NOT_ACCEPTABLE).send('Marital Status must be Single, Married or Widowed');
    
    } else if (familyMember.maritalStatus === MARRIAGE_STATUSES[0]
        && familyMember.spouse) {
        response.status(STATUS_NOT_ACCEPTABLE).send('Single must not have spouse');
    
    } else if (familyMember.maritalStatus === MARRIAGE_STATUSES[1]
        && !familyMember.spouse) {
        response.status(STATUS_NOT_ACCEPTABLE).send('Married must have spouse');
    
    } else if (!OCCUPATION_TYPES.includes(familyMember.occupationType)) {
        response.status(STATUS_NOT_ACCEPTABLE).send('Occupation must be Unemployed, Student or Employed');
    
    } else if (isNaN(familyMember.annualIncome) || familyMember.annualIncome < 0) {
        response.status(STATUS_NOT_ACCEPTABLE).send('Annual income must be a non-negative number');

    } else {

        await familyMember.save();
        await household.save();

        // Store family member data back to response
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
    response.status(STATUS_OK).json({
        data: allFamilyMembers       
    });
};

exports.getYoloGstGrantHouseholds = async function (request, response, next) {

    let yoloGstHouseholds = await Household.find({householdIncome : { $lt : YOLO_GST_MAX_HOUSEHOLD_INCOME}}).lean();

    for (let household of yoloGstHouseholds) {
        const familyMembers = await FamilyMember.find({
            householdId: household._id
        }).lean();

        if (familyMembers) {
            household.familyMembers = familyMembers;
        } else {
            household.familyMembers = [];
        }
    }

    response.status(STATUS_OK).json({
        data: yoloGstHouseholds
    });
}
