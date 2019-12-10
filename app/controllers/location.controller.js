const ObjectId = require('mongodb').ObjectID;
const City = require('../models/city.model');
const District = require('../models/district.model');

// Retrieving and return all majors
exports.getLocationList = (req, res) => {
  City.find()
    .then(async cities => {
      const locationList = [];
      for (city of cities) {
        var city = { _id: city._id, name: city.name, districtList: [] };
        var districtData = await District.find();
      }
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
