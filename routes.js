const asyncHandler = require('express-async-handler');
const constants = require('./Utils/constants');
const router = require('express').Router();

const familyMemberController = require('./Controllers/familyMemberController');
const grantController = require('./Controllers/grantController');
const householdController = require('./Controllers/householdController');

router.get('/', function(request, response) {
    response.status(constants.STATUS_OK).send('Homepage of Grant Disbursement API');
});

// Household APIs
router.route('/household')
        .get(asyncHandler(householdController.getAllHouseholds))
        .post(asyncHandler(householdController.addHousehold));

router.route('/household/:household_id')
        .get(asyncHandler(householdController.getHousehold))
        .delete(asyncHandler(householdController.removeHousehold));

// Family Member APIs
router.route('/familyMember')
        .get(asyncHandler(familyMemberController.getAllFamilyMembers))
        .post(asyncHandler(familyMemberController.addFamilyMember));

router.route('/familyMember/:family_member_id')
        .delete(asyncHandler(familyMemberController.removeFamilyMember));

// Grant APIs
router.route('/studentEncouragementBonus')
        .get(asyncHandler(grantController.getStudentEncouragementBonusRecipients));

router.route('/familyTogethernessScheme')
        .get(asyncHandler(grantController.getFamilyTogethernessSchemeRecipients));

router.route('/elderBonus')
        .get(asyncHandler(grantController.getElderBonusRecipients));

router.route('/babySunshineGrant')
        .get(asyncHandler(grantController.getBabySunshineGrantRecipients));

router.route('/yoloGstGrant')
        .get(asyncHandler(grantController.getYoloGstGrantRecipients));

module.exports = router;
