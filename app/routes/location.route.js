const express = require('express');
const app = express();
const locationController = require('../controllers/location.controller');

// Retrieve all locations
app.get('/location', locationController.getLocationList);

module.exports = app;
