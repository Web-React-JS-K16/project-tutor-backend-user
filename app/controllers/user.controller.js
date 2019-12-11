const ObjectId = require('mongodb').ObjectID;
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');
const Tag = require('../models/tag.model');
const Major = require('../models/major.model');
const Comment = require('../models/comment.model');
const Contract = require('../models/contract.model');
const City = require('../models/city.model');
const District = require('../models/district.model');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtSecretConfig = require('../../config/jwt-secret.config');
const userUtils = require('../utils/user.utils');
const sendEmailUtils = require('../utils/send-email.utils');
const UserTypes = require('../enums/EUserTypes');
const formatCostHelper = require('../helpers/format-cost.helper');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const DefaultValues = require('../utils/default-values.utils');

// Retrieving and return all users to the database
exports.getUserList = async (req, res) => {
  var typeId = req.query.type || DefaultValues.typeId;
  var pageNumber = req.query.page || DefaultValues.pageNumber;
  var itemPerPage = req.query.limit || DefaultValues.itemPerPage;
  var fromSalary = req.query.fromSalary || DefaultValues.fromSalary;
  var toSalary = req.query.toSalary || DefaultValues.toSalary;
  var majors = req.query.majors || DefaultValues.majors;
  var location = req.query.location || DefaultValues.location;

  if (isNaN(typeId) || typeId < 0) {
    typeId = DefaultValues.typeId;
  } else {
    typeId = parseInt(typeId);
  }
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = DefaultValues.pageNumber;
  } else {
    pageNumber = parseInt(pageNumber);
  }
  if (isNaN(itemPerPage) || itemPerPage < 1) {
    itemPerPage = DefaultValues.itemPerPage;
  } else {
    itemPerPage = parseInt(itemPerPage);
  }
  if (isNaN(fromSalary) || fromSalary < 0) {
    fromSalary = DefaultValues.fromSalary;
  } else {
    fromSalary = parseFloat(fromSalary);
  }
  if (isNaN(toSalary) || toSalary < 0) {
    toSalary = DefaultValues.toSalary;
  } else {
    toSalary = parseFloat(toSalary);
  }

  // get tags by majorId
  var tagList = [];
  if (majors.length !== 0) {
    for (majorId of majors) {
      const tags = await Tag.find({ majorId: ObjectId(majorId) });
      tagList = tagList.concat(tags);
    }
  }

  // build query
  var query = {};
  query['salary'] = { $gte: fromSalary, $lte: toSalary };
  query['$or'] = [];

  if (tagList.length > 0) {
    const queryInTags = {};
    queryInTags['$in'] = [];
    for (tag of tagList) {
      queryInTags['$in'].push(ObjectId(tag._id));
    }
    query['tags._id'] = queryInTags;
  }

  Object.keys(location).forEach(key => {
    const orCondition = { city: ObjectId(key) };
    const queryInDistricts = {};
    queryInDistricts['$in'] = [];
    for (districtId of location[key].districtList) {
      queryInDistricts['$in'].push(ObjectId(districtId));
    }
    orCondition['district'] = queryInDistricts;
    query['$or'].push(orCondition);
  });

  if (query['$or'].length === 0) {
    delete query['$or'];
  }

  if (typeId === UserTypes.TEACHER) {
    Teacher.find(query)
      .skip(itemPerPage * (pageNumber - 1))
      .limit(itemPerPage)
      .then(async teachers => {
        var teacherList = [];
        for (teacher of teachers) {
          const user = await User.find({ _id: ObjectId(teacher.userId) });

          // get user
          const {
            typeID,
            isBlock,
            isActive,
            email,
            displayName,
            avatar
          } = user[0];

          // get teacher
          const {
            _id,
            city,
            district,
            salary,
            about,
            successRate,
            ratings,
            tags,
            jobs,
            hoursWorked,
            userId
          } = teacher;

          const cityData = await City.findOne({ _id: ObjectId(city) });
          const districtData = await District.findOne({
            _id: ObjectId(district)
          });

          let formatSalary = formatCostHelper(salary.toString() + '000');
          teacherList.push({
            typeID,
            isBlock,
            isActive,
            email,
            displayName,
            avatar,
            teacherId: _id,
            city: cityData,
            district: districtData,
            salary: formatSalary,
            about,
            successRate,
            ratings,
            tags,
            jobs,
            hoursWorked,
            _id: userId
          });
        }

        res.status(200).send({
          user: teacherList
        });
      })
      .catch(err => {
        console.log('error: ', err.message);
        res.status(500).send({
          message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
        });
      });
  } else if (typeId === UserTypes.STUDENT) {
    Student.find()
      .skip(itemPerPage * (pageNumber - 1))
      .limit(itemPerPage)
      .then(async students => {
        var studentList = [];

        for (student of students) {
          const user = await User.find({ _id: ObjectId(student.userId) });

          // get user
          const {
            typeID,
            isBlock,
            isActive,
            email,
            displayName,
            avatar
          } = user[0];

          // get student
          const { _id, city, district, userId } = student;
          const cityData = await City.findOne({ _id: ObjectId(city) });
          const districtData = await District.findOne({
            _id: ObjectId(district)
          });

          studentList.push({
            typeID,
            isBlock,
            isActive,
            email,
            displayName,
            avatar,
            studentId: _id,
            city: cityData,
            district: districtData,
            _id: userId
          });
        }

        res.status(200).send({
          user: studentList
        });
      })
      .catch(err => {
        console.log('error: ', err.message);
        res.status(500).send({
          message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
        });
      });
  }
};

