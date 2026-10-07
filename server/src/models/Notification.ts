import { Schema, model } from 'mongoose';
export const Notification = model('Notification', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  text: String, read: { type: Boolean, default: false },
}, { timestamps: true }));
