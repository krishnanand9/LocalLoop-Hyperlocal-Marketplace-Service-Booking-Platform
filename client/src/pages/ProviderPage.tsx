import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { providerApi, bookingApi } from '../api/endpoints';
import { errMsg } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/Toast';
import { ErrorBox, Skeleton, Stars, Empty } from '../components/ui';
export default function ProviderPage() {
  const { id = '' } = useParams(); const { user } = useAuth(); const nav = useNavigate(); const toast = useToast();
  const { data, isLoading, error } = useQuery({ queryKey: ['provider', id], queryFn: () => providerApi.get(id) });
  const [svc, setSvc] = useState(''); const [date, setDate] = useState(''); const [slot, setSlot] = useState(''); const [address, setAddress] = useState(''); const [notes, setNotes] = useState('');
  const slots = useQuery({ queryKey: ['slots', id, svc, date], enabled: !!svc && !!date, queryFn: () => providerApi.slots(id, svc, date) });
  const book = useMutation({ mutationFn: () => bookingApi.create({ service: svc, date, start: slot, address, notes: notes || undefined }), onSuccess: () => { toast('Booking requested'); nav('/bookings'); }, onError: e => { toast(errMsg(e)); slots.refetch(); } });
  if (isLoading) return <main className="mx-auto max-w-3xl p-4"><Skeleton /></main>;
  if (error || !data) return <main className="p-4"><ErrorBox msg={errMsg(error)} /></main>;
  const { provider: p, services } = data;
  return <main className="mx-auto max-w-3xl space-y-4 p-4"><h1 className="text-3xl font-extrabold">{p.businessName} {p.verified && <span className="text-base text-loop-600">✓ Verified Provider</span>}</h1>
    <p><Stars v={p.rating} /> {p.reviewCount} reviews · {p.category} · {p.address}</p>{p.description && <p>{p.description}</p>}
    <a className="underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${p.location.coordinates[1]},${p.location.coordinates[0]}`}>Get directions</a>
    <h2 className="text-xl font-bold">Book a service</h2>{services.length === 0 && <Empty title="No services listed yet" />}
    {services.length > 0 && (user?.role === 'customer' ? <form className="card space-y-3" onSubmit={e => { e.preventDefault(); book.mutate(); }}>
      <label className="block">Service<select className="input" required value={svc} onChange={e => { setSvc(e.target.value); setSlot(''); }}><option value="">Choose…</option>{services.map(s => <option key={s._id} value={s._id}>{s.name} — ₹{s.price} · {s.duration} min</option>)}</select></label>
      <label className="block">Date<input type="date" className="input" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={e => { setDate(e.target.value); setSlot(''); }} /></label>
      {slots.isFetching && <Skeleton />}{slots.data?.length === 0 && <p className="text-sm text-slate-500">No free slots on this day.</p>}
      <div className="flex flex-wrap gap-2">{slots.data?.map(s => <button type="button" key={s} aria-pressed={slot === s} onClick={() => setSlot(s)} className={`rounded-xl border px-3 py-1 ${slot === s ? 'bg-loop-600 text-white' : ''}`}>{s}</button>)}</div>
      <label className="block">Your address<input className="input" required minLength={3} value={address} onChange={e => setAddress(e.target.value)} /></label>
      <label className="block">Notes<textarea className="input" maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} /></label>
      <button className="btn" disabled={!slot || book.isPending}>{book.isPending ? 'Booking…' : 'Confirm booking'}</button></form>
      : <p className="card">{user ? 'Only customers can book services.' : 'Sign in as a customer to book.'}</p>)}</main>;
}
