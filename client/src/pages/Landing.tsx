import { Link } from 'react-router-dom';
const CATS = ['Electrician', 'Plumber', 'Home Cleaning', 'AC Repair', 'Salon', 'Tutor', 'Mechanic', 'Electronics Repair'];
export default function Landing() {
  return <main className="mx-auto max-w-5xl p-6"><section className="py-16"><h1 className="max-w-2xl text-5xl font-extrabold leading-tight">Discover Trusted Services &amp; Businesses Near You</h1>
    <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-400">Compare nearby providers, book a time that is actually free, and follow your booking live.</p>
    <Link to="/discover" className="btn mt-6 inline-block">Find Services Near You</Link></section>
    <h2 className="mb-3 text-xl font-bold">Popular categories</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{CATS.map(c => <Link key={c} className="card font-semibold hover:border-loop-500" to={`/discover?category=${encodeURIComponent(c)}`}>{c}</Link>)}</div>
    <h2 className="mb-3 mt-12 text-xl font-bold">How it works</h2><ol className="grid gap-3 sm:grid-cols-5">{['Discover', 'Compare', 'Book', 'Track', 'Review'].map((s, i) => <li key={s} className="card"><b>{i + 1}.</b> {s}</li>)}</ol></main>;
}