exports.countUsers = (req, res) => {
  var typeId = req.query.type || DefaultValues.typeId;
  var fromSalary = req.query.fromSalary || DefaultValues.fromSalary;
  var toSalary = req.query.toSalary || DefaultValues.toSalary;
  var majors = req.query.majors || DefaultValues.majors;
  var location = req.query.location || DefaultValues.location;

  if (isNaN(typeId) || typeId < 0) {
    typeId = DefaultValues.typeId;
  } else {
    typeId = parseInt(typeId);
  }
  if (isNaN(fromSalary) || fromSalary < 0) {
    fromSalary = DefaultValues.fromSalary;
  } else {
    fromSalary = parseFloat(fromSalary);
  }
  if (isNaN(toSalary) || toSalary < 0) {
    toSalary = DefaultValues.toSalary;
  } else {
    toSalary = parseFloat(toSalary);
  }

  // get tags by majorId
  var tagList = [];
  if (majors.length !== 0) {
    for (majorId of majors) {
      const tags = await Tag.find({ majorId: ObjectId(majorId) });
      tagList = tagList.concat(tags);
    }
  }

  // build query
  var query = {};
  query['salary'] = { $gte: fromSalary, $lte: toSalary };
  query['$or'] = [];

  if (tagList.length > 0) {
    const queryInTags = {};
    queryInTags['$in'] = [];
    for (tag of tagList) {
      queryInTags['$in'].push(ObjectId(tag._id));
    }
    query['tags._id'] = queryInTags;
  }

  Object.keys(location).forEach(key => {
    const orCondition = { city: ObjectId(key) };
    const queryInDistricts = {};
    queryInDistricts['$in'] = [];
    for (districtId of location[key].districtList) {
      queryInDistricts['$in'].push(ObjectId(districtId));
    }
    orCondition['district'] = queryInDistricts;
    query['$or'].push(orCondition);
  });

  if (query['$or'].length === 0) {
    delete query['$or'];
  }

  if (typeId === UserTypes.TEACHER) {
    Teacher.countDocuments(query)
      .then(quantity => {
        res.status(200).send({ user: quantity });
      })
      .catch(err => {
        console.log('error: ', err.message);
        res.status(500).send({
          message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
        });
      });
  } else if (typeId === UserTypes.STUDENT) {
    Student.countDocuments()
      .then(quantity => {
        res.status(200).send({ user: quantity });
      })
      .catch(err => {
        console.log('error: ', err.message);
        res.status(500).send({
          message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
        });
      });
  }
};

