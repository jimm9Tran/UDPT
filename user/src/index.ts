import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

app.post('/auth/register', (req, res) => {
  res.status(201).json({ msg: 'Đăng ký thành công!', body: req.body });
});

const start = async (): Promise<void> => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`✅ App started on PORT: ${PORT}`);
  });
};

start();
