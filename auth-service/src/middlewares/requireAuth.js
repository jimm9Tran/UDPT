const requireAuth = (req, res, next) => {
  if (!req.currentUser) {
    return res.status(401).json({ msg: 'Not authenticated' });
  }
  next();
};

module.exports = requireAuth;
