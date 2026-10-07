import axios from 'axios';
export const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL });
apiClient.interceptors.request.use(c => { const t = localStorage.getItem('ll_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
apiClient.interceptors.response.use(r => r, e => { if (e.response?.status === 401 && localStorage.getItem('ll_token')) { localStorage.removeItem('ll_token'); location.href = '/login'; } return Promise.reject(e); });
export const errMsg = (e: any): string => e?.response?.data?.message || (e?.request ? 'Cannot reach the server. Check your connection.' : 'Something went wrong');
