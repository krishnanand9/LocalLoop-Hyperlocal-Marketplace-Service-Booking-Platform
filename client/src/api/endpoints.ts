import { apiClient as c } from './apiClient';
import type { Booking, Provider, Service } from '../types';
export const authApi = { register: (d: unknown) => c.post('/auth/register', d).then(r => r.data), login: (d: unknown) => c.post('/auth/login', d).then(r => r.data), me: () => c.get('/auth/me').then(r => r.data.user) };
export const providerApi = {
  nearby: (p: Record<string, unknown>) => c.get<{ data: Provider[] }>('/providers/nearby', { params: p }).then(r => r.data.data),
  get: (id: string) => c.get<{ data: { provider: Provider; services: Service[] } }>(`/providers/${id}`).then(r => r.data.data),
  slots: (id: string, service: string, date: string) => c.get<{ data: string[] }>(`/providers/${id}/slots`, { params: { service, date } }).then(r => r.data.data),
};
export const serviceApi = { mine: () => c.get<{ data: Service[] }>('/services').then(r => r.data.data), create: (d: unknown) => c.post('/services', d), remove: (id: string) => c.delete(`/services/${id}`) };
export const bookingApi = { create: (d: unknown) => c.post('/bookings', d).then(r => r.data.data), list: () => c.get<{ data: Booking[] }>('/bookings').then(r => r.data.data), setStatus: (id: string, status: string) => c.patch(`/bookings/${id}/status`, { status }), cancel: (id: string) => c.post(`/bookings/${id}/cancel`) };
export const reviewApi = { create: (d: unknown) => c.post('/reviews', d) };
