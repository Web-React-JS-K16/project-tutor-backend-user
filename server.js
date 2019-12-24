const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const dbConfig = require('./config/database.config');
const userRouter = require('./app/routes/user.route');
const tagRouter = require('./app/routes/tag.route');
const teacherRouter = require('./app/routes/teacher.route');
const studentRouter = require('./app/routes/student.route');
const majorRouter = require('./app/routes/major.route');
const locationRouter = require('./app/routes/location.route');
const contractRouter = require('./app/routes/contract.route');
const cityRouter = require('./app/routes/city.route');
const districtRouter = require('./app/routes/district.route');
const chatRouter = require('./app/routes/chat.route');
const notificationRouter = require('./app/routes/notification.route');

const cors = require('cors');
require('./passport');

//create express app
const app = express();
app.use(cors());
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });
app.use(require('body-parser').text());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));

app.use(userRouter);
app.use(tagRouter);
app.use(teacherRouter);
app.use(studentRouter);
app.use(majorRouter);
app.use(locationRouter);
app.use(contractRouter);
app.use(cityRouter);
app.use(districtRouter);
app.use(chatRouter);
app.use(notificationRouter);

//connecting to the database
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch(err => {
    console.log('Cannot connect to the database. Exiting now...', err);
    process.exit();
  });

app.get('/', (req, res) => {
  res.json({ message: 'Simple app' });
});

app.get('/user', userRouter);
app.get('/tag', tagRouter);
app.get('/teacher', teacherRouter);
app.get('/student', studentRouter);
app.get('/major', majorRouter);
app.get('/location', locationRouter);
app.get('/contract', contractRouter);
app.get('/city', cityRouter);
app.get('/district', districtRouter);
app.get('/chat', chatRouter);
app.get('/notification', notificationRouter);

var server = app.listen(parseInt(process.env.PORT) || 4500, () => {
  console.log('Server is listening on port 4500');
});

// chat using soket.io
// const socketio = require('socket.io');
const chatUtils = require('./app/utils/chat.utils');
const constant = require('./config/constant');
var io = require('socket.io').listen(server);
/**
 * Config socket io for chat
 */
io.on('connect', socket => {
  socket.on('join', async ({ userId, typeID }, callback) => {
    chatUtils.addUserToActiveList({ userId, socketId: socket.id });
    socket.join(userId); // to send notification

    // TODO
    const rooms = await chatUtils.getRoomChatForUser(userId, typeID);
    // console.log("get rooms: ", rooms)
    if (rooms) {
      rooms.map(item => {
        const { room, teacher, student } = item;
        socket.join(item.room); // to send message chat
        // to system send notification when roomate is off
        chatUtils.addRoomToActiveArr({
          room,
          members: [student._id.toString(), teacher._id.toString()]
        });
      });
    }
    if (callback) {
      callback({ rooms });
    }
  });

  // user create a new room => join user to new room
  socket.on(constant.SOCKET_ON_OPEN_ROOM, (payload, callback) => {
    console.log('create new room: ', payload);
    const { student, teacher, room } = payload;
    socket.join(room);
    // send request create new room to roomate
    io.to(teacher).emit(constant.SOCKET_EMIT_OPEN_ROOM, { room });
    // *NOTE: members[0]: student, member[1]: teacher
    // chatUtils.createRoom({room, members: [student, teacher]})

    if (callback) {
      callback();
    }
  });

  // user accept new room and request server to join user to that new room
  socket.on(constant.SOCKET_ON_ACCEPT_NEW_ROOM, (payload, callback) => {
    console.log('server accept room: \n', payload);
    const { isAccept, room } = payload;
    socket.join(room);

    if (callback) {
      callback();
    }
  });

  socket.on(constant.SOCKET_ON_RECIEVE_MESSAGE, async (payload, callback) => {
    console.log('my payload: ', payload);
    const { room, from, time, message } = payload;
    // save msg to db
    const { error } = await chatUtils.saveMessage({
      room,
      newMessage: { content: message, from, time }
    });
    if (!error) {
      // send message to all member in room
      io.in(room).emit(constant.SOCKET_EMIT_SEND_MESSAGE, {
        message,
        from,
        room,
        time
      });
    }

    if (callback) {
      callback();
    }
  });

  socket.on('disconnect', () => {
    console.log('on disconnect: ', socket.id);
    const result = chatUtils.removeUser(socket.id);

    if (result) {
      const { roomSendNotification, userId } = result;
      // console.log("room send notifi: ", roomSendNotification)
      if (roomSendNotification.length > 0) {
        roomSendNotification.map(item => {
          // send message: roomate was offline
          //sending to all clients except sender
          console.log('room off: ', item);
          socket.broadcast
            .to(item.room)
            .emit(constant.SOCKET_EMIT_ROOMATE_OFF, {
              room: item.room,
              userLeft: userId
            });
          // io.to(room).emit(constant.SOCKET_EMIT_ROOMATE_OFF, {room});
        });
      }
    }
  });
});

module.exports = app;
