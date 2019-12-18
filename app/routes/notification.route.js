const express = require('express');
const app = express();
const notificationController = require('../controllers/notification.controller');

app.get('/notification/:userId', notificationController.getNotificationList);
app.get(
  '/notification/quantity/:userId',
  notificationController.countNotifications
);

module.exports = app;
