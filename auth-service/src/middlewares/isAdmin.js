const User = require('../models/user.model');

const isAdmin = async (req, res, next) => {
  if (!req.currentUser) return res.status(401).json({ msg: 'Not authenticated' });

  try {
    const user = await User.findById(req.currentUser.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access only' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ msg: 'Error verifying admin role' });
  }
};

module.exports = isAdmin;
