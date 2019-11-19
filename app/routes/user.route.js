const express = require("express");
const app = express();
const userController = require("../controllers/user.controller");

// Retrieve all user
app.get("/user", userController.findAll);
app.post("/user/register", userController.register);
app.post("/user/login", userController.login); //login with email and password

module.exports = app;
