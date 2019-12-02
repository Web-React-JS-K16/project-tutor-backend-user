const express = require("express");
const app = express();
const userController = require("../controllers/user.controller");

// Retrieve all user
app.get("/user", userController.findAll);
app.post("/user/register", userController.register);
app.post("/user/login", userController.login); //login with email and password

/**
 * Login with fb/gg
 * Create a new one if user not exist in db
 * */ 
app.post("/user/authen-with-social", userController.authenWithSocial);

/**
 * Active account by token that was sent in email
 * body: {token}
 */
app.post("/user/active-email", userController.activeEmail);
/**
 * Resend email to active account
 * body: {email}
 */
app.post("/user/resend-active-email", userController.resendActiveEmail); 

/**
 * Send email to reset password
 * body: {email}
 */
app.post("/user/send-email-reset-password", userController.sendMailResetPassword);
app.post("/user/verify-token-reset-password", userController.verifyTokenResetPassword);
app.post("/user/reset-password", userController.resetPassword);



app.get("/test", userController.test); 


module.exports = app;
