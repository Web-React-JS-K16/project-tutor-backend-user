const User = require("../models/user.model");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwtSecretConfig = require("../../config/jwt-secret.config");
// Retrieving and return all users to the database
exports.findAll = (req, res) => {
  User.find()
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      res.status(500).send({
        message: "Đã có lỗi xảy ra khi lấy danh sách người dùng."
      });
    });
};

exports.register = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({
      message: "Email hoặc mật khẩu trống."
    });
  }
  User.findOne({ email: req.body.email }, (err, data) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Đã có lỗi xảy ra, vui lòng thử lại!" });
    }
    if (data) {
      return res
        .status(400)
        .send({ message: "Email đã tồn tại, vui lòng nhập email khác." });
    }
    const user = new User(req.body);
    user.setpasswordHash(req.body.password);
    user
      .save()
      .then(data => {
        res.send({ data });
      })
      .catch(err => {
        console.log("error: ", err);
        return res
          .status(500)
          .send({ message: "Đã có lỗi xảy ra, vui lòng thử lại" });
      });
  });
};

// login with email and password
exports.login = (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      console.log("err", err);
      return res.status(200).json({
        status: false,
        message: "Email hoặc mật khẩu không đúng"
      });
    }

    req.login(user, { session: false }, err => {
      if (err) {
        return res.status(400).json({
          status: false,
          message: "Xảy ra lỗi"
        });
      }
      // generate a signed son web token with the contents of user object and return it in the response
      const { email, displayName, avatar, _id } = user;
      const token = jwt.sign(
        { email, displayName, avatar, _id },
        jwtSecretConfig.jwtSecret
      );
      return res
        .status(200)
        .json({ user: { email, displayName, avatar, _id, token } });
    });
  })(req, res);
};
