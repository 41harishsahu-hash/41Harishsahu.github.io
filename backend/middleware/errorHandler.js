const { ZodError } = require('zod');

// Format Zod errors into clear field-level dictionary
const formatZodErrors = (error) => {
  const formatted = {};
  error.errors.forEach((err) => {
    const field = err.path.join('.') || 'general';
    formatted[field] = err.message;
  });
  return formatted;
};

// Global Centralized Error Handler
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', req.method, req.originalUrl, err.message);

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors: formatZodErrors(err),
    });
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return res.status(409).json({
      success: false,
      message: `An account or record with this ${field} (${value}) already exists.`,
      field,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format provided: ${err.value}`,
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the allowed limit (5MB). Please upload a smaller image.',
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }

  // Default fallback
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  errorHandler,
  formatZodErrors,
};

