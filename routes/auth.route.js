require('dotenv');
const express = require('express');
const router = express.Router();
const connection = require('../config');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const sendNodemailer = require('./../regEmail.js');

const verifyToken = require('../utils/verifyToken');

// LOCAL STATEGY AUTHENTICATION

passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    (email, password, callback) => {
      connection.query(
        `SELECT u.*, r.role FROM user u JOIN role r ON u.role_id=r.id WHERE email = ?`,
        email,
        (err, foundUser) => {
          if (err) return callback(err);
          if (!foundUser || !foundUser.length)
            return callback(null, false, { message: 'Incorrect email.' });
          if (!bcrypt.compareSync(password, foundUser[0].password))
            return callback(null, false, { message: 'Incorrect password.' });
          return callback(null, foundUser[0]);
        }
      );
    }
  )
);

// SIGN UP ROUTE http://localhost:5000/auth/signup

router.post('/signup', (req, res) => {
  const password = req.body.password;
  bcrypt.hash(password, 10, (err, hash) => {
    const {
      company,
      country,
      email,
      firstname,
      lastname,
      role_id,
      max_workshops,
      registration_date,
    } = req.body;
    const formData = [
      firstname,
      lastname,
      company,
      country,
      email,
      hash,
      role_id,
      max_workshops,
      registration_date,
    ];

    connection.query(
      'INSERT INTO user (firstname, lastname, company, country, email, password, role_id, max_workshops, registration_date) VALUES (?,?,?,?,?,?,?,?,?)',
      formData,
      (err, results) => {
        if (err) {
          res.status(500).json({ flash: 'ERROR ERROR', err: err });
        } else {
          res.status(200).json({ flash: 'User has been registered' });
          sendNodemailer();
        }
      }
    );
  });
});

// LOGIN ROUTE http://localhost:5000/auth/login

router.post('/login', function (req, res) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(400).json({ message: info.message });
    const token = jwt.sign({ user }, process.env.JWT_SECRET);
    res.cookie('_p_c', token, {
      expires: new Date(Date.now() + 44600000),
      // secure: true,
      httpOnly: true,
      sameSite: 'strict',
    });
    console.log('TOKEN', token);
    return res.json({ user, token });
  })(req, res);
});

router.post(
  '/logout',
  (req, res, next) => {
    res.clearCookie('_p_c');
    next();
  },
  (req, res) => {
    res.end('finish');
  }
);

// CHANGE PASSWORD ROUTE http://localhost:5000/auth/change-password

router.post('/change-password', function (req, res) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(400).json({ message: info.message });
    return res.json({ message: 'password correct' });
  })(req, res);
});

router.get('/verify-token', verifyToken, (req, res) => {
  console.log('REQ USER', req.user);
  res.status(200).send(req.user);
});

module.exports = router;
