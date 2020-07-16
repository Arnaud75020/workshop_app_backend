require('dotenv').config();

const morgan = require('morgan');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT;

const morgan = require('morgan');

const cors = require('cors');

const cookieParser = require('cookie-parser');

const notificationRouter = require('./routes/notifications.route');
const userRouter = require('./routes/users.route');
const workshopRouter = require('./routes/workshop.route');
const authRouter = require('./routes/auth.route');

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', JSON.stringify(error), error.stack);
  process.exit(1);
});
process.on('uncaughtException', error => {
  console.log('uncaughtException', JSON.stringify(error), error.stack);
  process.exit(1);
});
process.on('beforeExit', () => {
  app.close((err) => {
    if (err) console.error(JSON.stringify(err), err.stack);
  });
});

process.on('SIGINT', function () {
  db.stop(function (err) {
    process.exit(err ? 1 : 0);
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(morgan('dev'));

app.use('/notifications', notificationRouter);
app.use('/users', userRouter);
app.use('/workshops', workshopRouter);
app.use('/auth', authRouter);

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`The app is running at ${port}`);
  }
});
