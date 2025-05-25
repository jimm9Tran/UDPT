const errorHandler = (err, req, res, next) => {
  console.error('[❌ Error]', err);
  res.status(err.statusCode || 500).json({
    msg: err.message || 'Something went wrong',
  });
};

module.exports = errorHandler;
