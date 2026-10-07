import mongoose from 'mongoose';
import { wrap } from '../utils/async';
import { AppError } from '../utils/errors';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { Provider } from '../models/Provider';
import { Message, convKey } from '../models/Message';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { reviewSchema } from '../validators';
import { notify } from '../sockets';
export const createReview = wrap(async (req, res) => {
  const d = reviewSchema.parse(req.body); const uid = (req as any).user.id;
  const b = await Booking.findOne({ _id: d.booking, customer: uid }); if (!b) throw new AppError(404, 'Booking not found');
  if (b.status !== 'completed') throw new AppError(400, 'You can review a booking once it is completed');
  const r = await Review.create({ ...d, provider: b.provider, customer: uid });
  const [agg] = await Review.aggregate([{ $match: { provider: b.provider } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  const p = await Provider.findByIdAndUpdate(b.provider, { rating: Math.round(agg.avg * 10) / 10, reviewCount: agg.n });
  if (p) notify(String(p.user), 'You received a new review');
  res.status(201).json({ ok: true, data: r });
});
export const conversations = wrap(async (req, res) => {
  const uid = new mongoose.Types.ObjectId((req as any).user.id);
  const rows = await Message.aggregate([{ $match: { $or: [{ from: uid }, { to: uid }] } }, { $sort: { createdAt: -1 } },
    { $group: { _id: '$conversation', last: { $first: '$$ROOT' }, unread: { $sum: { $cond: [{ $and: [{ $eq: ['$to', uid] }, { $eq: ['$read', false] }] }, 1, 0] } } } }, { $sort: { 'last.createdAt': -1 } }]);
  const out = await Promise.all(rows.map(async r => ({ ...r, other: await User.findById(String(r.last.from) === String(uid) ? r.last.to : r.last.from, 'name') })));
  res.json({ ok: true, data: out });
});
export const messages = wrap(async (req, res) => res.json({ ok: true, data: await Message.find({ conversation: convKey((req as any).user.id, req.params.userId) }).sort('createdAt').limit(200) }));
export const notifications = wrap(async (req, res) => res.json({ ok: true, data: await Notification.find({ user: (req as any).user.id }).sort('-createdAt').limit(30) }));
export const readAll = wrap(async (req, res) => { await Notification.updateMany({ user: (req as any).user.id }, { read: true }); res.json({ ok: true }); });
export const adminStats = wrap(async (_q, res) => {
  const [users, providers, bookings, completed] = await Promise.all([User.countDocuments(), Provider.countDocuments(), Booking.countDocuments(), Booking.countDocuments({ status: 'completed' })]);
  res.json({ ok: true, data: { users, providers, bookings, completed } });
});
export const verifyProvider = wrap(async (req, res) => { const p = await Provider.findByIdAndUpdate(req.params.id, { verified: !!req.body.verified }, { new: true }); if (!p) throw new AppError(404, 'Provider not found'); res.json({ ok: true, data: p }); });
export const suspendUser = wrap(async (req, res) => { const u = await User.findByIdAndUpdate(req.params.id, { suspended: !!req.body.suspended }, { new: true }); if (!u) throw new AppError(404, 'User not found'); res.json({ ok: true }); });
