import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export const Empty = ({ title, hint }: { title: string; hint?: string }) => <div className="card text-center"><p className="font-semibold">{title}</p>{hint && <p className="text-sm text-slate-500">{hint}</p>}</div>;
export const ErrorBox = ({ msg }: { msg: string }) => <div role="alert" className="card border-red-300 text-red-700">{msg}</div>;
export const Skeleton = () => <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />;
export const Stars = ({ v }: { v: number }) => <span aria-label={`${v} out of 5`}>{'★'.repeat(Math.round(v))}{'☆'.repeat(5 - Math.round(v))}</span>;
export function NavBar() {
  const { user, signOut } = useAuth(); const nav = useNavigate();
  return <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"><nav className="mx-auto flex max-w-5xl items-center gap-4 p-3">
    <Link to="/" className="text-xl font-extrabold text-loop-600">LocalLoop</Link><Link to="/discover">Discover</Link>
    {user && <Link to="/bookings">{user.role === 'provider' ? 'Requests' : 'My bookings'}</Link>}{user?.role === 'provider' && <Link to="/services">My services</Link>}
    <span className="flex-1" /><button aria-label="Toggle dark mode" onClick={() => document.documentElement.classList.toggle('dark')}>◐</button>
    {user ? <button className="btn" onClick={() => { signOut(); nav('/'); }}>Sign out</button> : <Link className="btn" to="/login">Sign in</Link>}</nav></header>;
}
