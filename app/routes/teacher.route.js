const express = require('express');
const app = express();
const teacherController = require('../controllers/teacher.controller');
const EUserType = require('../enums/EUserTypes');
const passport = require('passport');
const userUtils = require('../utils/user.utils');

/**
 * input: id
 * output: info of one teacher in collection Teacher join User
 */

//HAVING ERROR
app.get('/teacher/get-info/:id', teacherController.getInfo);
// student update info
app.post(
  '/teacher/update-info',
  passport.authenticate('jwt', { session: false }),
  userUtils.checkRole(EUserType.TEACHER),
  teacherController.updateInfoTeacher
);
app.get('/teacher/statistics/:userId', teacherController.getStatisticalData);
app.get('/teacher/statistics-home', teacherController.getStatisticalDataHome);
app.get('/teacher/search/:keyword', teacherController.searchTeacher);


module.exports = app;
