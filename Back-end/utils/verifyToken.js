require('dotenv').config();

const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  console.log('TOKEN', token);
  try {
    if (!token) {
      return res.status(401).json('You need to Login');
    }
    const decrypt = await jwt.verify(token, process.env.JWT_SECRET);
    const { password, ...user } = decrypt.user;
    console.log('DECRYPT', user);
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};

module.exports = verifyToken;
