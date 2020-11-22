const Household = require('../models/household.model');
const FamilyMember = require('../models/family-member.model');
const constants = require('../utility/constants');
const mongoose = require('mongoose');

exports.getStudentEncouragementBonusRecipients = async function (request, response, next) {
    
    const recipientHouseholds = [];
    const sixteenYearOldBirthdate = new Date();
    sixteenYearOldBirthdate.setYear(sixteenYearOldBirthdate.getFullYear() - 16);

    const studentsGroupByHousehold = await FamilyMember.aggregate([
        {$match: {
            dateOfBirth : {$gte : sixteenYearOldBirthdate},
            occupationType : constants.OCCUPATION_TYPES[1]
        }},
        {$group: {
            _id : '$householdId',
            students: {$push: '$$ROOT'}
        }}
    ]);

    for (const studentsHousehold of studentsGroupByHousehold) {

        const household = await Household.findOne(
            {   _id: studentsHousehold._id,
                householdIncome : { $lt : constants.STUDENT_ENCOURAGEMENT_MAX_HOUSEHOLD_INCOME}
            }).lean();

        if (household) {
            household.familyMembers = studentsHousehold.students;
            recipientHouseholds.push(household);
        }
    }

    response.status(constants.STATUS_OK).json({
        data: recipientHouseholds
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
            _id : '$householdId',
        }}
    ]);

    const marriedAdultsGroupByHouseholdIds = await FamilyMember.aggregate([
        {$match: {
            maritalStatus : constants.MARRIAGE_STATUSES[1],
        }},
        {$group: {
            _id : '$householdId',
        }}
    ]);

    // Households that exist in both results
    const intersectionHouseholdIdObjects = childrenGroupByHouseholdIds.filter(children => {
        return marriedAdultsGroupByHouseholdIds.some(marriedAdults => {
            return children._id === marriedAdults._id;
        });
    })
    
    // Convert string id to ObjectId
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
    
    const recipientHouseholds = [];
    const fiftyYearOldBirthdate = new Date();
    fiftyYearOldBirthdate.setYear(fiftyYearOldBirthdate.getFullYear() - 50);

    const elderlyGroupByHousehold = await FamilyMember.aggregate([
        {$match: {
            dateOfBirth : {$lte : fiftyYearOldBirthdate}
        }},
        {$group: {
            _id : '$householdId',
            elderly: {$push: '$$ROOT'}
        }}
    ]);

    for (const elderlyHousehold of elderlyGroupByHousehold) {

        const household = await Household.findById(elderlyHousehold._id).lean();
        if (household) {
            household.familyMembers = elderlyHousehold.elderly;
            recipientHouseholds.push(household);
        }
    }

    response.status(constants.STATUS_OK).json({
        data: recipientHouseholds
    });
};

exports.getBabySunshineGrantRecipients = async function (request, response, next) {
    
    const recipientHouseholds = [];
    const fiveYearOldBirthdate = new Date();
    fiveYearOldBirthdate.setYear(fiveYearOldBirthdate.getFullYear() - 5);

    const childrenGroupByHousehold = await FamilyMember.aggregate([
        {$match: {
            dateOfBirth : {$gte : fiveYearOldBirthdate}}},
        {$group: {
            _id : '$householdId',
            children: {$push: '$$ROOT'}
        }}
    ]);

    for (const childrenHousehold of childrenGroupByHousehold) {

        const household = await Household.findById(childrenHousehold._id).lean();
        if (household) {
            household.familyMembers = childrenHousehold.children;
            recipientHouseholds.push(household);
        }
    }

    response.status(constants.STATUS_OK).json({
        data: recipientHouseholds
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
