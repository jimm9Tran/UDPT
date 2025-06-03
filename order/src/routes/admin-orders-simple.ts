import express from 'express';
import { Request, Response } from 'express';
import { requireAuth, adminUser } from '@jimm9tran/common';

const router = express.Router();

// Simple admin test route
router.get(
  '/api/orders/admin',
  requireAuth,
  adminUser,
  async (req: Request, res: Response) => {
    console.log('🔍 Simple Admin API reached');
    console.log('   Headers:', req.headers.authorization ? 'Bearer token present' : 'No Bearer token');
    console.log('   Current User:', req.currentUser ? 
      `${req.currentUser.email} (isAdmin: ${req.currentUser.isAdmin})` : 'Not set');
    
    res.send({
      message: 'Admin API working',
      user: req.currentUser,
      orders: []
    });
  }
);

export { router as adminOrderRouter };
