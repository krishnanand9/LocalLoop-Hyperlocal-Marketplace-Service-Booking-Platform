import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
export const notFound = (_q: Request, _s: Response, n: NextFunction) => n(new AppError(404, 'Not found'));
export const errorHandler = (e: any, _q: Request, res: Response, _n: NextFunction) => {
  if (e instanceof ZodError) return res.status(400).json({ ok: false, message: 'Invalid input', errors: e.flatten().fieldErrors });
  if (e instanceof AppError) return res.status(e.status).json({ ok: false, message: e.message });
  if (e?.code === 11000) return res.status(409).json({ ok: false, message: 'That already exists or the slot is taken' });
  console.error(e);
  res.status(500).json({ ok: false, message: 'Something went wrong' });
};
