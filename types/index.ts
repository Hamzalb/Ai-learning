export type UserRole = 'super_admin' | 'school' | 'principal' | 'teacher' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  isActive?: boolean;
  phone?: string;
  avatar?: string;
  streak: number;
  xp: number;
  level: number;
  badges: { name: string; earnedAt: string }[];
  preferences: {
    language: 'arabic' | 'english' | 'lebanese';
    theme: 'light' | 'dark';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  stats: {
    totalQuizzes: number;
    totalChats: number;
    totalDocuments: number;
    averageScore: number;
  };
  createdAt: string;
}

export interface School {
  _id: string;
  name: string;
  address: string;
  logo?: string;
  contactEmail: string;
  phone: string;
  isActive: boolean;
  principalId?: string;
  createdAt: string;
}

export interface Classroom {
  _id: string;
  name: string;
  gradeLevel: string;
  capacity: number;
  schoolId: string;
  teacherId?: string;
  studentIds: string[];
  subjectIds: string[];
}

export interface Subject {
  _id: string;
  name: string;
  classroomId: string;
  teacherId?: string;
  schoolId: string;
  color: string;
}

export interface Grade {
  _id: string;
  studentId: string;
  subjectId: string;
  classroomId: string;
  type: 'quiz' | 'midterm' | 'final' | 'homework' | 'participation';
  score: number;
  maxScore: number;
  term: string;
  note?: string;
  createdAt: string;
}

export interface SchoolDocument {
  _id: string;
  title: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  classroomId: string;
  teacherId: string;
  visibility: string;
  category: 'lecture' | 'assignment' | 'resource' | 'exam';
  isProtected: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  _id?: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'mcq' | 'fill_blank' | 'essay';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  classroomId?: string;
  teacherId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  totalPoints?: number;
  duration?: number;
  timeLimit?: number;
  dueDate?: string;
  attempts?: QuizAttempt[];
  lastScore?: number | null;
  userId?: string;
  createdAt: string;
}

export interface QuizAttempt {
  userId: string;
  answers: string[];
  score: number;
  percentage: number;
  timeTaken: number;
  completedAt: string;
}

export interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  xpGained: number;
  passed: boolean;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  results: {
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    points: number;
  }[];
}

export interface Homework {
  _id: string;
  title: string;
  description: string;
  classroomId: string;
  subjectId: string;
  dueDate: string;
  submissions: HomeworkSubmission[];
  mySubmission?: HomeworkSubmission;
  status?: 'pending' | 'submitted' | 'graded';
  createdAt: string;
}

export interface HomeworkSubmission {
  studentId: string;
  text?: string;
  fileUrl?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface Attendance {
  _id: string;
  studentId: string;
  classroomId: string;
  subjectId?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  note?: string;
  createdAt?: string;
}

export interface Payment {
  _id: string;
  studentId: string;
  schoolId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidAt?: string;
  description: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetId?: string;
  targetModel?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  subject: string;
  language: string;
  messageCount?: number;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  user: User;
  stats: {
    totalQuizzes: number;
    totalChats: number;
    totalDocuments: number;
    averageScore: number;
    quizAttempts: number;
  };
  recentChats: Partial<Chat>[];
  recentDocuments: Partial<SchoolDocument>[];
  recentQuizzes: Partial<Quiz>[];
  badges: string[];
}

export type Language = 'arabic' | 'english' | 'lebanese';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SubjectArea = 'math' | 'physics' | 'chemistry' | 'biology' | 'history' | 'arabic' | 'english' | 'french' | 'general';

export interface PDFDocument {
  _id: string;
  title: string;
  fileUrl: string;
  originalName?: string;
  fileSize: number;
  mimeType?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: string;
  extractedText?: string;
  pageCount?: number;
  userId?: string;
  createdAt: string;
}

/** Backwards-compatibility alias for PDFDocument */
export type Document = PDFDocument;
