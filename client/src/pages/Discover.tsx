import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { providerApi } from '../api/endpoints';
import { errMsg } from '../api/apiClient';
import { getLocation } from '../utils/geo';
import { useDebounce } from '../hooks/useDebounce';
import { Empty, ErrorBox, Skeleton, Stars } from '../components/ui';
export default function Discover() {
  const [sp] = useSearchParams(); const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [q, setQ] = useState(''); const [radius, setRadius] = useState(10); const [sort, setSort] = useState('distance'); const [verified, setVerified] = useState(false); const dq = useDebounce(q);
  useEffect(() => { getLocation().then(setLoc); }, []);
  const { data, isLoading, error } = useQuery({ queryKey: ['nearby', loc, dq, radius, sort, verified, sp.get('category')], enabled: !!loc, queryFn: () => providerApi.nearby({ ...loc, q: dq || undefined, radius, sort, verified: verified || undefined, category: sp.get('category') || undefined }) });
  return <main className="mx-auto max-w-5xl p-4"><div className="sticky top-14 z-[5] flex flex-wrap gap-2 bg-white/90 py-2 backdrop-blur dark:bg-slate-950/90">
    <input aria-label="Search services" className="input min-w-[200px] flex-1" placeholder="Search AC repair, electrician…" value={q} onChange={e => setQ(e.target.value)} />
    <select aria-label="Radius" className="input w-auto" value={radius} onChange={e => setRadius(+e.target.value)}>{[2, 5, 10, 25].map(r => <option key={r} value={r}>{r} km</option>)}</select>
    <select aria-label="Sort" className="input w-auto" value={sort} onChange={e => setSort(e.target.value)}><option value="distance">Nearest</option><option value="rating">Top rated</option></select>
    <label className="flex items-center gap-1"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} />Verified</label></div>
    <div className="mt-3 space-y-3">{(isLoading || !loc) && <><Skeleton /><Skeleton /></>}{error && <ErrorBox msg={errMsg(error)} />}
      {data?.length === 0 && <Empty title="No providers within this radius" hint="Try a larger radius or another search." />}
      {data?.map(p => <Link key={p._id} to={`/providers/${p._id}`} className="card flex items-center justify-between hover:border-loop-500"><div><p className="font-bold">{p.businessName} {p.verified && <span className="text-loop-600">✓ Verified</span>}</p><p className="text-sm text-slate-500">{p.category} · {p.address}</p><Stars v={p.rating} /> <span className="text-sm text-slate-500">({p.reviewCount})</span></div><span className="text-sm font-semibold">{((p.distance || 0) / 1000).toFixed(1)} km</span></Link>)}</div></main>;
}
