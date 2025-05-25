const jwt = require('jsonwebtoken');

const currentUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.currentUser = payload;
  } catch (err) {
    // ignore token error
  }

  next();
};

module.exports = currentUser;
