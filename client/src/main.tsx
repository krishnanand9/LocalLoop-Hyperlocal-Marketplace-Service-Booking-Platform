import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/Toast';
import App from './App';
import './index.css';
class Boundary extends Component<{ children: ReactNode }, { bad: boolean }> {
  state = { bad: false }; static getDerivedStateFromError() { return { bad: true }; }
  render() { return this.state.bad ? <div className="p-10 text-center">Something broke. <button className="underline" onClick={() => location.reload()}>Reload</button></div> : this.props.children; }
}
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Boundary><QueryClientProvider client={qc}><BrowserRouter><ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider></BrowserRouter></QueryClientProvider></Boundary></React.StrictMode>);
