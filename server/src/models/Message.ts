import { Schema, model } from 'mongoose';
const s = new Schema({
  conversation: { type: String, required: true, index: true },
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 2000 },
  read: { type: Boolean, default: false },
}, { timestamps: true });
export const Message = model('Message', s);
export const convKey = (a: string, b: string) => [a, b].sort().join(':');
