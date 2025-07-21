// server/middlewares/errorMiddleware.js
export const errorHandler = (err, req, res, next) => {
  if (!err) {
    console.error('Error handler received undefined error');
    return res.status(500).json({
      message: 'Unknown server error',
      stack: process.env.NODE_ENV === 'production' ? null : 'No error object provided'
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Server Error';
  console.error('Error:', err);
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};