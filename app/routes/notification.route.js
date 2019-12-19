const express = require('express');
const app = express();
const notificationController = require('../controllers/notification.controller');

app.get('/notification/:userId', notificationController.getNotificationList);
app.get(
  '/notification/quantity/:userId',
  notificationController.countNotifications
);
app.get(
  '/notification/update-is-read/:id',
  notificationController.updateIsReadNotification
);
app.get(
  '/notification/update-is-deleted/:id',
  notificationController.updateIsDeletedNotification
);

module.exports = app;
