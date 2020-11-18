const asyncHandler = require('express-async-handler');
const router = require('express').Router();

const grantController = require('./Controllers/grantController');
const householdController = require('./Controllers/householdController');
const familyMemberController = require('./Controllers/familyMemberController');

router.get('/', function(request, response) {
    response.json({
        message: 'Homepage of Grant Disbursement API'
    });
});

router.route('/household')
        .get(asyncHandler(householdController.getAllHouseholds))
        .post(asyncHandler(householdController.addHousehold));

router.route('/household/:household_id')
        .get(asyncHandler(householdController.getHousehold));

router.route('/familyMember')
        .get(asyncHandler(familyMemberController.getAllFamilyMembers))
        .post(asyncHandler(familyMemberController.addFamilyMember));

router.route('/studentEncouragementBonus')
        .get(asyncHandler(grantController.getStudentEncouragementBonusRecipients));

router.route('/elderBonus')
        .get(asyncHandler(grantController.getElderBonusRecipients));

router.route('/babySunshineGrant')
        .get(asyncHandler(grantController.getBabySunshineGrantRecipients));

router.route('/yoloGstGrant')
        .get(asyncHandler(grantController.getYoloGstGrantRecipients));

module.exports = router;
