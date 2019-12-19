const express = require('express');
const app = express();
const chatController = require('../controllers/chat.controller');
const EUserType = require('../enums/EUserTypes');
const passport = require('passport');
const userUtils = require('../utils/user.utils');


/**
 * input: token
 * output: all chat room of user
 */
app.get('/chat',
    passport.authenticate('jwt', { session: false }),
    chatController.getAll);
app.get('/chat/get-detail/:room',
    passport.authenticate('jwt', { session: false }),
    chatController.getDetail);
app.post('/chat/create',
    passport.authenticate('jwt', { session: false }),
    userUtils.checkRole(EUserType.STUDENT),
    chatController.create);


module.exports = app;
