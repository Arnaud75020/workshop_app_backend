require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT;
const connection = require('./config.js');
const morgan = require('morgan');

const cookieParser = require('cookie-parser');

const notificationRouter = require('./routes/notifications.route');
const userRouter = require('./routes/users.route');
const workshopRouter = require('./routes/workshop.route');
const authRouter = require('./routes/auth.route');

app.use(cookieParser());
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/notifications', notificationRouter);
app.use('/users', userRouter);
app.use('/workshops', workshopRouter);
app.use('/auth', authRouter);

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('You are connected to the database successfully');
  }
});

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`The app is running at ${port}`);
  }
});
