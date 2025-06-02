import express, { type Request, type Response } from 'express';
import { requireAuth } from '@jimm9tran/common';

const router = express.Router();

router.post(
  '/api/orders',
  async (req: Request, res: Response) => {
    console.log('🔍 SIMPLE Order creation request received - NO AUTH');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 Current user:', req.currentUser);
    
    res.status(200).json({
      message: 'Simple order route works WITHOUT AUTH!',
      received: req.body,
      user: req.currentUser
    });
  }
);

export { router as createOrderRouter };
