import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { wrap } from '../utils/async';
import { AppError } from '../utils/errors';
import { env } from '../config/env';
import { User } from '../models/User';
import { Provider } from '../models/Provider';
import { registerSchema, loginSchema } from '../validators';
const sign = (u: any) => jwt.sign({ id: String(u._id), role: u.role }, env.jwtSecret, { expiresIn: env.jwtExpires as any });
const pub = (u: any) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
export const register = wrap(async (req, res) => {
  const d = registerSchema.parse(req.body);
  if (d.role === 'provider' && !d.business) throw new AppError(400, 'Business details are required');
  if (await User.findOne({ email: d.email })) throw new AppError(409, 'An account with this email already exists');
  const u = await User.create({ name: d.name, email: d.email, role: d.role, passwordHash: await bcrypt.hash(d.password, 12) });
  if (d.business) { const b = d.business; await Provider.create({ user: u._id, businessName: b.businessName, category: b.category, address: b.address, location: { type: 'Point', coordinates: [b.lng, b.lat] } }); }
  res.status(201).json({ ok: true, token: sign(u), user: pub(u) });
});
export const login = wrap(async (req, res) => {
  const d = loginSchema.parse(req.body);
  const u = await User.findOne({ email: d.email }).select('+passwordHash');
  if (!u || !(await bcrypt.compare(d.password, u.passwordHash))) throw new AppError(401, 'Email or password is incorrect');
  if (u.suspended) throw new AppError(403, 'This account is suspended');
  res.json({ ok: true, token: sign(u), user: pub(u) });
});
export const me = wrap(async (req, res) => {
  const u = await User.findById((req as any).user.id); if (!u || u.suspended) throw new AppError(401, 'Please sign in');
  res.json({ ok: true, user: pub(u) });
});
