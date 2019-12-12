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

app.listen(parseInt(process.env.PORT) || 4500, () => {
  console.log('Server is listening on port 4500');
});
module.exports = app;
