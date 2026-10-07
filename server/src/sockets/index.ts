import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Message, convKey } from '../models/Message';
import { Notification } from '../models/Notification';
let io: Server; const online = new Set<string>();
export const initSockets = (http: HttpServer) => {
  io = new Server(http, { cors: { origin: env.clientUrl } });
  io.use((s, next) => { try { s.data.user = jwt.verify(String(s.handshake.auth.token), env.jwtSecret); next(); } catch { next(new Error('unauthorized')); } });
  io.on('connection', socket => {
    const uid = socket.data.user.id as string; socket.join(`user:${uid}`); online.add(uid); io.emit('presence', { userId: uid, online: true });
    socket.emit('presence:list', [...online]);
    socket.on('chat:send', async ({ to, text }) => {
      if (typeof text !== 'string' || !text.trim() || !to) return;
      const m = await Message.create({ conversation: convKey(uid, to), from: uid, to, text: text.trim() });
      io.to(`user:${to}`).to(`user:${uid}`).emit('chat:message', m);
      notify(to, 'New message');
    });
    socket.on('chat:typing', ({ to }) => io.to(`user:${to}`).emit('chat:typing', { from: uid }));
    socket.on('chat:read', async ({ from }) => { await Message.updateMany({ from, to: uid, read: false }, { read: true }); io.to(`user:${from}`).emit('chat:read', { by: uid }); });
    socket.on('location:update', ({ to, lat, lng }) => io.to(`user:${to}`).emit('location:update', { from: uid, lat, lng }));
    socket.on('disconnect', () => { online.delete(uid); io.emit('presence', { userId: uid, online: false }); });
  });
};
export const emitTo = (userId: string, event: string, data: unknown) => io?.to(`user:${userId}`).emit(event, data);
export async function notify(userId: string, text: string) { const n = await Notification.create({ user: userId, text }); emitTo(userId, 'notification', n); }
