import { z } from 'zod';
export const registerSchema = z.object({
  name: z.string().min(2), email: z.string().email(),
  password: z.string().min(8).regex(/[A-Za-z]/).regex(/\d/, 'Password needs a number'),
  role: z.enum(['customer', 'provider']),
  business: z.object({ businessName: z.string().min(2), category: z.string().min(2), address: z.string().optional(), lng: z.number(), lat: z.number() }).optional(),
});
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const serviceSchema = z.object({ name: z.string().min(2), description: z.string().optional(), category: z.string().optional(), price: z.number().min(0), duration: z.number().min(15).max(600), active: z.boolean().optional() });
export const bookingSchema = z.object({ service: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), start: z.string().regex(/^\d{2}:\d{2}$/), address: z.string().min(3), notes: z.string().max(500).optional() });
export const reviewSchema = z.object({ booking: z.string(), rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() });
export const availabilitySchema = z.object({ days: z.array(z.number().min(0).max(6)), open: z.string(), close: z.string(), breaks: z.array(z.object({ start: z.string(), end: z.string() })), holidays: z.array(z.string()) });
