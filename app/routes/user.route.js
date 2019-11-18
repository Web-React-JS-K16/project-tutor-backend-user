const express = require("express");
const app = express();
const users = require("../controllers/user.controller");

// Retrieve all user
app.get("/user", users.findAll);
app.post("/user/register", users.register);

module.exports = app;
