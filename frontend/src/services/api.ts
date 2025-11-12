import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
export const login = (email: string, password: string) => api.post('/auth/login', { email, password });
export const getDevices = () => api.get('/inventory/devices');
export const getDashboardStats = () => api.get('/analytics/dashboard');
