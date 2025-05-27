import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@jimm9tran/common';

import { User } from '../models/user';
import type { UserAttrs } from '../types/user';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
    body('name').not().isEmpty().withMessage('Name is required'),
    body('gender').not().isEmpty().withMessage('Gender is required'),
    body('age').isInt({ gt: 0 }).withMessage('Age must be a positive integer')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const {
        email,
        password,
        isAdmin = false,
        name,
        gender,
        age,
        bio,
        shippingAddress
      }: UserAttrs = req.body;
      let { image }: Partial<UserAttrs> = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new BadRequestError('Email already in use');
      }

      // Use a default placeholder image if none provided
      if (!image) {
        image = 'https://via.placeholder.com/150';
      }

      // Build and save user record
      const user = User.build({ email, password, isAdmin, name, image, gender, age, bio, shippingAddress });
      await user.save();

      // Ensure JWT_KEY is set
      if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
      }

      // Sign JWT (only minimal data)
      const userJwt = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_KEY
      );

      // Attach JWT to session cookie
      req.session = { jwt: userJwt };

      // Respond with created user (excluding sensitive password)
      return res.status(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        age: user.age,
        bio: user.bio,
        shippingAddress: user.shippingAddress,
        image: user.image
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      const status = err.statusCode || 400;
      const message = err.message || 'Something went wrong';
      return res.status(status).send({ errors: [{ message }] });
    }
  }
);

export { router as signupRouter };