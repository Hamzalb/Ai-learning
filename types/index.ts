export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
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

export interface Document {
  _id: string;
  title: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  extractedText?: string;
  pageCount: number;
  language: string;
  subject: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: string;
  userId: string;
  createdAt: string;
}

export interface QuizQuestion {
  _id?: string;
  question: string;
  type: 'mcq' | 'true_false' | 'fill_blank' | 'essay';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit: number;
  attempts: QuizAttempt[];
  lastScore?: number | null;
  userId: string;
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
  recentDocuments: Partial<Document>[];
  recentQuizzes: Partial<Quiz>[];
  badges: string[];
}

export interface Flashcard {
  _id: string;
  front: string;
  back: string;
  subject: string;
  tags: string[];
  confidence: 0 | 1 | 2 | 3 | 4;
  nextReview: string | null;
  reviewCount: number;
  userId: string;
  createdAt: string;
}

export interface ProgressSubject {
  subject: string;
  quizCount: number;
  chatCount: number;
  averageScore: number;
  totalScore: number;
}

export interface WeeklyActivity {
  day: string;
  quizzes: number;
  chats: number;
  total: number;
}

export type Language = 'arabic' | 'english' | 'lebanese';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Subject = 'math' | 'physics' | 'chemistry' | 'biology' | 'history' | 'arabic' | 'english' | 'french' | 'general';
