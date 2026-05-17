const authService = require('../services/authService');

async function signup(req, res) {
  const { email, password, role } = req.body;
  try {
    const user = await authService.signup({ email, password, role });
    const access = authService.generateAccessToken(user);
    const refresh = authService.generateRefreshToken(user);
    res.cookie('refreshToken', refresh, { httpOnly: true, sameSite: 'strict', path: '/api/auth/refresh' });
    res.json({ accessToken: access, refreshToken: refresh });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Server error' });
  }
}

async function signin(req, res) {
  const { email, password } = req.body;
  try {
    const user = await authService.verifyCredentials(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const access = authService.generateAccessToken(user);
    const refresh = authService.generateRefreshToken(user);
    res.cookie('refreshToken', refresh, { httpOnly: true, sameSite: 'strict', path: '/api/auth/refresh' });
    res.json({ accessToken: access, refreshToken: refresh });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

function refresh(req, res) {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token provided' });
  try {
    const user = authService.verifyRefreshToken(token);
    const newAccess = authService.generateAccessToken(user);
    res.json({ accessToken: newAccess });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}

function logout(req, res) {
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ message: 'Logged out' });
}

module.exports = {
  signup,
  signin,
  refresh,
  logout,
};
