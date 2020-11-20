const Household = require('../Models/householdModel');
const FamilyMember = require('../Models/familyMemberModel');
const constants = require('../Utils/constants');
const mongoose = require('mongoose');

exports.getStudentEncouragementBonusRecipients = async function (request, response, next) {
    
    const householdArray = [];
    const sixteenYearOldBirthdate = new Date();
    sixteenYearOldBirthdate.setYear(sixteenYearOldBirthdate.getFullYear() - 16);

    const studentsGroupByHousehold = await FamilyMember.aggregate([
        {$match: {
            dateOfBirth : {$gte : sixteenYearOldBirthdate},
            occupationType : constants.OCCUPATION_TYPES[1]
        }},
        {$group: {
            _id : "$householdId",
            studentsArray: {$push: "$$ROOT"}
        }}
    ]);

    for (const students of studentsGroupByHousehold) {

        const household = await Household.findOne(
            {   _id: students._id,
                householdIncome : { $lt : constants.STUDENT_ENCOURAGEMENT_MAX_HOUSEHOLD_INCOME}
            }).lean();

        if (household) {
            household.familyMembers = students.studentsArray;
            householdArray.push(household);
        }
    }

    response.status(constants.STATUS_OK).json({
        data: householdArray
    });
};

exports.getFamilyTogethernessSchemeRecipients = async function (request, response, next) {
    
    const eighteenYearOldBirthdate = new Date();
    eighteenYearOldBirthdate.setYear(eighteenYearOldBirthdate.getFullYear() - 18);

    const childrenGroupByHouseholdIds = await FamilyMember.aggregate([
        {$match: {
            dateOfBirth : {$lt : eighteenYearOldBirthdate},
        }},
        {$group: {
            _id : "$householdId",
        }}
    ]);

    const marriedAdultsGroupByHouseholdIds = await FamilyMember.aggregate([
        {$match: {
            maritalStatus : constants.MARRIAGE_STATUSES[1],
        }},
        {$group: {
            _id : "$householdId",
        }}
    ]);

    const intersectionHouseholdIdObjects = childrenGroupByHouseholdIds.filter(children => {
        return marriedAdultsGroupByHouseholdIds.some(marriedAdults => {
            return children._id === marriedAdults._id;
        });
    })
    
    const householdIdArray = intersectionHouseholdIdObjects.map(householdObject => {
        return mongoose.Types.ObjectId(householdObject._id);
    });

    const recipientHouseholds = await Household.find({
        _id : {$in : householdIdArray}
    }).lean();

    for (const household of recipientHouseholds) {
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
        data: recipientHouseholds
    });
};

exports.getElderBonusRecipients = async function (request, response, next) {
    
    const householdArray = [];
    const fiftyYearOldBirthdate = new Date();
    fiftyYearOldBirthdate.setYear(fiftyYearOldBirthdate.getFullYear() - 50);

    const elderlyGroupByHousehold = await FamilyMember.aggregate([
        {$match: {
            dateOfBirth : {$lte : fiftyYearOldBirthdate}
        }},
        {$group: {
            _id : "$householdId",
            elderlyArray: {$push: "$$ROOT"}
        }}
    ]);

    for (const elderly of elderlyGroupByHousehold) {

        const household = await Household.findById(elderly._id).lean();
        if (household) {
            household.familyMembers = elderly.elderlyArray;
            householdArray.push(household);
        }
    }

    response.status(constants.STATUS_OK).json({
        data: householdArray
    });
};

exports.getBabySunshineGrantRecipients = async function (request, response, next) {
    
    const householdArray = [];
    const fiveYearOldBirthdate = new Date();
    fiveYearOldBirthdate.setYear(fiveYearOldBirthdate.getFullYear() - 5);

    const childrenGroupByHousehold = await FamilyMember.aggregate([
        {$match: {
            dateOfBirth : {$gte : fiveYearOldBirthdate}}},
        {$group: {
            _id : "$householdId",
            childrenArray: {$push: "$$ROOT"}
        }}
    ]);

    for (const children of childrenGroupByHousehold) {

        const household = await Household.findById(children._id).lean();
        if (household) {
            household.familyMembers = children.childrenArray;
            householdArray.push(household);
        }
    }

    response.status(constants.STATUS_OK).json({
        data: householdArray
    });
};

exports.getYoloGstGrantRecipients = async function (request, response, next) {

    const yoloGstHouseholds = await Household.find({
        householdIncome : { $lt : constants.YOLO_GST_MAX_HOUSEHOLD_INCOME}
    }).lean();

    for (const household of yoloGstHouseholds) {
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
        data: yoloGstHouseholds
    });
};
