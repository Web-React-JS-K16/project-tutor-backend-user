const User = require("../models/user.model");
// Retrieving and return all users to the database
exports.findAll = (req, res) => {
  User.find()
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      res.status(500).send({
        message: "Some error occurred while retrieving users"
      });
    });
};

exports.register = (req, res) => {
  if (!req.body.email || !req.body.password) {
      return res.status(400).send({
          message: "email and password not empty."
      })
  }
  User.findOne({ email: req.body.email }, (err, data) => {
      if (err) {
          return res.status(500).json(
              "Đã có lỗi xảy ra, vui lòng thử lại."
          );
      }
      if (data) {
          return res.status(400).json("Email đã tồn tại, vui lòng nhập email khác.");
      }
      else {
          const user = new User(req.body)
          user.setPassword(req.body.password)
          user.save()
              .then(data => {
                  res.send(data);
              }).catch(err => {
                  return res.status(500).json("Đã có lỗi xảy ra, vui lòng thử lại."
                  );
              });
      }
  })
}