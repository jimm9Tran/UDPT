const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const currentUser = require('../middlewares/currentUser');
const requireAuth = require('../middlewares/requireAuth');
const router = express.Router();

router.get('/current-user', currentUser, requireAuth, async (req, res) => {
  res.json({ id: req.currentUser.id, email: req.currentUser.email });
});

router.post('/register', register);
router.post('/login', login);

module.exports = router;
