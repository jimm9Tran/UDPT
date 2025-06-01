import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@jimm9tran/common';

import { User } from '../models/user';
import type { UserAttrs } from '../types/user';

const router = express.Router();

// Route để tạo admin đầu tiên (chỉ dùng khi chưa có admin nào)
router.post(
  '/api/users/create-first-admin',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Mật khẩu phải từ 4 đến 20 ký tự'),
    body('name').not().isEmpty().withMessage('Tên không được để trống'),
    body('secretKey').equals('FIRST_ADMIN_SECRET_2025').withMessage('Secret key không đúng'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      // Kiểm tra xem đã có admin nào chưa
      const existingAdmin = await User.findOne({ isAdmin: true });
      if (existingAdmin) {
        throw new BadRequestError('Admin đã tồn tại trong hệ thống');
      }

      const {
        email,
        password,
        name,
      } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new BadRequestError('Email này đã được sử dụng');
      }

      // Create first admin user
      const adminUser = User.build({
        email,
        password,
        isAdmin: true,
        name,
        gender: 'other',
        age: 30,
        image: 'https://via.placeholder.com/150',
        bio: 'System Administrator',
        shippingAddress: {
          address: 'Admin Address',
          city: 'Admin City',
          postalCode: '00000',
          country: 'Vietnam'
        }
      });

      await adminUser.save();

      // Generate JWT
      const userJwt = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          isAdmin: adminUser.isAdmin
        },
        process.env.JWT_KEY!
      );

      // Store it on session object
      req.session = {
        jwt: userJwt
      };

      res.status(201).send({
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin,
        message: 'Admin đầu tiên đã được tạo thành công'
      });
    } catch (error) {
      console.error('Error creating first admin:', error);
      throw error;
    }
  }
);

export { router as createAdminRouter };
