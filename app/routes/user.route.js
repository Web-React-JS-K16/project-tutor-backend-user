const express = require('express');
const app = express();
const passport = require('passport');
const userController = require('../controllers/user.controller');
const userUtils = require('../utils/user.utils');
const EUserType = require('../enums/EUserTypes');

// Retrieve all user
app.get('/user', userController.getUserList);
app.get(
  '/user/authenticate',
  passport.authenticate('jwt', { session: false }),
  function(req, res, next) {
    res.send(req.user);
  }
);
app.post('/user/register', userController.register);
app.post('/user/login', userController.login); //login with email and password
app.get('/user/info/:id', userController.getUserInfo);
app.get('/user/quantity', userController.countUsers);

/**
 * Login with fb/gg
 * Create a new one if user not exist in db
 * */

app.post('/user/authen-with-social', userController.authenWithSocial);

/**
 * Active account by token that was sent in email
 * body: {token}
 */
app.post('/user/active-email', userController.activeEmail);
/**
 * Resend email to active account
 * body: {email}
 */
app.post('/user/resend-active-email', userController.resendActiveEmail);

/**
 * Send email to reset password
 * body: {email}
 */
app.post(
  '/user/send-email-reset-password',
  userController.sendMailResetPassword
);
app.post(
  '/user/verify-token-reset-password',
  userController.verifyTokenResetPassword
);
app.post('/user/reset-password', userController.resetPassword);
app.post(
  '/user/change-password',
  passport.authenticate('jwt', { session: false }),
  userController.changePassword
);
// student update info
app.post(
  '/user/update-avatar',
  passport.authenticate('jwt', { session: false }),
  userController.updateAvatar
);

module.exports = app;
