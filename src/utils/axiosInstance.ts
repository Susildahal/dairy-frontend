import axios from 'axios';

// src/utils/axiosInstance.ts

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true, // send & receive cookies
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    
    // Handle unauthorized access
    if (status === 401 || status === 403) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (!/\/login$/i.test(path)) {
          window.location.href = '/login';
        }
      }
    }

    // Show error toast notifications
    (async () => {
      try {
        const { toast } = await import('./toast');

        const extractMessages = (data: any): string[] => {
          if (!data) return [];
          if (typeof data === 'string') return [data];
          if (Array.isArray(data)) return data.map(String);
          if (typeof data === 'object') {
            const candidates: string[] = [];
            const keys = ['message', 'error', 'errors', 'detail', 'details'];
            for (const k of keys) {
              if (data[k]) {
                const val = data[k];
                if (Array.isArray(val)) {
                  candidates.push(...val.map(String));
                } else if (typeof val === 'object') {
                  if (Array.isArray(val.messages)) {
                    candidates.push(...val.messages.map(String));
                  } else {
                    candidates.push(JSON.stringify(val));
                  }
                } else {
                  candidates.push(String(val));
                }
              }
            }
            if (candidates.length) return candidates;
            return [JSON.stringify(data)];
          }
          return [];
        };

        const resp = error?.response;
        const messages =
          extractMessages(resp?.data) ||
          [error?.message || 'An unexpected error occurred'];

        // De-duplicate
        const unique = Array.from(new Set(messages.filter(Boolean)));

        // Only show toast if it's not a 401/403 (handled separately)
        if (status !== 401 && status !== 403) {
          unique.forEach(m => toast.error(m, { duration: 5000 }));
        }

        // Handle success messages on error responses
        if (resp?.data?.successMessage) {
          toast.success(String(resp.data.successMessage));
        }
      } catch {
        // Fallback if toast or dynamic import fails
        console.error('Error handling failed:', error);
      }
    })();

    return Promise.reject(error);
  }
);

export default axiosInstance;