// src/middleware/enhanced-current-user.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { currentUser } from '@jimm9tran/common';

export const enhancedCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // First, check if there's a Bearer token in the Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify the JWT token and manually set session
      const payload = jwt.verify(token, process.env.JWT_KEY!) as any;
      
      // Set the JWT in session so currentUser middleware can pick it up
      req.session = { jwt: token };
    } catch (err) {
      console.error('JWT verification failed:', err);
    }
  }
  
  // Now call the original currentUser middleware
  currentUser(req, res, next);
};
