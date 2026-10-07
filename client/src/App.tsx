import { Routes, Route, Link } from 'react-router-dom';
import { NavBar } from './components/ui';
import { Guard } from './routes/Guard';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Discover from './pages/Discover';
import ProviderPage from './pages/ProviderPage';
import Bookings from './pages/Bookings';
import Services from './pages/Services';
export default function App() {
  return <><NavBar /><Routes>
    <Route path="/" element={<Landing />} /><Route path="/login" element={<Auth mode="login" />} /><Route path="/register" element={<Auth mode="register" />} />
    <Route path="/discover" element={<Discover />} /><Route path="/providers/:id" element={<ProviderPage />} />
    <Route path="/bookings" element={<Guard><Bookings /></Guard>} /><Route path="/services" element={<Guard roles={['provider']}><Services /></Guard>} />
    <Route path="*" element={<main className="p-10 text-center"><h1 className="text-3xl font-bold">Page not found</h1><Link className="underline" to="/">Back to home</Link></main>} /></Routes></>;
}
