import { Provider } from '../models/Provider';
import { Service } from '../models/Service';
import { Booking, ACTIVE } from '../models/Booking';
import { AppError } from '../utils/errors';
export const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export async function availableSlots(providerId: string, serviceId: string, date: string) {
  const p = await Provider.findById(providerId); const svc = await Service.findById(serviceId);
  if (!p || !svc || String(svc.provider) !== providerId) throw new AppError(404, 'Service not found');
  const a = p.availability!; const d = new Date(date + 'T00:00:00');
  if (isNaN(d.getTime()) || !a.days.includes(d.getDay()) || a.holidays.includes(date)) return [];
  const booked = await Booking.find({ provider: providerId, date, status: { $in: ACTIVE } });
  const busy = [...booked.map(b => [toMin(b.start), toMin(b.end)]), ...a.breaks.map(b => [toMin(b.start!), toMin(b.end!)])];
  const out: string[] = []; const now = new Date();
  for (let s = toMin(a.open!); s + svc.duration <= toMin(a.close!); s += svc.duration) {
    if (busy.some(([bs, be]) => s < be && s + svc.duration > bs)) continue;
    if (date === now.toISOString().slice(0, 10) && s <= now.getHours() * 60 + now.getMinutes()) continue;
    out.push(toHHMM(s));
  }
  return out;
}
