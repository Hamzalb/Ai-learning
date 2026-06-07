import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; preferences?: object }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data)
};

export const aiAPI = {
  sendMessage: (data: { message: string; chatId?: string; language?: string; subject?: string }) =>
    api.post('/ai/chat', data),
  getChats: (page = 1) => api.get(`/ai/chats?page=${page}`),
  getChatById: (id: string) => api.get(`/ai/chats/${id}`),
  deleteChat: (id: string) => api.delete(`/ai/chats/${id}`),
  summarize: (data: { text: string; language?: string }) =>
    api.post('/ai/summarize', data),
  explainConcept: (data: { concept: string; subject?: string; language?: string }) =>
    api.post('/ai/explain', data)
};

export const pdfAPI = {
  upload: (formData: FormData, onProgress?: (p: number) => void) =>
    api.post('/pdf/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      }
    }),
  getDocuments: (page = 1) => api.get(`/pdf?page=${page}`),
  getDocumentById: (id: string) => api.get(`/pdf/${id}`),
  generateSummary: (id: string, language?: string) =>
    api.post(`/pdf/${id}/summarize`, { language }),
  deleteDocument: (id: string) => api.delete(`/pdf/${id}`)
};

export const quizAPI = {
  generateQuiz: (data: {
    documentId?: string;
    text?: string;
    difficulty?: string;
    questionCount?: number;
    language?: string;
    title?: string;
    subject?: string;
  }) => api.post('/quiz/generate', data),
  getQuizzes: (page = 1) => api.get(`/quiz?page=${page}`),
  getQuizById: (id: string) => api.get(`/quiz/${id}`),
  submitQuiz: (id: string, data: { answers: string[]; timeTaken: number }) =>
    api.post(`/quiz/${id}/submit`, data),
  deleteQuiz: (id: string) => api.delete(`/quiz/${id}`)
};

export const userAPI = {
  getDashboard: () => api.get('/user/dashboard'),
  getHistory: (type = 'all') => api.get(`/user/history?type=${type}`),
  getLeaderboard: () => api.get('/user/leaderboard')
};

export default api;
