import { Schema, model } from 'mongoose';
const s = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  suspended: { type: Boolean, default: false },
}, { timestamps: true });
export const User = model('User', s);
