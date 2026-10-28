import axios from 'axios';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('codebuddy_api_url');
    if (custom) return custom;

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:5000/api';
    }
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://code-buddy-backend-n90q.onrender.com/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 65000
});

// Request Interceptor: Attach dynamic base URL and Supabase / Demo JWT token
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('codebuddy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle 401
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if server rejected expired session
      // But don't redirect if it's already on login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // localStorage.removeItem('codebuddy_token');
      }
    }

    const customError = {
      status: error.response?.status || 500,
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      message: error.response?.data?.error?.message || error.message || 'Network communication failed',
      details: error.response?.data?.error?.details || []
    };

    return Promise.reject(customError);
  }
);

export const healthApi = {
  check: () => apiClient.get('/health'),
  checkAi: () => apiClient.get('/health/ai')
};

export const aiApi = {
  explain: (language, code) => apiClient.post('/ai/explain', { language, code }),
  debug: (language, code, errorMessage, expectedBehavior) =>
    apiClient.post('/ai/debug', { language, code, errorMessage, expectedBehavior }),
  generatePractice: (language, topic, difficulty) =>
    apiClient.post('/ai/practice/generate', { language, topic, difficulty }),
  getHint: (language, problemTitle, problemDescription, requestedLevel, studentCode) =>
    apiClient.post('/ai/hints', { language, problemTitle, problemDescription, requestedLevel, studentCode }),
  getSolution: (language, problemTitle, problemDescription) =>
    apiClient.post('/ai/solution', { language, problemTitle, problemDescription }),
  chat: (language, message, history, conversationId) =>
    apiClient.post('/ai/chat', { language, message, history, conversationId })
};

export const conversationApi = {
  list: () => apiClient.get('/conversations'),
  create: (title, language) => apiClient.post('/conversations', { title, language }),
  get: (id) => apiClient.get(`/conversations/${id}`),
  update: (id, title) => apiClient.patch(`/conversations/${id}`, { title }),
  delete: (id) => apiClient.delete(`/conversations/${id}`)
};

export const practiceApi = {
  list: () => apiClient.get('/practice'),
  save: (problemData) => apiClient.post('/practice', problemData),
  get: (id) => apiClient.get(`/practice/${id}`),
  recordAttempt: (problemId, attemptData) => apiClient.post(`/practice/${problemId}/attempts`, attemptData),
  listAttempts: () => apiClient.get('/practice/attempts')
};

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getActivity: () => apiClient.get('/dashboard/activity')
};

export const authApi = {
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (displayName) => apiClient.patch('/profile', { displayName })
};

export default apiClient;
