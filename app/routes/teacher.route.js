const express = require('express');
const app = express();
const teacherController = require('../controllers/teacher.controller');

/**
 * input: id
 * output: info of one teacher in collection Teacher join User
 */

 //HAVING ERROR
app.get('/teacher/get-info', teacherController.getInfo);


module.exports = app;
