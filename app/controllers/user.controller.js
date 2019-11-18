const User = require('../models/user.model');
// Retrieving and return all users to the database
exports.findAll = (req, res) => {
  User.find()
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      res.status(500).send({
        message: 'Đã có lỗi xảy ra khi lấy danh sách người dùng.'
      });
    });
};

exports.register = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({
      message: 'Email hoặc mật khẩu trống.'
    });
  }
  User.findOne({ email: req.body.email }, (err, data) => {
    if (err) {
      return res
        .status(500)
        .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
    }
    if (data) {
      return res
        .status(400)
        .send({ message: 'Email đã tồn tại, vui lòng nhập email khác.' });
    }
    const user = new User(req.body);
    user.setHashedPassword(req.body.password);
    user
      .save()
      .then(data => {
        res.send({ data });
      })
      .catch(err => {
        console.log('error: ', err);
        return res
          .status(500)
          .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
      });
  });
};
