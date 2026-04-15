import axios from 'axios';
import { clearToken, getToken, isTokenExpired } from '../auth/token.js';

const baseURL = import.meta.env.VITE_API_URL?.trim() || '';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers?.['Content-Type']) {
      delete config.headers['Content-Type'];
    }
    if (config.headers?.['content-type']) {
      delete config.headers['content-type'];
    }
  }

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const token = getToken();
      const responseMessage = String(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.response?.data ||
          ''
      ).toLowerCase();
      const clearlyInvalidToken =
        responseMessage.includes('token') &&
        (responseMessage.includes('expired') ||
          responseMessage.includes('invalid') ||
          responseMessage.includes('signature'));

      if (token && (isTokenExpired(token) || clearlyInvalidToken)) {
        clearToken();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
