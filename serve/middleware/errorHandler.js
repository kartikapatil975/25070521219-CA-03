/**
 * Centralized Error Handling Middleware
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `API endpoint '${req.originalUrl}' does not exist on this server.`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('[API Error]', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = errors.join(', ');
  }

  // Handle Mongoose CastError (invalid ObjectId, type conversion)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}': ${err.value}`;
  }

  // Handle duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field '${field}'. Record already exists.`;
  }

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};

