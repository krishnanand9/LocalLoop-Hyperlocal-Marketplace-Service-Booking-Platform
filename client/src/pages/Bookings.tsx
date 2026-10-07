import { useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { bookingApi, reviewApi } from '../api/endpoints';
import { errMsg } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/Toast';
import { Empty, ErrorBox, Skeleton } from '../components/ui';
const NEXT: Record<string, string[]> = { pending: ['confirmed', 'rejected'], confirmed: ['on_the_way'], on_the_way: ['in_progress'], in_progress: ['completed'] };
export default function Bookings() {
  const { user, socket } = useAuth(); const qc = useQueryClient(); const toast = useToast();
  const { data, isLoading, error } = useQuery({ queryKey: ['bookings'], queryFn: bookingApi.list });
  useEffect(() => {
    if (!socket) return; const r = () => qc.invalidateQueries({ queryKey: ['bookings'] }); const n = (x: { text: string }) => toast(x.text);
    socket.on('booking:new', r); socket.on('booking:status', r); socket.on('notification', n);
    return () => { socket.off('booking:new', r); socket.off('booking:status', r); socket.off('notification', n); };
  }, [socket, qc, toast]);
  const act = useMutation({ mutationFn: (a: () => Promise<unknown>) => a(), onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }), onError: e => toast(errMsg(e)) });
  if (isLoading) return <main className="mx-auto max-w-3xl space-y-3 p-4"><Skeleton /><Skeleton /></main>;
  return <main className="mx-auto max-w-3xl space-y-3 p-4"><h1 className="text-2xl font-bold">{user?.role === 'provider' ? 'Booking requests' : 'My bookings'}</h1>
    {error && <ErrorBox msg={errMsg(error)} />}{data?.length === 0 && <Empty title="No bookings yet" />}
    {data?.map(b => <div key={b._id} className="card"><p className="font-bold">{b.service?.name} · ₹{b.price}</p><p className="text-sm">{b.date} {b.start}–{b.end} · {b.address}</p><p className="text-sm text-slate-500">{user?.role === 'provider' ? b.customer?.name : b.provider?.businessName}</p>
      <p className="my-1 inline-block rounded-full bg-loop-50 px-2 text-sm font-semibold text-loop-900">{b.status.replace(/_/g, ' ')}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {user?.role === 'provider' && NEXT[b.status]?.map(s => <button key={s} className="btn" onClick={() => act.mutate(() => bookingApi.setStatus(b._id, s))}>{s.replace(/_/g, ' ')}</button>)}
        {user?.role === 'customer' && ['pending', 'confirmed'].includes(b.status) && <button className="btn" onClick={() => confirm('Cancel this booking?') && act.mutate(() => bookingApi.cancel(b._id))}>Cancel</button>}
        {user?.role === 'customer' && b.status === 'completed' && <button className="btn" onClick={() => { const r = Number(prompt('Rating 1-5')); if (r >= 1 && r <= 5) act.mutate(async () => { await reviewApi.create({ booking: b._id, rating: r }); toast('Review submitted'); }); }}>Leave review</button>}
      </div></div>)}</main>;
}
