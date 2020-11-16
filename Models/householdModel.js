const mongoose = require('mongoose');

const householdSchema = mongoose.Schema({
    housingType: {
        type: String,
        required: true
    },
    householdFamily: {
        type: Array,
        required: true
    },
    householdIncome: {
        type: mongoose.SchemaTypes.Decimal128,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Household', householdSchema, 'householdCollection');
