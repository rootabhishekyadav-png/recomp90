import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '';
const baseURL = rawBaseURL
  ? (rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL.replace(/\/+$/, '')}/api`)
  : '/api';

const API = axios.create({
  baseURL
});

// Interceptor to add auth token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('recomp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  unlock: (password) => API.post('/auth/unlock', { password }),
  checkSession: () => API.get('/auth/me')
};

export const dashboardAPI = {
  getSummary: () => API.get('/dashboard/summary')
};

export const nutritionAPI = {
  getFoods: () => API.get('/nutrition/foods'),
  addCustomFood: (food) => API.post('/nutrition/custom-food', food),
  deleteCustomFood: (id) => API.delete(`/nutrition/custom-food/${id}`),
  getDayLog: (date) => API.get(`/nutrition/day/${date}`),
  saveDayLog: (logData) => API.post('/nutrition/log', logData)
};

export const measurementAPI = {
  getAll: () => API.get('/measurements'),
  save: (data) => API.post('/measurements', data),
  delete: (id) => API.delete(`/measurements/${id}`)
};

export const workoutAPI = {
  getToday: () => API.get('/workouts/today'),
  getDayPlan: (day) => API.get(`/workouts/plan/${day}`),
  getSplitOverview: () => API.get('/workouts/split-overview'),
  saveLog: (workoutData) => API.post('/workouts/log', workoutData),
  getHistory: () => API.get('/workouts/history')
};

export const photoAPI = {
  getGeneralFeed: () => API.get('/photos/general'),
  uploadGeneral: (formData) => API.post('/photos/general/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGeneral: (id) => API.delete(`/photos/general/${id}`),
  getMilestones: () => API.get('/photos/transformation'),
  uploadMilestone: (formData) => API.post('/photos/transformation/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const excelAPI = {
  downloadUrl: rawBaseURL
    ? `${rawBaseURL.replace(/\/+$/, '')}/api/excel/download`
    : '/api/excel/download'
};

/**
 * Resolves an image URL whether it's an ImageKit CDN URL (https://ik.imagekit.io/...)
 * or a server local relative path (/uploads/...).
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = (rawBaseURL || 'https://recomp90.onrender.com').replace(/\/+$/, '').replace(/\/api$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default API;
