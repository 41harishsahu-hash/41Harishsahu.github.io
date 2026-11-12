const rateLimit = require('express-rate-limit');

// General API Rate Limiter: 150 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

// Stricter Limiter for Authentication & Password attempts: 20 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. For security, please wait 15 minutes before trying again.',
  },
});

// Dedicated Strict Rate Limiter for Administrator Authentication: 10 attempts per 15 minutes
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many administrator authentication attempts. For security, please wait 15 minutes before trying again.',
  },
});

// Enquiry limiter to prevent spam submissions
const enquiryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have submitted multiple enquiries recently. Please wait a minute before submitting again.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  adminAuthLimiter,
  enquiryLimiter,
};

