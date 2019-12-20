const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const Contract = require('../models/contract.model');
const ContractTypes = require('../enums/EContractTypes');

/**
 * Get info of teacher
 * body: { id}
 */
exports.getInfo = async (req, res) => {
  try {
    // const _id = req.body
    const _id = req.params.id;
    console.log('id: ', req.params.id);
    const result = await Teacher.findOne({ userId: _id })
      .populate('userId', { passwordHash: 0, password: 0 })
      .populate('tags._id');
    // console.log("id: ", result)
    if (!result) {
      return res
        .status(400)
        .send({ message: 'Không tìm thấy thông tin người dùng!' });
    }
    const {
      city,
      district,
      salary,
      about,
      tags,
      jobs,
      hoursWorked,
      ratings,
      successRate
    } = result;
    const userResult = result.userId;
    return res.status(200).send({
      payload: {
        city,
        district,
        salary,
        about,
        tags,
        jobs,
        hoursWorked,
        ratings,
        successRate,
        user: userResult
      }
    });
  } catch (err) {
    console.log('err: ', err);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

/**
 * body: {user}
 */
exports.updateInfoTeacher = async (req, res) => {
  try {
    const { user } = req;
    const { city, district, about, tags } = req.body;
    const _cityId = city ? ObjectId(city) : null;
    const _districtId = district ? ObjectId(district) : null;

    const newTags = tags.map(item => {
      const _id = item;
      return { _id: ObjectId(_id) };
    });
    if (user) {
      await User.updateOne(
        { _id: user._id },
        { $set: { city: _cityId, district: _districtId, ...req.body } }
      );
      await Teacher.updateOne(
        { userId: user._id },
        { $set: { about, tags: newTags } }
      );
      return res
        .status(200)
        .send({ message: 'Cập nhật thông tin thành công.' });
    } else {
      return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

exports.getStatisticalData = (req, res) => {
  var userId = req.params.userId || '';
  var type = req.query.type || '';

  var monthData = [];
  for (let i = 0; i < 12; i++) {
    monthData.push({ month: i, value: 0 });
  }

  Teacher.find({ userId: ObjectId(userId) })
    .then(teacherData => {
      Contract.find({
        teacherId: ObjectId(userId),
        status: ContractTypes.IS_COMPLETED_BY_ADMIN
      })
        .then(contractsData => {
          for (data of contractsData) {
            // get contract
            const {
              name,
              status,
              isPaid,
              content,
              teacherId,
              studentId,
              startDate,
              endDate,
              costPerHour,
              workingHour
            } = data;

            let endDateFormat = new Date(endDate);
            let monthIndex = monthData.findIndex(
              data => data.month === endDateFormat.getMonth()
            );
            monthData[monthIndex].value +=
              parseInt(workingHour) * parseFloat(costPerHour.toString()) * 1000;
          }

          res.status(200).send({
            payload: monthData
          });
        })
        .catch(err => {
          console.log('error: ', err.message);
          res.status(500).send({
            message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
          });
        });
    })
    .catch(err => {
      console.log('error: ', err.message);
      res.status(500).send({
        message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
      });
    });
};
