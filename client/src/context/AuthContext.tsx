import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { authApi } from '../api/endpoints';
import type { User } from '../types';
interface Ctx { user: User | null; loading: boolean; socket: Socket | null; signIn: (token: string, u: User) => void; signOut: () => void }
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(!!localStorage.getItem('ll_token')); const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => { if (localStorage.getItem('ll_token')) authApi.me().then(setUser).catch(() => localStorage.removeItem('ll_token')).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!user) return; const s = io(import.meta.env.VITE_SOCKET_URL, { auth: { token: localStorage.getItem('ll_token') } }); setSocket(s); return () => { s.disconnect(); setSocket(null); }; }, [user]);
  const signIn = (t: string, u: User) => { localStorage.setItem('ll_token', t); setUser(u); };
  const signOut = () => { localStorage.removeItem('ll_token'); setUser(null); };
  return <AuthCtx.Provider value={{ user, loading, socket, signIn, signOut }}>{children}</AuthCtx.Provider>;
}
