import { Schema, model } from 'mongoose';
const s = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  description: String,
  category: { type: String, required: true, index: true },
  address: String,
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true } },
  verified: { type: Boolean, default: false },
  online: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  availability: {
    days: { type: [Number], default: [1, 2, 3, 4, 5, 6] },
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
    breaks: { type: [{ start: String, end: String }], default: [] },
    holidays: { type: [String], default: [] },
  },
}, { timestamps: true });
s.index({ location: '2dsphere' });
export const Provider = model('Provider', s);
