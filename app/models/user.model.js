const EUserType = require('../enums/EUserTypes');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const UserSchema = mongoose.Schema(
  {
    email: String,
    password: String,
    hashedPassword: String,
    avatar: String,
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

UserSchema.methods.setHashedPassword = function(password) {
  this.hashedPassword = bcrypt.hashSync(password, saltRounds);
};

UserSchema.methods.setAvatar = function(avatar) {
  this.avatar = avatar;
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.hashedPassword);
};

module.exports = mongoose.model('User', UserSchema);
