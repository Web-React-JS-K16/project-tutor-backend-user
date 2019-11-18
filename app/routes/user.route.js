const express = require('express');
const app = express();
const userController = require('../controllers/user.controller');

// Retrieve all user
app.get('/user', userController.findAll);
app.post('/user/register', userController.register);

module.exports = app;
