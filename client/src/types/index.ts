export type Role = 'customer' | 'provider' | 'admin';
export interface User { id: string; name: string; email: string; role: Role }
export interface Provider { _id: string; businessName: string; category: string; address?: string; description?: string; verified: boolean; rating: number; reviewCount: number; distance?: number; location: { coordinates: [number, number] } }
export interface Service { _id: string; name: string; price: number; duration: number; description?: string }
export interface Booking { _id: string; date: string; start: string; end: string; status: string; address: string; price: number; service?: { name: string }; provider?: { businessName: string; user: string }; customer?: { name: string } }
