import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return next();
  }

  const token = req.headers.authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload;
  } catch (err) {
    req.currentUser = undefined;
  }

  next();
};
