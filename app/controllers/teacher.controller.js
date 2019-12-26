const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const Contract = require('../models/contract.model');
const Tag = require('../models/tag.model');
const ContractTypes = require('../enums/EContractTypes');
const Helpers = require('./../helpers/helpers');

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
    const { city, district, about, tags, salary } = req.body;
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
        { $set: { about, tags: newTags, salary } }
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
  var type = req.query.type || 'date';
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
            const startDate = new Date(parseInt(fromDate));
            const endDate = new Date(parseInt(toDate));
            startDate.setHours(0);
            startDate.setMinutes(0);
            startDate.setSeconds(0);
            startDate.setMilliseconds(0);
            endDate.setHours(0);
            endDate.setMinutes(0);
            endDate.setSeconds(0);
            endDate.setMilliseconds(0);
            data = getDates(startDate, endDate);
          } else if (type === 'week') {
            const startWeek = parseInt(weekObj.start.week);
            const endWeek = parseInt(weekObj.end.week);
            const year = parseInt(weekObj.start.year);
            for (let i = startWeek; i <= endWeek; i++) {
              data.push({ week: i, year: year, value: 0 });
            }
          } else if (type === 'month') {
            const startMonth = parseInt(monthObj.start.month);
            const endMonth = parseInt(monthObj.end.month);
            const startYear = parseInt(monthObj.start.year);
            const endYear = parseInt(monthObj.end.year);
            if (startYear !== endYear) {
              for (let i = startMonth; i < 12; i++) {
                data.push({ month: i, year: startYear, value: 0 });
              }
              for (let j = startYear + 1; j < endYear; j++) {
                for (let i = 0; i < 12; i++) {
                  data.push({ month: i, year: j, value: 0 });
                }
              }
              for (let i = 0; i <= endMonth; i++) {
                data.push({ month: i, year: endYear, value: 0 });
              }
            } else {
              for (let i = startMonth; i <= endMonth; i++) {
                data.push({ month: i, year: startYear, value: 0 });
              }
            }
          } else if (type === 'year') {
            for (let i = parseInt(fromYear); i <= parseInt(toYear); i++) {
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
              if (dataIndex > -1) {
                data[dataIndex].value +=
                  parseInt(workingHour) *
                  parseFloat(costPerHour.toString()) *
                  1000;
              }
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

/**
 * body: {keyword}
 */
exports.searchTeacher = async (req, res) => {
  try {
    const { keyword } = req.params;
    // const keyword = 'đại số 10'
    console.log('keyword: ', keyword);

    const result = await Teacher.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'user.city',
          foreignField: '_id',
          as: 'city'
        }
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'user.district',
          foreignField: '_id',
          as: 'district'
        }
      },
      { $unwind: '$tags' },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags._id',
          foreignField: '_id',
          as: 'tags'
        }
      },

      {
        $unwind: {
          path: '$city',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$district',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$tags',
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $match: {
          $or: [
            { 'tags.name': { $regex: keyword, $options: 'i' } },
            { 'user.displayName': { $regex: keyword, $options: 'i' } },
            { 'city.name': { $regex: keyword, $options: 'i' } },
            { 'district.name': { $regex: keyword, $options: 'i' } },
            { about: { $regex: keyword, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: '$user._id'
        }
      }
    ]);
    // get arr id
    const idResult = result.map(item => ObjectId(item._id[0]));
    // get data
    const payload = await Teacher.find({ userId: { $in: idResult } })
      .populate('tags._id')
      .populate({
        path: 'userId',
        select: ['-password', '-passwordHash'],
        populate: [
          {
            path: 'city'
          },
          {
            path: 'district'
          }
        ]
      });

    return res.status(200).send({
      message: 'Cập nhật thông tin thành công.',
      count: result.length,
      result: idResult,
      payload
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

exports.getStatisticalDataHome = async (req, res) => {
  try {
    const data = await Contract.aggregate([
      Helpers.project,
      {
        $match: {
          $and: [
            { status: ContractTypes.IS_COMPLETED_BY_ADMIN },
            { isPaid: true },
            { teacherId: { $ne: null } }
          ]
        }
      },
      Helpers.group,
      {
        $lookup: {
          from: 'teachers',
          localField: '_id',
          foreignField: 'userId',
          as: 'teacher'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teacher.userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'user.city',
          foreignField: '_id',
          as: 'city'
        }
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'user.district',
          foreignField: '_id',
          as: 'district'
        }
      },
      {
        $unwind: {
          path: '$teacher.tags',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'teacher.tags._id',
          foreignField: '_id',
          as: 'tag'
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $project: {
          'user._id': 1,
          'user.displayName': 1,
          tag: 1,
          'teacher.successRate': 1,
          'teacher.ratings': 1,
          'teacher.salary': 1,
          'user.phone': 1,
          'city.name': 1,
          'district.name': 1,
          'user.avatar': 1
        }
      }
    ]);

    if (data.length > 0) {
      return res.status(200).json({ data });
    } else {
      return res.status(400).json({ message: 'Không tìm thấy dữ liệu' });
    }
  } catch (err) {
    console.log('err: ', err);
    return res.status(500).json({ message: 'Có lỗi xảy ra.' });
  }
};
