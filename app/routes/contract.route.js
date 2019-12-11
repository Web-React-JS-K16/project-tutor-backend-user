const express = require('express');
const app = express();
const contractController = require('../controllers/contract.controller');
const passport = require('passport');

// Retrieve all contracts
app.get('/contract', contractController.getContractList);
// get contract detail
app.get('/contract/:_id',
    passport.authenticate('jwt', { session: false }),
    contractController.getContract);

app.post('/contract/create', contractController.createContract);



module.exports = app;
