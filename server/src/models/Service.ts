import { Schema, model } from 'mongoose';
const s = new Schema({
  provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  category: String,
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 15 },
  active: { type: Boolean, default: true },
}, { timestamps: true });
s.index({ name: 'text', description: 'text' });
export const Service = model('Service', s);
