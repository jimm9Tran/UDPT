const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');
const adminRoutes = require('./routes/admin.route');
const currentUser = require('./middlewares/currentUser');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(currentUser);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
