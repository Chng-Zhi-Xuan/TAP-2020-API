const asyncHandler = require('express-async-handler');
const grantController = require('./Controller/grantController');
const router = require('express').Router();

router.get('/', function(request, response) {
    response.json({
        message: 'Homepage of Grant Disbursement API'
    });
});

router.route('/household')
        .get(asyncHandler(grantController.getAllHouseholds))
        .post(asyncHandler(grantController.addHousehold));

router.route('/household/:household_id')
        .get(asyncHandler(grantController.getHousehold));

router.route('/familyMember')
        .get(asyncHandler(grantController.getAllFamilyMembers))
        .post(asyncHandler(grantController.addFamilyMember));

module.exports = router;
