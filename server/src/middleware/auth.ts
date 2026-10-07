import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { Role } from '../types';
export const auth = (req: Request, _res: Response, next: NextFunction) => {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return next(new AppError(401, 'Please sign in'));
  try { (req as any).user = jwt.verify(h.slice(7), env.jwtSecret); next(); }
  catch { next(new AppError(401, 'Session expired, please sign in again')); }
};
export const requireRole = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) =>
  roles.includes((req as any).user?.role) ? next() : next(new AppError(403, 'You do not have access to this'));
