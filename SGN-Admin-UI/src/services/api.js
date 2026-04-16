import axios from 'axios';
import { clearToken, getToken } from '../auth/token.js';

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
      const hadAuth = Boolean(
        err.config?.headers?.Authorization || err.config?.headers?.authorization
      );
      if (hadAuth) {
        clearToken();
        const path = window.location.pathname;
        const search = window.location.search || '';
        if (
          !path.startsWith('/login') &&
          !path.startsWith('/customer/signup')
        ) {
          const redirect = encodeURIComponent(`${path}${search}`);
          window.location.assign(`/login?redirect=${redirect}`);
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
