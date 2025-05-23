// src/middleware/requireAuth.ts
import { error } from "console";
import { Request, Response, NextFunction } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    // currentUser da gan truoc do (vd tu JWT)
    return res.status(401).send({ error: [{ message: 'Not authorized' }] });
  }
}