import { Schema, model } from 'mongoose';
const s = new Schema({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: true });
export const Review = model('Review', s);
