const crypto = require('crypto');
const User = require('../models/User');
const { ActivityLog } = require('../models/Content');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require('../validators/schemas');

// Customer Registration
const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Prevent registration using authorized admin email or existing accounts
    const authorizedAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    if (authorizedAdminEmail && validatedData.email === authorizedAdminEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const existingEmail = await User.findOne({ email: validatedData.email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const existingMobile = await User.findOne({ mobile: validatedData.mobile });
    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: 'An account with this mobile number already exists.',
      });
    }

    const user = new User({
      name: validatedData.name,
      email: validatedData.email,
      mobile: validatedData.mobile,
      password: validatedData.password,
      role: 'customer',
      status: 'active',
    });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set HTTP-only refresh cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to History Packers & Movers.',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Customer & General Login
const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email }).select('+password +refreshTokens +role +status');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Keep up to 5 active refresh tokens (token rotation & multi-device limit)
    user.refreshTokens = user.refreshTokens ? user.refreshTokens.slice(-4) : [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin Login (Strict Single Authorized Account check)
const adminLogin = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const inputEmail = validatedData.email.toLowerCase().trim();
    const authorizedAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();

    // Verify server environment configuration
    if (!authorizedAdminEmail || !authorizedAdminEmail.endsWith('@gmail.com')) {
      console.error('[Admin Auth Error] Server ADMIN_EMAIL must be a configured Gmail address.');
      return res.status(500).json({
        success: false,
        message: 'Administrator authentication configuration error. Please contact the system administrator.',
      });
    }

    // Reject all emails other than the single authorized admin Gmail address
    if (inputEmail !== authorizedAdminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    const admin = await User.findOne({ email: authorizedAdminEmail, role: 'admin' }).select('+password +refreshTokens +role +status');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Administrator account is deactivated.',
      });
    }

    const isMatch = await admin.comparePassword(validatedData.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    const { accessToken, refreshToken } = generateTokens(admin);

    admin.refreshTokens = admin.refreshTokens ? admin.refreshTokens.slice(-4) : [];
    admin.refreshTokens.push(refreshToken);
    await admin.save();

    await ActivityLog.create({
      userId: admin._id,
      userName: admin.name,
      action: 'ADMIN_LOGIN',
      targetType: 'Auth',
      details: { ip: req.ip },
    }).catch(() => {});

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Administrator authentication successful.',
      data: {
        user: admin.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Refresh Token Rotation
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided.',
      });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens +role +status');

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Session invalid or account deactivated.',
      });
    }

    if (!user.refreshTokens.includes(token)) {
      // Possible token reuse attack: clear all refresh tokens for security
      user.refreshTokens = [];
      await user.save();
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token. Please sign in again.',
      });
    }

    // Issue new pair (rotation)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token expired or invalid. Please sign in again.',
    });
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await User.updateOne({ refreshTokens: token }, { $pull: { refreshTokens: token } });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// Get Current User Profile
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toJSON(),
    },
  });
};

// Update Profile
const updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const existingMobile = await User.findOne({
      mobile: validatedData.mobile,
      _id: { $ne: req.user._id },
    });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: 'This mobile number is already linked to another account.',
      });
    }

    req.user.name = validatedData.name;
    req.user.mobile = validatedData.mobile;
    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: req.user.toJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Change Password
const changePassword = async (req, res, next) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);

    const user = await User.findById(req.user._id).select('+password +refreshTokens');
    const isMatch = await user.comparePassword(validatedData.currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = validatedData.newPassword;
    user.refreshTokens = []; // Revoke other sessions
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in with your new password on other devices.',
    });
  } catch (err) {
    next(err);
  }
};

// Forgot Password Request (Generates a secure reset token)
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.role === 'admin') {
      // Do not leak whether an email exists or not.
      // Administrator passwords cannot be reset via the public customer forgot-password endpoint.
      return res.json({
        success: true,
        message: 'If an account exists with that email, password reset instructions have been dispatched.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // In dev / production: Log token clearly or dispatch via SMTP if configured
    console.log(`[Password Reset] Generated reset token for ${user.email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If an account exists with that email, password reset instructions have been dispatched.',
      // In development mode, provide token directly to allow seamless testing
      ...(process.env.NODE_ENV !== 'production' && { devResetToken: resetToken }),
    });
  } catch (err) {
    next(err);
  }
};

// Reset Password with Token
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password +refreshTokens +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired. Please request a new one.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You may now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};

