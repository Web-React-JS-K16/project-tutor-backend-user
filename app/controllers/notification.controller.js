const ObjectId = require('mongodb').ObjectID;
const Notification = require('../models/notification.model');

const DefaultValues = require('../utils/default-values.utils');

exports.getNotificationList = async (req, res) => {
  var userId = req.params.userId || '';
  var pageNumber = req.query.page || DefaultValues.pageNumber;
  var itemPerPage = req.query.limit || DefaultValues.itemPerPage;

  try {
    const result = await Notification.find({ userId: ObjectId(userId) });
    return res.status(200).send({ payload: result });
  } catch {
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

exports.countNotifications = async (req, res) => {
  var userId = req.params.userId || '';

  try {
    const result = await Notification.countDocuments({
      userId: ObjectId(userId)
    });
    return res.status(200).send({ payload: result });
  } catch {
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};
