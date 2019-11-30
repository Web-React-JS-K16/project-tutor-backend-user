const User = require("../models/user.model");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwtSecretConfig = require("../../config/jwt-secret.config");
const userUtils = require("../utils/user.utils");
const sendEmailUtils = require("../utils/send-email.utils");
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
        // send active email
        const token = userUtils.createActiveEmailTokenWithId(data._id);
        sendEmailUtils.sendVerificationEmail(data.displayName, data.email, token);

        res.status(200).send({ data });
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
      return res.status(400).json({
        status: false,
        message: "Email hoặc mật khẩu không đúng"
      });
    }
    if (user.typeID !== req.body.typeID) {
      return res.status(400).json({
        status: false,
        message: "Tài khoản không hợp lệ"
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
      const { email, displayName, avatar, _id, typeID } = user;
      const token = jwt.sign(
        { email, displayName, avatar, _id, typeID },
        jwtSecretConfig.jwtSecret
      );
      return res
        .status(200)
        .json({ user: { email, displayName, avatar, _id, token, typeID } });
    });
  })(req, res);
};

/**
 * input: {avatar, displayName, email, typeID, googleId, facebookID}
 * Create a new one if user not exist in db
 */
exports.authenWithSocial = (req, res) => {
  const { email, facebookID, googleID, typeID } = req.body;
  User.findOne({ email }, (err, data) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Đã có lỗi xảy ra, vui lòng thử lại!" });
    }
    if (!data) { // create new user
      const user = new User(req.body);
      user.save()
        .catch((err) => {
          console.log("error: ", err);
          return res
            .status(500)
            .send({ message: "Đã có lỗi xảy ra, vui lòng thử lại" });
        });
    } else if (data) {
      // check typeId
      if (data.typeID !== typeID) {
        return res
          .status(400)
          .send({ message: 'Tài khoản không hợp lệ' });
      }
      if (data.facebookID !== facebookID) { // update facebookID
        User.updateOne({ email }, { $set: { "facebookID": facebookID } }, (err, rs) => {
          //  console.log("after update:", rs);
        });
      }

      if (data.googleID !== googleID) { // update googleID
        console.log("on update googleid: ");
        User.updateOne({ email }, { $set: { "googleID": googleID } }, (err, rs) => {
          //  console.log("after update:", rs);
        });
      }
    }

    const token = userUtils.createUserToken(req.body);

    return res
      .status(200)
      .send({ user: { ...req.body, token } });

  }).catch((err) => {
    console.log("catch err: ", err);
    return res
      .status(500)
      .send({ message: err.message });
  })
};

/**
 * body: {token}
 */
exports.activeEmail = (req, res) => {
  const { token } = req.body;
  const { userId } = userUtils.decodeActiveEmailToken(token);
  if (userId) {
    User.findOne({ _id: userId }, (err, data) => {
      if (data) {
        if (data.isAcitved) {
          return res.status(400).send({ message: "Tài khoản đã được kích hoạt" });
        }
        // update isAcitved
        User.updateOne({ _id: userId }, { $set: { "isAcitved": true } }, (err, result) => {
          if (result) {
            return res.status(200).send({ message: "Kích hoạt tài khoản thành công" });
          } else {
            return res.status(400).send({ message: "Kích hoạt tài khoản thất bại" });
          }
        })
      } else {
        return res.status(400).send({ message: "Tài khoản không tồn tại" });
      }
    })
  } else {
    return res.status(400).send({ message: "Link đã hết hạn hoặc không hợp lệ" });
  }
}

/**
 * body: {email}
 */
exports.resendActiveEmail = (req, res) => {
  const { email } = req.body;
  try {
    User.findOne({ email }, (err, data) => {
      if (!data) {
        res.status(400).send({ message: "Tài khoản không tồn tại" });
      } else {
        const token = userUtils.createActiveEmailTokenWithId(data._id);
        sendEmailUtils.sendVerificationEmail(data.displayName, data.email, token);
        res.status(200).send({ message: "Gửi lại email thành công" });
      }
    })
  } catch (err) {
    res.status(400).send({ message: "Có lỗi xảy ra" });
  }
}

