// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { connect } = require('../db');

module.exports = async function auth(req, res, next) {
  try {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const db = await connect();
    const user = await db.collection('users').findOne({ _id: new require('mongodb').ObjectId(payload.id) });
    if (!user) return res.status(401).json({ message: 'Invalid token user' });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
