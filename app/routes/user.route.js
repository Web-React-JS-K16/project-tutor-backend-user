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
 * Active account
 * body: {token}
 */
app.get("/user/active-email", userController.activeEmail);
/**
 * Resend email to active account
 * body: {email}
 */
app.get("/user/resend-active-email", userController.resendActiveEmail); 



module.exports = app;
