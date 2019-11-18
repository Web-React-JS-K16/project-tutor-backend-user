const EUserType = require('../enums/EUserTypes')
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const UserSchema = mongoose.Schema({
  email: String,
  password: String,
  passwordHash: String,
  displayName: String,
  phone: String,
  birthday: Date,
  googleID: String,
  facebookID: String,
  typeID: {
    type: Number,
    default: EUserType.STUDENT
  }
},{
  timestamps: true
});

UserSchema.methods.setPassword = function (password) {
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
};

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
