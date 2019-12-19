const ObjectId = require('mongodb').ObjectID;
const Notification = require('../models/notification.model');

const DefaultValues = require('../utils/default-values.utils');

exports.getNotificationList = async (req, res) => {
  var userId = req.params.userId || '';
  var pageNumber = req.query.page || DefaultValues.pageNumber;
  var itemPerPage = req.query.limit || DefaultValues.itemPerPage;

  try {
    const result = await Notification.find({
      userId: ObjectId(userId),
      isDeleted: false
    }).sort({
      createdAt: -1
    });
    return res.status(200).send({ payload: result });
  } catch (err) {
    console.log('error: ', err.message);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

exports.countNotifications = async (req, res) => {
  var userId = req.params.userId || '';

  try {
    const result = await Notification.countDocuments({
      userId: ObjectId(userId),
      isDeleted: false
    });
    return res.status(200).send({ payload: result });
  } catch (err) {
    console.log('error: ', err.message);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

exports.updateIsReadNotification = async (req, res) => {
  var id = req.params.id;

  try {
    if (id) {
      const result = await Notification.updateOne(
        { _id: ObjectId(id) },
        { $set: { isRead: true } }
      );
      return res
        .status(200)
        .send({ message: 'Cập nhật thông tin thành công.' });
    } else {
      return res.status(400).send({ message: 'Mã thông báo không tồn tại.' });
    }
  } catch (err) {
    console.log('error: ', err.message);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

exports.updateIsDeletedNotification = async (req, res) => {
  var id = req.params.id;

  try {
    if (id) {
      const result = await Notification.updateOne(
        { _id: ObjectId(id) },
        { $set: { isDeleted: true } }
      );
      return res
        .status(200)
        .send({ message: 'Cập nhật thông tin thành công.' });
    } else {
      return res.status(400).send({ message: 'Mã thông báo không tồn tại.' });
    }
  } catch (err) {
    console.log('error: ', err.message);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};