exports.getUserInfo = (req, res) => {
  var userId = req.query.id || '';

  User.findById({ _id: ObjectId(userId) })
    .then(user => {
      if (user) {
        if (user.typeID === UserTypes.TEACHER) {
          Teacher.find({ userId: ObjectId(user._id) })
            .then(teacherData => {
              Contract.find({ teacherId: ObjectId(user._id) })
                .then(async contractsData => {
                  var contracts = [];
                  for (data of contractsData) {
                    // get comment of contract
                    const commentData = await Comment.find({
                      contractId: ObjectId(data._id)
                    });

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
                    let formatCostPerHour = formatCostHelper(
                      costPerHour.toString() + '000'
                    );
                    let formatCost = formatCostHelper(
                      (
                        parseInt(costPerHour.toString()) * workingHour
                      ).toString() + '000'
                    );
                    contracts.push({
                      name,
                      status,
                      isPaid,
                      content,
                      teacherId,
                      studentId,
                      startDate,
                      endDate,
                      costPerHour: formatCostPerHour,
                      cost: formatCost,
                      workingHour,
                      comment: commentData[0]
                    });
                  }

                  // get user
                  const {
                    typeID,
                    isBlock,
                    isActive,
                    email,
                    displayName,
                    avatar
                  } = user;

                  // get teacher
                  const {
                    _id,
                    city,
                    district,
                    salary,
                    about,
                    successRate,
                    ratings,
                    tags,
                    jobs,
                    hoursWorked,
                    userId
                  } = teacherData[0];

                  const cityData = await City.findOne({ _id: ObjectId(city) });
                  const districtData = await District.findOne({
                    _id: ObjectId(district)
                  });
                  let formatSalary = formatCostHelper(
                    salary.toString() + '000'
                  );

                  res.status(200).send({
                    user: {
                      typeID,
                      isBlock,
                      isActive,
                      email,
                      displayName,
                      avatar,
                      teacherId: _id,
                      city: cityData,
                      district: districtData,
                      salary: formatSalary,
                      about,
                      successRate,
                      ratings,
                      tags,
                      jobs,
                      hoursWorked,
                      _id: userId,
                      contracts
                    }
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
        } else {
          Student.find({ userId: ObjectId(user._id) })
            .then(studentData => {
              Contract.find({ studentId: ObjectId(user._id) })
                .then(async contractsData => {
                  var contracts = [];
                  for (data of contractsData) {
                    // get comment of contract
                    const commentData = await Comment.find({
                      contractId: ObjectId(data._id)
                    });

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
                    let formatCostPerHour = formatCostHelper(
                      costPerHour.toString() + '000'
                    );
                    let formatCost = formatCostHelper(
                      (
                        parseInt(costPerHour.toString()) * workingHour
                      ).toString() + '000'
                    );
                    contracts.push({
                      name,
                      status,
                      isPaid,
                      content,
                      teacherId,
                      studentId,
                      startDate,
                      endDate,
                      costPerHour: formatCostPerHour,
                      cost: formatCost,
                      workingHour,
                      comment: commentData[0]
                    });
                  }

                  // get user
                  const {
                    typeID,
                    isBlock,
                    isActive,
                    email,
                    displayName,
                    avatar
                  } = user;

                  // get student
                  const { _id, city, district, userId } = studentData[0];
                  const cityData = await City.findOne({ _id: ObjectId(city) });
                  const districtData = await District.findOne({
                    _id: ObjectId(district)
                  });

                  res.status(200).send({
                    user: {
                      typeID,
                      isBlock,
                      isActive,
                      email,
                      displayName,
                      avatar,
                      studentId: _id,
                      city: cityData,
                      district: districtData,
                      _id: userId,
                      contracts
                    }
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
        }
      } else {
        res.status(400).send({
          message: 'Người dùng chưa đăng kí tài khoản.'
        });
      }
    })
    .catch(err => {
      console.log('error: ', err.message);
      res.status(500).send({
        message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
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
    user.setPasswordHash(req.body.password);
    user.avatar =
      'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_960_720.png';
    user
      .save()
      .then(userData => {
        // send active email
        const token = userUtils.createActiveEmailTokenWithId(userData._id);
        sendEmailUtils.sendVerificationEmail(
          userData.displayName,
          userData.email,
          token
        );
        if (userData.typeID === UserTypes.TEACHER) {
          const teacher = new Teacher();
          teacher.userId = userData._id;
          teacher
            .save()
            .then(teacherData => {
              res.status(200).send({ user: userData });
            })
            .catch(err => {
              console.log('error: ', err.message);
              return res
                .status(500)
                .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
            });
        } else {
          const student = new Student();
          student.userId = userData._id;
          student
            .save()
            .then(studentData => {
              res.status(200).send({ user: userData });
            })
            .catch(err => {
              console.log('error: ', err.message);
              return res
                .status(500)
                .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
            });
        }
      })
      .catch(err => {
        console.log('error: ', err.message);
        return res
          .status(500)
          .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
      });
  });
};

// login with email and password
exports.login = (req, res) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.log('error', err.message);
      return res.status(400).json({
        status: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }
    if (user.typeID !== req.body.typeID) {
      return res.status(400).json({
        status: false,
        message: 'Tài khoản không hợp lệ'
      });
    }
    req.login(user, { session: false }, err => {
      if (err) {
        return res.status(400).json({
          status: false,
          message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
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
        .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
    }
    if (!data) {
      // create new user
      const user = new User(req.body);
      user
        .save()
        .then(userData => {
          if (userData.typeID === UserTypes.TEACHER) {
            const teacher = new Teacher();
            teacher.userId = userData._id;
            teacher.save().catch(err => {
              console.log('error: ', err.message);
              return res
                .status(500)
                .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
            });
          } else {
            const student = new Student();
            student.userId = userData._id;
            student.save().catch(err => {
              console.log('error: ', err.message);
              return res
                .status(500)
                .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
            });
          }

          const token = userUtils.createUserToken(req.body);
          const { _id } = userData;

          return res.status(200).send({ user: { ...req.body, token, _id } });
        })
        .catch(err => {
          console.log('error: ', err.message);
          return res
            .status(500)
            .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
        });
    } else if (data) {
      // check typeId
      if (data.typeID !== typeID) {
        return res.status(400).send({ message: 'Tài khoản không hợp lệ' });
      }
      if (data.facebookID !== facebookID) {
        // update facebookID
        User.updateOne(
          { email },
          { $set: { facebookID: facebookID } },
          (err, rs) => {
            //  console.log("after update:", rs);
          }
        );
      }

      if (data.googleID !== googleID) {
        // update googleID
        console.log('on update googleid: ');
        User.updateOne(
          { email },
          { $set: { googleID: googleID } },
          (err, rs) => {
            //  console.log("after update:", rs);
          }
        );
      }

      const token = userUtils.createUserToken(req.body);
      const { _id } = data;

      return res.status(200).send({ user: { ...req.body, token, _id } });
    }
  }).catch(err => {
    console.log('error: ', err.message);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  });
};

/**
 * body: {token}
 */
exports.activeEmail = async (req, res) => {
  const { token } = req.body;
  try {
    const { userId } = await userUtils.decodeActiveEmailToken(token);
    // console.log("user id: ", userId);
    if (userId) {
      const data = await User.findOne({ _id: userId });
      if (data) {
        if (data.isAcitved) {
          return res
            .status(400)
            .send({ message: 'Tài khoản đã được kích hoạt' });
        }
        // update isAcitved
        const result = await User.updateOne(
          { _id: userId },
          { $set: { isActived: true } }
        );
        if (result) {
          return res
            .status(200)
            .send({ message: 'Kích hoạt tài khoản thành công' });
        } else {
          return res
            .status(400)
            .send({ message: 'Kích hoạt tài khoản thất bại' });
        }
      } else {
        return res.status(400).send({ message: 'Tài khoản không tồn tại' });
      }
    } else {
      return res
        .status(400)
        .send({ message: 'Link đã hết hạn hoặc không hợp lệ' });
    }
  } catch {
    return res.status(400).send({ message: 'Có lỗi xảy ra' });
  }
};

/**
 * body: {email}
 */
exports.resendActiveEmail = (req, res) => {
  const { email } = req.body;
  try {
    User.findOne({ email }, (err, data) => {
      if (!data) {
        res.status(400).send({ message: 'Tài khoản không tồn tại' });
      } else {
        const token = userUtils.createActiveEmailTokenWithId(data._id);
        sendEmailUtils.sendVerificationEmail(
          data.displayName,
          data.email,
          token
        );
        res.status(200).send({ message: 'Gửi lại email thành công' });
      }
    });
  } catch (err) {
    res.status(400).send({ message: 'Có lỗi xảy ra' });
  }
};

/**
 * body: {email}
 */
exports.sendMailResetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const data = await User.findOne({ email });
    if (data) {
      // update isAcitved
      const token = await userUtils.createResetPasswordTokenWithId(data._id);
      console.log('token: ', token);
      sendEmailUtils.sendResetPasswordEmail(
        data.displayName,
        data.email,
        token
      );
      res
        .status(200)
        .send({ message: 'Gửi email lấy lại mật khẩu thành công' });
    } else {
      return res.status(400).send({ message: 'Tài khoản không tồn tại' });
    }
  } catch (err) {
    console.log('error: ', err.message);
    res.status(400).send({ message: 'Có lỗi xảy ra' });
  }
};

/**
 * body: {token}
 * output: userId
 */
exports.verifyTokenResetPassword = async (req, res) => {
  const { token } = req.body;
  try {
    const { userId } = await userUtils.decodeResetPasswordToken(token);
    // console.log("user id: ", userId);
    if (userId) {
      const data = await User.findOne({ _id: userId });
      if (data) {
        return res
          .status(200)
          .send({ message: 'Mã xác nhận đúng', userId: data._id });
      } else {
        return res.status(400).send({ message: 'Mã xác nhận không hợp lệ' });
      }
    } else {
      return res
        .status(400)
        .send({ message: 'Mã xác nhận đã hết hạn hoặc không hợp lệ' });
    }
  } catch {
    return res.status(400).send({ message: 'Có lỗi xảy ra' });
  }
};

/**
 * body: {password, userId}
 */
exports.resetPassword = async (req, res) => {
  const { password, userId } = req.body;
  try {
    user = await User.findOne({ _id: userId });
    console.log('user: ', user);
    console.log('userid: ', userId);
    if (user) {
      const newPassword = bcrypt.hashSync(password, saltRounds);
      const result = await User.updateOne(
        { _id: userId },
        { $set: { passwordHash: newPassword, password } }
      );

      // user.setpasswordHash(password);
      // user.password = password;
      // const result = user.save();
      if (result) {
        return res.status(200).send({ message: 'Lấy lại mật khẩu thành công' });
      } else {
        return res.status(400).send({ message: 'Lấy lại mật khẩu thất bại' });
      }
    } else {
      return res.status(400).send({ message: 'Tài khoản không tồn tại' });
    }
  } catch {
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

/**
 * body: {password, oldPassword}
 */
exports.changePassword = async (req, res) => {
  const { password, oldPassword, email } = req.body;
  const { user } = req;
  try {
    console.log('user: ', user);
    if (user) {
      // check old password
      if (user.validatePassword(oldPassword)) {
        const newPassword = bcrypt.hashSync(password, saltRounds);
        await User.updateOne(
          { _id: user._id },
          { $set: { passwordHash: newPassword, password } }
        );
        return res.status(200).send({ message: 'Đổi mật khẩu thành công.' });
      } else {
        return res.status(400).send({ message: 'Mật khẩu cũ không đúng.' });
      }
    } else {
      return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
    }
  } catch {
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

/**
 * body: {avatar}
 */
exports.updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  const { user } = req;
  try {
    // console.log("user: ", user);
    if (user) {
      const result = await User.updateOne(
        { _id: user._id },
        { $set: { avatar } }
      );
      // console.log("user rs: ", result);
      return res
        .status(200)
        .send({ message: 'Cập nhật ảnh đại diện thành công.' });
    } else {
      return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
    }
  } catch {
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};


const Contract = require ('../models/contract.model')
/**
 * body: {_id} is contract's id
 */
exports.getContract = async (req, res) => {
  const { _id } = req.params;
  try {
    // console.log("user: ", user);
    if (user) {
      const contract = Contract.findOne({_id});
      if (contract){
        return res.status(200).send({ payload: contract });
      } else {
        return res.status(400).send({ message: 'Hợp đồng không tồn tại.' });
      }
    } else {
      return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
    }
  } catch {
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};
