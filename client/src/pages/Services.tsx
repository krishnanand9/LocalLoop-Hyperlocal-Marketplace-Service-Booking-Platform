import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { serviceApi } from '../api/endpoints';
import { errMsg } from '../api/apiClient';
import { useToast } from '../context/Toast';
import { Empty } from '../components/ui';
export default function Services() {
  const qc = useQueryClient(); const toast = useToast(); const { data } = useQuery({ queryKey: ['my-services'], queryFn: serviceApi.mine });
  const [f, setF] = useState({ name: '', price: '', duration: '60' }); const done = () => qc.invalidateQueries({ queryKey: ['my-services'] });
  const add = useMutation({ mutationFn: () => serviceApi.create({ name: f.name, price: +f.price, duration: +f.duration }), onSuccess: () => { setF({ name: '', price: '', duration: '60' }); done(); }, onError: e => toast(errMsg(e)) });
  const del = useMutation({ mutationFn: (id: string) => serviceApi.remove(id), onSuccess: done, onError: e => toast(errMsg(e)) });
  return <main className="mx-auto max-w-3xl space-y-3 p-4"><h1 className="text-2xl font-bold">My services</h1>
    <form className="card flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); add.mutate(); }}><input aria-label="Name" className="input flex-1" required placeholder="AC Repair" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><input aria-label="Price" className="input w-28" type="number" min={0} required placeholder="₹500" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /><input aria-label="Minutes" className="input w-24" type="number" min={15} step={15} required value={f.duration} onChange={e => setF({ ...f, duration: e.target.value })} /><button className="btn">Add service</button></form>
    {data?.length === 0 && <Empty title="No services yet" hint="Add your first service so customers can book you." />}
    {data?.map(s => <div key={s._id} className="card flex justify-between"><span>{s.name} · ₹{s.price} · {s.duration} min</span><button className="underline" onClick={() => confirm('Delete this service?') && del.mutate(s._id)}>Delete</button></div>)}</main>;
}
