// server/controllers/authController.js
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { connect } = require('../db');
const { ObjectId } = require('mongodb');

const PESU_AUTH_URL = process.env.PESU_AUTH_URL;

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username/password required' });

    // Call PESUAuth service
    const pesuResp = await axios.post(`${PESU_AUTH_URL}/authenticate`, { username, password, profile: true }, { timeout: 10000 });
    const pesuData = pesuResp.data;

    if (!pesuData.status) return res.status(401).json({ message: pesuData.message || 'Auth failed' });

    const profile = pesuData.profile || {};
    const db = await connect();
    // Upsert user by SRN or PRN
    const filter = {};
    if (profile.srn) filter.srn = profile.srn;
    else if (profile.prn) filter.prn = profile.prn;
    else filter.username = username;

    const update = {
      $set: {
        name: profile.name || username,
        srn: profile.srn || null,
        prn: profile.prn || null,
        program: profile.program || null,
        branch: profile.branch || null,
        lastLogin: new Date()
      }
    };

    const opts = { upsert: true, returnDocument: 'after' };
    const result = await db.collection('users').findOneAndUpdate(filter, update, opts);
    const user = result.value;

    // Create our own JWT referencing our user _id
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Send cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ status: true, user: { id: user._id, name: user.name, srn: user.srn }});
  } catch (err) {
    console.error('Login error', err?.response?.data || err.message);
    res.status(500).json({ message: 'Login failed' });
  }
}

async function logout(req, res) {
  res.clearCookie('token');
  res.json({ status: true });
}

async function me(req, res) {
  try {
    // if auth middleware didn't run, check token quickly
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.json({ user: null });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const db = await connect();
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id) }, { projection: { password: 0 } });
    res.json({ user });
  } catch (err) {
    res.json({ user: null });
  }
}

module.exports = { login, logout, me };
