const express = require('express');
const app = express();
const tagController = require('../controllers/tag.controller');

app.get('/tag/get-all', tagController.getAll);


module.exports = app;
