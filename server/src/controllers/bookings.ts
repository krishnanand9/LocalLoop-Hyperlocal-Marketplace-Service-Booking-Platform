import { wrap } from '../utils/async';
import { AppError } from '../utils/errors';
import { Provider } from '../models/Provider';
import { Service } from '../models/Service';
import { Booking } from '../models/Booking';
import { bookingSchema } from '../validators';
import { availableSlots, toHHMM, toMin } from '../services/slots';
import { emitTo, notify } from '../sockets';
const FLOW: Record<string, string[]> = { pending: ['confirmed', 'rejected'], confirmed: ['on_the_way'], on_the_way: ['in_progress'], in_progress: ['completed'] };
export const create = wrap(async (req, res) => {
  const d = bookingSchema.parse(req.body);
  const svc = await Service.findById(d.service); if (!svc || !svc.active) throw new AppError(404, 'Service not found');
  if (!(await availableSlots(String(svc.provider), d.service, d.date)).includes(d.start)) throw new AppError(409, 'That time slot is no longer available');
  const b = await Booking.create({ ...d, customer: (req as any).user.id, provider: svc.provider, end: toHHMM(toMin(d.start) + svc.duration), price: svc.price });
  const p = await Provider.findById(svc.provider);
  if (p) { emitTo(String(p.user), 'booking:new', b); notify(String(p.user), 'New booking request'); }
  res.status(201).json({ ok: true, data: b });
});
export const list = wrap(async (req, res) => {
  const u = (req as any).user; const filter: any = {};
  if (u.role === 'customer') filter.customer = u.id;
  else if (u.role === 'provider') { const p = await Provider.findOne({ user: u.id }); filter.provider = p?._id; }
  res.json({ ok: true, data: await Booking.find(filter).sort('-createdAt').limit(100).populate('service', 'name').populate('provider', 'businessName user').populate('customer', 'name') });
});
async function load(id: string, u: any) {
  const b = await Booking.findById(id).populate('provider', 'user'); if (!b) throw new AppError(404, 'Booking not found');
  const isCustomer = String(b.customer) === u.id, isProvider = String((b.provider as any).user) === u.id;
  if (!isCustomer && !isProvider && u.role !== 'admin') throw new AppError(404, 'Booking not found');
  return { b, isCustomer, isProvider };
}
export const getOne = wrap(async (req, res) => res.json({ ok: true, data: (await load(req.params.id, (req as any).user)).b }));
async function transition(id: string, u: any, to: string, byCustomer: boolean) {
  const { b, isCustomer, isProvider } = await load(id, u);
  if (byCustomer ? !isCustomer : !isProvider) throw new AppError(403, 'Not allowed');
  const allowed = byCustomer ? ['pending', 'confirmed'] : null;
  if (byCustomer ? !allowed!.includes(b.status) : !FLOW[b.status]?.includes(to)) throw new AppError(400, `Cannot change from ${b.status} to ${to}`);
  b.status = to as any; await b.save();
  const other = byCustomer ? String((b.provider as any).user) : String(b.customer);
  emitTo(other, 'booking:status', { id: b._id, status: to }); emitTo(u.id, 'booking:status', { id: b._id, status: to });
  notify(other, `Booking ${to.replace(/_/g, ' ')}`);
  return b;
}
export const setStatus = wrap(async (req, res) => res.json({ ok: true, data: await transition(req.params.id, (req as any).user, String(req.body.status), false) }));
export const cancel = wrap(async (req, res) => res.json({ ok: true, data: await transition(req.params.id, (req as any).user, 'cancelled', true) }));
