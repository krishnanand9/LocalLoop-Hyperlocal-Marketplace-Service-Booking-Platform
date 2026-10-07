import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { errMsg } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/Toast';
import { getLocation } from '../utils/geo';
export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { signIn } = useAuth(); const nav = useNavigate(); const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'customer', businessName: '', category: '' }); const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      let r;
      if (mode === 'login') r = await authApi.login({ email: f.email, password: f.password });
      else { const body: any = { name: f.name, email: f.email, password: f.password, role: f.role }; if (f.role === 'provider') { const l = await getLocation(); body.business = { businessName: f.businessName, category: f.category, ...l }; } r = await authApi.register(body); }
      signIn(r.token, r.user); nav(r.user.role === 'provider' ? '/bookings' : '/discover');
    } catch (err) { toast(errMsg(err)); } finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-sm p-6"><h1 className="mb-4 text-2xl font-bold">{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
    <form onSubmit={submit} className="space-y-3">
      {mode === 'register' && <><label className="block">Name<input className="input" required minLength={2} value={f.name} onChange={set('name')} /></label>
        <label className="block">I am a<select className="input" value={f.role} onChange={set('role')}><option value="customer">Customer</option><option value="provider">Local business</option></select></label>
        {f.role === 'provider' && <><label className="block">Business name<input className="input" required value={f.businessName} onChange={set('businessName')} /></label><label className="block">Category<input className="input" required value={f.category} onChange={set('category')} placeholder="Electrician" /></label><p className="text-sm text-slate-500">Your current location is used as your business location.</p></>}</>}
      <label className="block">Email<input className="input" type="email" required value={f.email} onChange={set('email')} /></label>
      <label className="block">Password<input className="input" type="password" required minLength={mode === 'register' ? 8 : 1} value={f.password} onChange={set('password')} /></label>
      <button className="btn w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form>
    <p className="mt-4 text-sm">{mode === 'login' ? <>New here? <Link className="underline" to="/register">Create an account</Link></> : <>Have an account? <Link className="underline" to="/login">Sign in</Link></>}</p></main>;
}
