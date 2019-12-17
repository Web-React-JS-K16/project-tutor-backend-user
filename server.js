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
const socketio = require('socket.io');
const chatUtils = require ('./app/utils/chat.utils');

// var http = require('http');
// var server = http.createServer(app);
// const io = socketio(server);

// var server = app.listen(4500, () => {
//   console.log("Listening ..");
// });

// var server = require('http').Server(app);
var io = require('socket.io').listen(server);
/**
 * Config socket io for chat
 */
io.on('connect', (socket) => {
  console.log('before join')
  socket.on('join', async ({ userId, displayName, room  }, callback) => {
    const { error, user } = await chatUtils.addUserToRoom({ id: socket.id, userId, displayName, room});
    console.log("after addUser: ", user);

    try {
      if (error) return callback(error);
      socket.join(user.room);
      // socket.join("testRoom");
      console.log('after join')
      io.to(user.room).emit('message', { message: "test io"});
      io.to(user.room).emit('message', { message: "Xin chào bạn nhé" });


      console.log("call back: ", callback);
      callback(); 

      // console.log("new room: ", user.room);
      console.log("connect successfully!");
      callback();
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('testListen', (payload, callback) => {
    console.log ("my payload: ", payload)
      io.to("5defc8ea486aa9176437b354").emit('sendToClient', { message: "hihihi" });
    io.to("5defc8ea486aa9176437b354").emit('message', { message: "123456789345678" });
      console.log("call back: ", callback);
      callback(); 
  })
  // socket.on('sendMessage', (message, callback) => {
  //   if (message.type && message.type === 'endGame') {
  //     console.log("on disconnect by message: ", socket.id);
  //     const user = removeUser(socket.id);
  //     if (user) {
  //       io.to(user.room).emit('message', { user: 'Admin', type: "endGame", text: `${user.username} đã rời khỏi phòng chơi.` });
  //     }
  //   }
  //   else { // send message
  //     const user = getUser(socket.id);
  //     // console.log("get user: ", user);
  //     io.to(user.room).emit('message', { user: user.username, text: message, time: Date.now() });
  //     callback();
  //   }
  // });
  socket.on('disconnect', () => {
    console.log("on disconnect: ", socket.id);
    const user = chatUtils.removeUserFromRoom(socket.id);
    if (user) {
      io.to(user.room).emit('message', {text: `${user.displayName} đã offline.` });
    }
  })
});



module.exports = app;
