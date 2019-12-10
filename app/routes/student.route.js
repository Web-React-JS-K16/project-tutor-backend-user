const express = require('express');
const app = express();
const EUserType = require('../enums/EUserTypes');
const userUtils = require('../utils/user.utils');
const passport = require('passport');
const studentController = require('../controllers/student.controller');


app.get('/student/get-info', passport.authenticate('jwt', { session: false }),
    userUtils.checkRole(EUserType.STUDENT),
    studentController.getInfoStudent);

// student update info
app.post('/student/update-info',
    passport.authenticate('jwt', { session: false }),
    userUtils.checkRole(EUserType.STUDENT),
    studentController.updateInfoStudent);


module.exports = app;
