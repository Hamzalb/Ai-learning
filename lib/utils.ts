import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('ar-LB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

export const getGradeColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-400';
  if (percentage >= 80) return 'text-blue-400';
  if (percentage >= 70) return 'text-yellow-400';
  if (percentage >= 60) return 'text-orange-400';
  return 'text-red-400';
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-muted-foreground';
  }
};

export const getXPForLevel = (level: number): number => level * 100;

export const calculateLevel = (xp: number): { level: number; progress: number } => {
  let level = 1;
  let remaining = xp;
  while (remaining >= getXPForLevel(level)) {
    remaining -= getXPForLevel(level);
    level++;
  }
  const progress = Math.floor((remaining / getXPForLevel(level)) * 100);
  return { level, progress };
};
