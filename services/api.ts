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
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; preferences?: object }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  resetPassword: (data: { userId: string; newPassword: string }) =>
    api.post('/auth/reset-password', data)
};

export const superAdminAPI = {
  getDashboard: () => api.get('/super-admin/dashboard'),
  getAuditLogs: (params?: object) => api.get('/super-admin/audit-logs', { params }),
  getSchools: (params?: object) => api.get('/super-admin/schools', { params }),
  createSchool: (data: object) => api.post('/super-admin/schools', data),
  getSchool: (id: string) => api.get(`/super-admin/schools/${id}`),
  updateSchool: (id: string, data: object) => api.put(`/super-admin/schools/${id}`, data),
  toggleSchool: (id: string) => api.patch(`/super-admin/schools/${id}/toggle`),
  deleteSchool: (id: string) => api.delete(`/super-admin/schools/${id}`),
  getUsers: (params?: object) => api.get('/super-admin/users', { params }),
  createUser: (data: object) => api.post('/super-admin/users', data),
  getUser: (id: string) => api.get(`/super-admin/users/${id}`),
  updateUser: (id: string, data: object) => api.put(`/super-admin/users/${id}`, data),
  toggleUser: (id: string) => api.patch(`/super-admin/users/${id}/toggle`),
  transferTeacher: (id: string, data: object) => api.patch(`/super-admin/users/${id}/transfer`, data)
};

export const schoolAPI = {
  getDashboard: () => api.get('/school/dashboard'),
  getProfile: () => api.get('/school/profile'),
  updateProfile: (data: object) => api.put('/school/profile', data),
  getTeachers: (params?: object) => api.get('/school/teachers', { params }),
  createTeacher: (data: object) => api.post('/school/teachers', data),
  updateTeacher: (id: string, data: object) => api.put(`/school/teachers/${id}`, data),
  toggleTeacher: (id: string) => api.patch(`/school/teachers/${id}/toggle`),
  getStudents: (params?: object) => api.get('/school/students', { params }),
  createStudent: (data: object) => api.post('/school/students', data),
  updateStudent: (id: string, data: object) => api.put(`/school/students/${id}`, data),
  toggleStudent: (id: string) => api.patch(`/school/students/${id}/toggle`),
  getPrincipals: () => api.get('/school/principals'),
  createPrincipal: (data: object) => api.post('/school/principals', data),
  togglePrincipal: (id: string) => api.patch(`/school/principals/${id}/toggle`)
};

export const principalAPI = {
  getDashboard: () => api.get('/principal/dashboard'),
  getClassrooms: () => api.get('/principal/classrooms'),
  createClassroom: (data: object) => api.post('/principal/classrooms', data),
  updateClassroom: (id: string, data: object) => api.put(`/principal/classrooms/${id}`, data),
  deleteClassroom: (id: string) => api.delete(`/principal/classrooms/${id}`),
  assignStudents: (id: string, studentIds: string[]) => api.post(`/principal/classrooms/${id}/assign-students`, { studentIds }),
  assignTeacher: (id: string, teacherId: string) => api.post(`/principal/classrooms/${id}/assign-teacher`, { teacherId }),
  getRoster: (id: string) => api.get(`/principal/classrooms/${id}/roster`),
  getSubjects: () => api.get('/principal/subjects'),
  createSubject: (data: object) => api.post('/principal/subjects', data),
  updateSubject: (id: string, data: object) => api.put(`/principal/subjects/${id}`, data),
  deleteSubject: (id: string) => api.delete(`/principal/subjects/${id}`),
  getSchedule: (classroomId?: string) => api.get('/principal/schedules', { params: { classroomId } }),
  upsertSchedule: (data: object) => api.post('/principal/schedules', data),
  getPayslips: () => api.get('/principal/payslips')
};

export const teacherAPI = {
  getDashboard: () => api.get('/teacher/dashboard'),
  getClasses: () => api.get('/teacher/classes'),
  getClassRoster: (id: string) => api.get(`/teacher/classes/${id}/roster`),
  getGrades: (params?: object) => api.get('/teacher/grades', { params }),
  createGrade: (data: object) => api.post('/teacher/grades', data),
  updateGrade: (id: string, data: object) => api.put(`/teacher/grades/${id}`, data),
  deleteGrade: (id: string) => api.delete(`/teacher/grades/${id}`),
  getDocuments: (params?: object) => api.get('/teacher/documents', { params }),
  uploadDocument: (formData: FormData) => api.post('/teacher/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocument: (id: string) => api.delete(`/teacher/documents/${id}`),
  getQuizzes: () => api.get('/teacher/quizzes'),
  createQuiz: (data: object) => api.post('/teacher/quizzes', data),
  updateQuiz: (id: string, data: object) => api.put(`/teacher/quizzes/${id}`, data),
  deleteQuiz: (id: string) => api.delete(`/teacher/quizzes/${id}`),
  getSubmissions: (id: string) => api.get(`/teacher/quizzes/${id}/submissions`),
  getHomework: (params?: object) => api.get('/teacher/homework', { params }),
  createHomework: (data: object) => api.post('/teacher/homework', data),
  getPayslips: () => api.get('/teacher/payslips')
};

export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getDocuments: (params?: object) => api.get('/student/documents', { params }),
  getGrades: (params?: object) => api.get('/student/grades', { params }),
  getQuizzes: () => api.get('/student/quizzes'),
  submitQuiz: (id: string, answers: object[]) => api.post(`/student/quizzes/${id}/submit`, { answers }),
  getAttendance: (params?: object) => api.get('/student/attendance', { params }),
  getHomework: () => api.get('/student/homework'),
  submitHomework: (id: string, data: object) => api.post(`/student/homework/${id}/submit`, data),
  getPayments: () => api.get('/student/payments'),
  getSchedule: () => api.get('/student/schedule')
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
