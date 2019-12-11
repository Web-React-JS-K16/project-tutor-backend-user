const express = require('express');
const app = express();
const contractController = require('../controllers/contract.controller');

// Retrieve all contracts
app.get('/contract', contractController.getContractList);

app.post('/contract/create', contractController.createContract);

module.exports = app;
