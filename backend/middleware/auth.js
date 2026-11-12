const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'history_packers_jwt_access_super_secret_key_2026_xyz';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'history_packers_jwt_refresh_super_secret_key_2026_abc';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

// Protect routes - requires valid authenticated user
const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token provided.',
      });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('+role +status');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or has been removed.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Session expired. Please refresh your token.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};

// Require administrator privileges - strictly checks role and authorized ADMIN_EMAIL
const requireAdmin = (req, res, next) => {
  const authorizedAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Administrator privileges required.',
    });
  }

  // Cross-verify against server's configured single authorized admin email
  if (!authorizedAdminEmail || req.user.email.toLowerCase().trim() !== authorizedAdminEmail) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Unauthorized administrator account.',
    });
  }

  next();
};

// Optional authentication: sets req.user if token provided, else guest
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
  } catch (err) {
    // Continue anonymously
  }
  next();
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  requireAuth,
  requireAdmin,
  optionalAuth,
};

