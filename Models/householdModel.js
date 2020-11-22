const mongoose = require('mongoose');

const householdSchema = mongoose.Schema({
    housingType: {
        type: String,
        required: true
    },
    householdIncome: {
        type: mongoose.SchemaTypes.Decimal128,
        required: true
    }
});

module.exports = mongoose.model('Household', householdSchema, 'householdCollection');
