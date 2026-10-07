import { Schema, model } from 'mongoose';
export const ACTIVE = ['pending', 'confirmed', 'on_the_way', 'in_progress'];
const s = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  address: { type: String, required: true },
  notes: String,
  price: Number,
  status: { type: String, enum: [...ACTIVE, 'completed', 'cancelled', 'rejected'], default: 'pending', index: true },
}, { timestamps: true });
s.index({ provider: 1, date: 1, start: 1 }, { unique: true, partialFilterExpression: { status: { $in: ACTIVE } } });
export const Booking = model('Booking', s);
