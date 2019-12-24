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

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  var today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
  var dayOfYear = (today - onejan + 86400000) / 86400000;
  return Math.ceil((dayOfYear + onejan.getDay()) / 7);
};

function getDates(fromDate, toDate) {
  var dateArray = [];
  var currentDate = fromDate;
  while (currentDate <= toDate) {
    dateArray.push({ date: new Date(currentDate), value: 0 });
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

exports.getStatisticalData = (req, res) => {
  var userId = req.params.userId || '';
  var type = req.query.type || 'month';
  var monthObj = req.query.monthObj || {
    start: { month: 0, year: 2019 },
    end: { month: 11, year: 2019 }
  };
  var weekObj = req.query.weekObj || {
    start: { week: 1, year: 2019 },
    end: { week: 10, year: 2019 }
  };
  var fromDate = req.query.fromDate || Date.now();
  var toDate = req.query.toDate || Date.now();
  var fromYear = req.query.fromYear || 2019;
  var toYear = req.query.toYear || 2024;

  Teacher.find({ userId: ObjectId(userId) })
    .then(teachers => {
      Contract.find({
        teacherId: ObjectId(userId),
        status: ContractTypes.IS_COMPLETED_BY_ADMIN
      })
        .then(contracts => {
          var data = [];
          if (type === 'date') {
            fromDate = new Date(fromDate);
            toDate = new Date(toDate);
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
            fromDate.setMilliseconds(0);
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
            toDate.setMilliseconds(0);
            data = getDates(fromDate, toDate);
          } else if (type === 'week') {
            for (let i = weekObj.start.week; i <= weekObj.end.week; i++) {
              data.push({ week: i, year: weekObj.start.year, value: 0 });
            }
          } else if (type === 'month') {
            if (monthObj.start.year !== monthObj.end.year) {
              for (let i = monthObj.start.month; i < 12; i++) {
                data.push({ month: i, year: monthObj.start.year, value: 0 });
              }
              for (
                let j = monthObj.start.year + 1;
                j < monthObj.end.year;
                j++
              ) {
                for (let i = 0; i < 12; i++) {
                  data.push({ month: i, year: j, value: 0 });
                }
              }
              for (let i = 0; i <= monthObj.end.month; i++) {
                data.push({ month: i, year: monthObj.end.year, value: 0 });
              }
            } else {
              for (let i = monthObj.start.month; i <= monthObj.end.month; i++) {
                data.push({ month: i, year: monthObj.start.year, value: 0 });
              }
            }
          } else if (type === 'year') {
            for (let i = fromYear; i <= toYear; i++) {
              data.push({ year: i, value: 0 });
            }
          }

          for (contract of contracts) {
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
            } = contract;

            let endDateFormat = new Date(endDate);

            if (type === 'date') {
              let dataIndex = data.findIndex(
                element =>
                  element.date.getDate() === endDateFormat.getDate() &&
                  element.date.getMonth() === endDateFormat.getMonth() &&
                  element.date.getFullYear() === endDateFormat.getFullYear()
              );
              if (dataIndex > -1) {
                data[dataIndex].value +=
                  parseInt(workingHour) *
                  parseFloat(costPerHour.toString()) *
                  1000;
              }
            } else if (type === 'week') {
              let dataIndex = data.findIndex(
                element =>
                  element.week === endDateFormat.getWeek() &&
                  element.year === endDateFormat.getFullYear()
              );
              if (dataIndex > -1) {
                data[dataIndex].value +=
                  parseInt(workingHour) *
                  parseFloat(costPerHour.toString()) *
                  1000;
              }
            } else if (type === 'month') {
              let dataIndex = data.findIndex(
                element =>
                  element.month === endDateFormat.getMonth() &&
                  element.year === endDateFormat.getFullYear()
              );
              data[dataIndex].value +=
                parseInt(workingHour) *
                parseFloat(costPerHour.toString()) *
                1000;
            } else if (type === 'year') {
              let dataIndex = data.findIndex(
                element => element.year === endDateFormat.getFullYear()
              );
              if (dataIndex > -1) {
                data[dataIndex].value +=
                  parseInt(workingHour) *
                  parseFloat(costPerHour.toString()) *
                  1000;
              }
            }
          }

          res.status(200).send({
            payload: data
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
