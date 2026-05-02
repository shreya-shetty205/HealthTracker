import axios from 'axios';

// ── Axios instance ─────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ───────────────────────────────────────────────────
export const registerUser = (data) => api.post('/register', data);
export const loginUser    = (data) => api.post('/login', data);

// ── Meals ──────────────────────────────────────────────────
export const addMeal    = (data) => api.post('/add-meal', data);
export const getMeals   = ()     => api.get('/get-meals');
export const deleteMeal = (id)   => api.delete(`/delete-meal/${id}`);

// ── Health Score ───────────────────────────────────────────
export const getHealthScore = () => api.get('/health-score');

// ── Insights (NEW) ─────────────────────────────────────────
export const getInsightsAPI = () => api.get('/insights');

export default api;
