/**
 * Types globaux pour le projet
 */

import { RoleType, ExerciseType, RecommendationType } from '@prisma/client';

// ============================================================
// Types Session & Auth
// ============================================================

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  roles: RoleType[];
}

// ============================================================
// Types de réponses API
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================
// Types pour les exercices
// ============================================================

export interface QuestionQCM {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index de la bonne réponse
}

export interface QuestionQCU {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[]; // Indices des bonnes réponses
}

export interface FillBlanksQuestion {
  id: string;
  text: string; // "Le chat ___ sur le tapis"
  blanks: {
    position: number;
    correctAnswers: string[]; // Réponses acceptées
  }[];
}

export interface DragDropQuestion {
  id: string;
  instruction: string;
  items: {
    id: string;
    content: string;
    correctZone: string;
  }[];
  zones: {
    id: string;
    label: string;
  }[];
}

// ============================================================
// Types pour les statistiques
// ============================================================

export interface StudentStats {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalPoints: number;
  currentStreak: number;
  skillsMastered: number;
  totalSkills: number;
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  level: number;
  totalAttempts: number;
  successRate: number;
  isMastered: boolean;
  lastPracticedAt?: Date;
}

// ============================================================
// Types pour le moteur adaptatif
// ============================================================

export interface AdaptationParams {
  studentId: string;
  currentDifficulty: number;
  recentAttempts: {
    isCorrect: boolean;
    score: number;
    errorCount: number;
  }[];
}

export interface AdaptationResult {
  newDifficulty: number;
  recommendedExercises: string[];
  reasoning: string;
}

// ============================================================
// Types pour les dashboards
// ============================================================

export interface StudentDashboard {
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    level: number;
  };
  stats: StudentStats;
  recentActivity: {
    exerciseTitle: string;
    score: number;
    completedAt: Date;
  }[];
  recommendations: {
    id: string;
    type: RecommendationType;
    title: string;
    description: string;
  }[];
  nextLessons: {
    id: string;
    title: string;
    subject: string;
  }[];
}

export interface ParentDashboard {
  children: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    stats: StudentStats;
    recentProgress: SkillProgress[];
  }[];
}

export interface TeacherDashboard {
  classes: {
    id: string;
    name: string;
    studentCount: number;
    averageProgress: number;
  }[];
  recentEvaluations: {
    studentName: string;
    title: string;
    score?: number;
    date: Date;
  }[];
}
