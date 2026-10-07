import { createContext, useContext, useState, ReactNode } from 'react';
const T = createContext<(m: string) => void>(() => {});
export const useToast = () => useContext(T);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };
  return <T.Provider value={show}>{children}<div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2">{msg && <div className="rounded-xl bg-slate-900 px-4 py-2 text-white shadow-lg">{msg}</div>}</div></T.Provider>;
}
