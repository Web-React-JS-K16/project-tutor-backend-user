const ObjectId = require('mongodb').ObjectID;
const Major = require('../models/major.model');

// Retrieving and return all majors
exports.getMajorList = (req, res) => {
  Major.find()
    .then(async majors => {
      res.status(200).send({
        major: majors
      });
    })
    .catch(err => {
      console.log('error: ', err.message);
      res.status(500).send({
        message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
      });
    });
};
