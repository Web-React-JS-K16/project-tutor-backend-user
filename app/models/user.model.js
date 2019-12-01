const EUserType = require('../enums/EUserTypes');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const UserSchema = mongoose.Schema(
  {
    email: String,
    password: String,
    passwordHash: String,
    displayName: String,
    phone: String,
    birthdate: Date,
    googleID: String,
    facebookID: String,
    typeID: {
      type: Number,
      default: EUserType.STUDENT
    }
  },
  {
    timestamps: true
  }
);

UserSchema.methods.setPasswordHash = function(password) {
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
};

UserSchema.methods.validatePassword = function(password) {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compareSync(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
