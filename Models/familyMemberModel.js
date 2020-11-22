const mongoose = require('mongoose');

const familyMemberSchema = mongoose.Schema({
    householdId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    maritalStatus: {
        type: String,
        required: true
    },
    spouse: {
        type: String,
        required: false
    },
    occupationType: {
        type: String,
        required: true
    },
    annualIncome: {
        type: mongoose.SchemaTypes.Decimal128,
        required: true
    },
    dateOfBirth: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        min: '1900-01-01',
        max: Date.now
    }
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema, 'familyMemberCollection');
