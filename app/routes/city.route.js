const express = require('express');
const app = express();
const cityController = require('../controllers/city.controller');
const EUserType = require('../enums/EUserTypes');
const passport = require('passport');
const userUtils = require('../utils/user.utils');


/**
 * input: id
 * output: info of one teacher in collection Teacher join User
 */

 //HAVING ERROR
app.get('/city/get-all', cityController.getAll);

module.exports = app;
