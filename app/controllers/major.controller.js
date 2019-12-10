const ObjectId = require('mongodb').ObjectID;
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');
const Tag = require('../models/tag.model');
const Major = require('../models/major.model');
const Comment = require('../models/comment.model');
const Contract = require('../models/contract.model');

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
