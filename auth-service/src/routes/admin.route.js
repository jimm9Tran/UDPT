const express = require('express');
const currentUser = require('../middlewares/currentUser');
const requireAuth = require('../middlewares/requireAuth');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.get('/dashboard', currentUser, requireAuth, isAdmin, (req, res) => {
  res.json({ msg: `Welcome Admin ${req.currentUser.id}` });
});

module.exports = router;
