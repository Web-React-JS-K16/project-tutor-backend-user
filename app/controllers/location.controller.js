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
        var districtList = await District.find({
          cityId: ObjectId(city._id)
        });
        for (district of districtList) {
          const { _id, name } = district;
          city.districtList.push({ _id, name });
        }
        locationList.push(city);
      }
      res.status(200).send({
        location: locationList
      });
    })
    .catch(err => {
      console.log('error: ', err.message);
      res.status(500).send({
        message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
      });
    });
};
