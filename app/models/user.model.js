const EUserType = require("../enums/EUserTypes");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

UserSchema.methods.setpasswordHash = function(password) {
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

UserSchema.methods.createUser = function ({avatar, displayName, email, googleId=null, facebookId = null}) {
  const newUser = new User();
  newUser.avatar = avatar;
  newUser.displayName = displayName;
  newUser.email = email;
  if (googleId){
    newUser.googleID = googleId;
  } 
  
  if (facebookId) {
    newUser.facebookID = facebookId;
  }
  return newUser;
};

module.exports = mongoose.model("User", UserSchema);
