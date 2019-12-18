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

const cors = require('cors');
require('./passport');

//create express app
const app = express();
app.use(cors());
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });

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

var server = app.listen(parseInt(process.env.PORT) || 4500, () => {
  console.log('Server is listening on port 4500');
});


// chat using soket.io
// const socketio = require('socket.io');
const chatUtils = require ('./app/utils/chat.utils');
const constant = require ('./config/constant');
var io = require('socket.io').listen(server);
/**
 * Config socket io for chat
 */
io.on('connect', (socket) => {
  socket.on('join', ({ userId }, callback) => {
    chatUtils.addUserToActiveList({userId, socketId: socket.id});
    socket.join(userId); // to send notification

    const rooms = chatUtils.getRoomChatForUser(userId);
    console.log("get rooms: ", rooms)
    if (rooms) {
      rooms.map(item =>{
        socket.join(item.room); // to send message chat
      })
    }
    if (callback) {
      callback({rooms});
    }
  });

  // user create a new room
  socket.on(constant.SOCKET_ON_CREATE_ROOM, (payload, callback) => {
    console.log ("create new room: ", payload)
    const {from, to, room} = payload;
    socket.join(room);
    // send request create new room to roomate
    io.to(to).emit(constant.SOCKET_EMIT_CREATE_ROOM, {room, idRoomate: from});
    chatUtils.createRoom({room, members: [from, to]})
    if (callback) {
      callback(); 
    }
  })

  // user accept new room and request server to join user to that new room
  socket.on(constant.SOCKET_ON_ACCEPT_NEW_ROOM, (payload, callback) => {
    console.log("server accept room: \n", payload)
    const {isAccept, room } = payload;
    socket.join(room);
    
    if (callback) {
      callback();
    }
  })


  socket.on(constant.SOCKET_ON_RECIEVE_MESSAGE, (payload, callback) => {
    console.log("my payload: ", payload)
    const {room, from, to, time, message} = payload;
    // send message to all member in room
    io.in(room).emit(constant.SOCKET_EMIT_SEND_MESSAGE, {
      message: message,
      from,
      room,
      time
    });
    if (callback){
      callback();
    }
  })

  socket.on('disconnect', () => {
    console.log("on disconnect: ", socket.id);
    const roomSendNotification = chatUtils.removeUser(socket.id);
    if (roomSendNotification.length > 0) {
      roomSendNotification.map(room => {
        // send message: roomate was offline
        io.to(room).emit(constant.SOCKET_EMIT_ROOMATE_OFF, {room});
      })
    }
  })
});



module.exports = app;
