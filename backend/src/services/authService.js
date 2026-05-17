const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

async function signup({ email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already in use');
  }
  const user = new User({ email, password, role });
  await user.save();
  return user;
}

async function verifyCredentials(email, password) {
  const user = await User.findOne({ email });
  if (!user) return null;
  const match = await user.comparePassword(password);
  if (!match) return null;
  return user;
}

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return { id: payload.id };
}

module.exports = {
  signup,
  verifyCredentials,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
