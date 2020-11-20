const apiRoutes = require("./routes")
const bodyParser = require('body-parser');
const express = require('express')
const mongoose = require('mongoose');

const app = express();
var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/api', apiRoutes)

const grantDBPath = 'mongodb://127.0.0.1:27017/grantDB';
const options = {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}
const mongo = mongoose.connect(grantDBPath, options);

mongo.then(() => {
    console.log('connected to ' + grantDBPath);
}, error => {
    console.log(error, 'error');
})

app.listen(port, () => {
    console.log("Running Grant Disbursement API on Port " + port);
})
