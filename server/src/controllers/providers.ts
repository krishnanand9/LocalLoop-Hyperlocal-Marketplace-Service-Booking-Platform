import { wrap } from '../utils/async';
import { AppError } from '../utils/errors';
import { Provider } from '../models/Provider';
import { Service } from '../models/Service';
import { Review } from '../models/Review';
import { availableSlots } from '../services/slots';
import { availabilitySchema } from '../validators';
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const nearby = wrap(async (req, res) => {
  const { lat, lng, radius = '10', category, q, minRating, verified, sort = 'distance' } = req.query as Record<string, string>;
  const la = Number(lat), lo = Number(lng);
  if (!isFinite(la) || !isFinite(lo)) throw new AppError(400, 'lat and lng are required');
  const match: any = { online: true };
  if (category) match.category = new RegExp(`^${esc(category)}$`, 'i');
  if (minRating) match.rating = { $gte: Number(minRating) };
  if (verified === 'true') match.verified = true;
  if (q) { const ids = await Service.find({ $text: { $search: q }, active: true }).distinct('provider'); match.$or = [{ _id: { $in: ids } }, { businessName: new RegExp(esc(q), 'i') }, { category: new RegExp(esc(q), 'i') }]; }
  const rows = await Provider.aggregate([
    { $geoNear: { near: { type: 'Point', coordinates: [lo, la] }, distanceField: 'distance', maxDistance: Number(radius) * 1000, spherical: true, query: match } },
    { $sort: sort === 'rating' ? { rating: -1, distance: 1 } : { distance: 1 } }, { $limit: 50 },
  ]);
  res.json({ ok: true, data: rows });
});
export const getOne = wrap(async (req, res) => {
  const p = await Provider.findById(req.params.id); if (!p) throw new AppError(404, 'Provider not found');
  res.json({ ok: true, data: { provider: p, services: await Service.find({ provider: p._id, active: true }) } });
});
export const slots = wrap(async (req, res) => { const { service, date } = req.query as Record<string, string>; res.json({ ok: true, data: await availableSlots(req.params.id, service, date) }); });
export const reviews = wrap(async (req, res) => res.json({ ok: true, data: await Review.find({ provider: req.params.id }).sort('-createdAt').limit(50).populate('customer', 'name') }));
export const updateMine = wrap(async (req, res) => {
  const p = await Provider.findOne({ user: (req as any).user.id }); if (!p) throw new AppError(404, 'No business profile');
  if (req.body.availability) p.availability = availabilitySchema.parse(req.body.availability) as any;
  if (typeof req.body.online === 'boolean') p.online = req.body.online;
  if (typeof req.body.description === 'string') p.description = req.body.description;
  await p.save(); res.json({ ok: true, data: p });
});
export const mine = wrap(async (req, res) => { const p = await Provider.findOne({ user: (req as any).user.id }); if (!p) throw new AppError(404, 'No business profile'); res.json({ ok: true, data: p }); });
