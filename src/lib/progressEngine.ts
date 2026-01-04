/**
 * ============================================================
 * MOTEUR DE PROGRESSION PÉDAGOGIQUE
 * ============================================================
 * Service central pour gérer l'évolution des élèves :
 * - Enregistrement des tentatives
 * - Calcul de la progression par compétence
 * - Adaptation de la difficulté
 * - Recommandations personnalisées
 * - Détection des difficultés et intervention
 * ============================================================
 */

import { prisma } from './prisma';
import {
  ExerciseType,
  RecommendationType,
  Prisma,
} from '@prisma/client';

// ============================================================
// TYPES
// ============================================================

/**
 * Résultat d'une tentative d'exercice
 */
export interface AttemptInput {
  studentId: string;
  exerciseId: string;
  userId: string; // Qui a fait la tentative (élève ou parent qui aide)
  answer: Prisma.JsonValue;
  isCorrect: boolean;
  score: number; // 0-100
  errors?: Prisma.JsonValue;
  errorCount: number;
  hintsUsed?: string[];
  timeSpent: number; // en secondes
}

/**
 * Résultat de l'enregistrement d'une tentative
 */
export interface AttemptResult {
  attemptId: string;
  progressUpdated: boolean;
  newLevel: number;
  newDifficulty: number;
  pointsEarned: number;
  recommendation?: RecommendationResult;
  shouldReviewLesson: boolean; // Doit revoir la leçon
  needsRemediation: boolean; // Besoin de remédiation
}

/**
 * Recommandation générée
 */
export interface RecommendationResult {
  type: RecommendationType;
  title: string;
  description: string;
  exerciseIds: string[];
  lessonIds: string[];
  priority: number; // 0-100
}

/**
 * Profil d'apprentissage de l'élève
 */
interface LearningProfile {
  difficultyLevel: number;
  adaptationSpeed: number;
  recentSuccessRate: number;
  consecutiveErrors: number;
  totalAttempts: number;
}

// ============================================================
// CONSTANTES DE CONFIGURATION
// ============================================================

const CONFIG = {
  // Seuils de progression
  PROGRESS_INCREMENT_EXCELLENT: 8, // Score > 90
  PROGRESS_INCREMENT_GOOD: 5, // Score > 75
  PROGRESS_INCREMENT_AVERAGE: 3, // Score > 60
  PROGRESS_INCREMENT_WEAK: 1, // Score > 50
  PROGRESS_DECREMENT_FAIL: -2, // Score < 50

  // Seuils de difficulté
  DIFFICULTY_INCREMENT_HIGH: 8, // Taux réussite > 85%
  DIFFICULTY_INCREMENT_MEDIUM: 5, // Taux réussite > 70%
  DIFFICULTY_DECREMENT_MEDIUM: -5, // Taux réussite < 50%
  DIFFICULTY_DECREMENT_HIGH: -10, // Taux réussite < 30%

  // Seuils d'intervention
  CONSECUTIVE_ERRORS_WARNING: 2, // Alerte après 2 erreurs
  CONSECUTIVE_ERRORS_REMEDIATION: 3, // Remédiation après 3 erreurs
  MASTERY_THRESHOLD: 90, // Compétence maîtrisée à 90%
  EXCELLENCE_THRESHOLD: 95, // Excellence pour proposer défi

  // Fenêtre d'analyse (dernières tentatives)
  RECENT_ATTEMPTS_WINDOW: 5,

  // Points
  BASE_POINTS: 10,
  BONUS_PERFECT: 5,
  BONUS_FAST: 3, // Si temps < estimation

  // Adaptation de difficulté
  DIFFICULTY_RANGE_TOLERANCE: 15, // Plage de tolérance pour chercher des exercices
  DIFFICULTY_ADJUSTMENT_REMEDIATION: 20, // Réduction de difficulté en remédiation
  DIFFICULTY_ADJUSTMENT_WARNING: 10, // Réduction de difficulté si difficultés
  DIFFICULTY_ADJUSTMENT_SUCCESS: 10, // Augmentation si très bonne performance

  // Niveaux de difficulté
  DIFFICULTY_EASY_THRESHOLD: 35, // Exercices faciles
  DIFFICULTY_HARD_THRESHOLD: 80, // Exercices difficiles
  DIFFICULTY_MIN: 10, // Niveau minimum de difficulté
  DIFFICULTY_MIN_WARNING: 15, // Niveau minimum si difficultés

  // Durée par défaut
  DEFAULT_LESSON_DURATION: 10, // Minutes par défaut si pas de leçon

  // Seuils de score
  SCORE_THRESHOLD_SUCCESS: 60, // Score minimum pour considérer comme réussi
} as const;

// ============================================================
// FONCTIONS UTILITAIRES - EXERCICES
// ============================================================

/**
 * Trouve les exercices dans une plage de difficulté donnée
 */
async function findExercisesByDifficulty(
  skillId: string,
  targetDifficulty: number,
  excludeIds: string[] = [],
  tolerance: number = CONFIG.DIFFICULTY_RANGE_TOLERANCE
) {
  return prisma.exercise.findMany({
    where: {
      skillId,
      isPublished: true,
      id: { notIn: excludeIds },
      difficultyLevel: {
        gte: targetDifficulty - tolerance,
        lte: targetDifficulty + tolerance,
      },
    },
    orderBy: { order: 'asc' },
  });
}

/**
 * Trouve l'exercice le plus proche d'une difficulté cible
 */
function findClosestExercise<T extends { difficultyLevel: number; id: string }>(
  exercises: T[],
  targetDifficulty: number
): T | null {
  if (exercises.length === 0) return null;

  return exercises.reduce((closest, exercise) =>
    Math.abs(exercise.difficultyLevel - targetDifficulty) <
    Math.abs(closest.difficultyLevel - targetDifficulty)
      ? exercise
      : closest
  );
}

/**
 * Filtre les exercices par difficulté max/min
 */
function filterExercisesByDifficultyRange(
  exercises: { difficultyLevel: number; id: string }[],
  options: { min?: number; max?: number; limit?: number }
): string[] {
  let filtered = exercises;

  if (options.min !== undefined) {
    filtered = filtered.filter((ex) => ex.difficultyLevel >= options.min!);
  }

  if (options.max !== undefined) {
    filtered = filtered.filter((ex) => ex.difficultyLevel <= options.max!);
  }

  const result = filtered.map((ex) => ex.id);

  if (options.limit !== undefined) {
    return result.slice(0, options.limit);
  }

  return result;
}

/**
 * Calcule la difficulté cible basée sur le profil de l'élève
 */
function calculateTargetDifficulty(
  profile: LearningProfile,
  currentDifficulty: number
): number {
  if (profile.consecutiveErrors >= CONFIG.CONSECUTIVE_ERRORS_REMEDIATION) {
    return Math.max(CONFIG.DIFFICULTY_MIN, currentDifficulty - CONFIG.DIFFICULTY_ADJUSTMENT_REMEDIATION);
  } else if (profile.consecutiveErrors >= CONFIG.CONSECUTIVE_ERRORS_WARNING) {
    return Math.max(CONFIG.DIFFICULTY_MIN_WARNING, currentDifficulty - CONFIG.DIFFICULTY_ADJUSTMENT_WARNING);
  } else if (profile.recentSuccessRate > 0.85) {
    return Math.min(100, currentDifficulty + CONFIG.DIFFICULTY_ADJUSTMENT_SUCCESS);
  }
  return currentDifficulty;
}

// ============================================================
// FONCTIONS PRINCIPALES
// ============================================================

/**
 * Enregistre une tentative d'exercice et met à jour la progression
 * C'est la fonction principale du moteur de progression
 */
export async function registerAttempt(
  input: AttemptInput
): Promise<AttemptResult> {
  // 1. Récupérer les données nécessaires
  const [student, exercise, skill] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id: input.studentId },
    }),
    prisma.exercise.findUnique({
      where: { id: input.exerciseId },
      include: {
        lesson: true,
        skill: true,
      },
    }),
    getSkillFromExercise(input.exerciseId),
  ]);

  if (!student || !exercise || !skill) {
    throw new Error('Données introuvables');
  }

  // 2. Calculer les points gagnés
  const estimatedDuration = exercise.lesson?.estimatedDuration || CONFIG.DEFAULT_LESSON_DURATION;
  const pointsEarned = calculatePoints(input.score, input.timeSpent, estimatedDuration);

  // 3. Créer la tentative
  const attempt = await prisma.attempt.create({
    data: {
      studentId: input.studentId,
      exerciseId: input.exerciseId,
      userId: input.userId,
      answer: input.answer,
      isCorrect: input.isCorrect,
      score: input.score,
      pointsEarned,
      errors: input.errors || null,
      errorCount: input.errorCount,
      hints: input.hintsUsed || [],
      startedAt: new Date(Date.now() - input.timeSpent * 1000),
      completedAt: new Date(),
      timeSpent: input.timeSpent,
      exerciseDifficulty: exercise.difficultyLevel,
      studentDifficulty: student.difficultyLevel,
    },
  });

  // 4. Analyser les tentatives récentes pour cette compétence
  const recentAttempts = await getRecentAttempts(
    input.studentId,
    skill.id,
    CONFIG.RECENT_ATTEMPTS_WINDOW
  );

  const learningProfile = analyzeLearningProfile(recentAttempts, student);

  // 5. Mettre à jour la progression
  const progressResult = await updateProgress(
    input.studentId,
    skill.id,
    input.score,
    input.errorCount,
    learningProfile
  );

  // 6. Mettre à jour le profil de difficulté de l'élève
  const newDifficulty = await updateStudentDifficulty(
    input.studentId,
    learningProfile,
    student.difficultyLevel
  );

  // 7. Mettre à jour les points de l'élève
  await prisma.studentProfile.update({
    where: { id: input.studentId },
    data: {
      totalPoints: { increment: pointsEarned },
      lastActivityDate: new Date(),
    },
  });

  // 8. Déterminer si intervention nécessaire
  const shouldReviewLesson = learningProfile.consecutiveErrors >= CONFIG.CONSECUTIVE_ERRORS_WARNING;
  const needsRemediation = learningProfile.consecutiveErrors >= CONFIG.CONSECUTIVE_ERRORS_REMEDIATION;

  // 9. Générer recommandation si nécessaire
  let recommendation: RecommendationResult | undefined;

  if (needsRemediation) {
    // Remédiation urgente : revoir le cours + exercices guidés
    recommendation = await generateRecommendation(
      input.studentId,
      skill.id,
      'REMEDIATION',
      learningProfile
    );
  } else if (shouldReviewLesson && !input.isCorrect) {
    // Suggérer de revoir le cours
    recommendation = await generateRecommendation(
      input.studentId,
      skill.id,
      'REVIEW',
      learningProfile
    );
  } else if (progressResult.newLevel >= CONFIG.EXCELLENCE_THRESHOLD) {
    // Proposer un défi pour élève avancé
    recommendation = await generateRecommendation(
      input.studentId,
      skill.id,
      'CHALLENGE',
      learningProfile
    );
  } else if (progressResult.isMastered && !progressResult.wasMastered) {
    // Compétence maîtrisée → passer à la suivante
    recommendation = await generateRecommendation(
      input.studentId,
      skill.id,
      'ADVANCE',
      learningProfile
    );
  } else if (input.isCorrect) {
    // Continuer à pratiquer
    recommendation = await generateRecommendation(
      input.studentId,
      skill.id,
      'PRACTICE',
      learningProfile
    );
  }

  return {
    attemptId: attempt.id,
    progressUpdated: true,
    newLevel: progressResult.newLevel,
    newDifficulty,
    pointsEarned,
    recommendation,
    shouldReviewLesson,
    needsRemediation: needsRemediation,
  };
}

/**
 * Met à jour la progression sur une compétence
 * Calcule le nouveau niveau (0-100) basé sur les performances
 */
async function updateProgress(
  studentId: string,
  skillId: string,
  score: number,
  errorCount: number,
  profile: LearningProfile
): Promise<{
  newLevel: number;
  isMastered: boolean;
  wasMastered: boolean;
}> {
  // Récupérer ou créer la progression
  let progress = await prisma.progress.findUnique({
    where: {
      studentId_skillId: { studentId, skillId },
    },
  });

  const wasMastered = progress?.isMastered || false;

  if (!progress) {
    progress = await prisma.progress.create({
      data: {
        studentId,
        skillId,
        level: 0,
        previousLevel: 0,
        totalAttempts: 0,
        successfulAttempts: 0,
        totalErrors: 0,
        averageScore: 0,
        isMastered: false,
      },
    });
  }

  // Calculer les nouvelles statistiques
  const newTotalAttempts = progress.totalAttempts + 1;
  const newSuccessfulAttempts = progress.successfulAttempts + (score >= CONFIG.SCORE_THRESHOLD_SUCCESS ? 1 : 0);
  const newTotalErrors = progress.totalErrors + errorCount;
  const newAverageScore =
    (progress.averageScore * progress.totalAttempts + score) / newTotalAttempts;

  // Calculer l'incrément de progression selon les règles pédagogiques
  let progressIncrement = 0;

  if (score >= 90) {
    progressIncrement = CONFIG.PROGRESS_INCREMENT_EXCELLENT;
  } else if (score >= 75) {
    progressIncrement = CONFIG.PROGRESS_INCREMENT_GOOD;
  } else if (score >= 60) {
    progressIncrement = CONFIG.PROGRESS_INCREMENT_AVERAGE;
  } else if (score >= 50) {
    progressIncrement = CONFIG.PROGRESS_INCREMENT_WEAK;
  } else {
    progressIncrement = CONFIG.PROGRESS_DECREMENT_FAIL;
  }

  // Ajuster selon la vitesse d'adaptation de l'élève
  progressIncrement = Math.round(progressIncrement * profile.adaptationSpeed);

  // Calculer le nouveau niveau (borné entre 0 et 100)
  const newLevel = Math.max(0, Math.min(100, progress.level + progressIncrement));

  // Vérifier si la compétence est maîtrisée
  const isMastered =
    newLevel >= CONFIG.MASTERY_THRESHOLD &&
    newSuccessfulAttempts >= 3 &&
    profile.recentSuccessRate >= 0.8;

  // Mettre à jour la progression
  await prisma.progress.update({
    where: {
      studentId_skillId: { studentId, skillId },
    },
    data: {
      previousLevel: progress.level,
      level: newLevel,
      totalAttempts: newTotalAttempts,
      successfulAttempts: newSuccessfulAttempts,
      totalErrors: newTotalErrors,
      averageScore: newAverageScore,
      lastPracticedAt: new Date(),
      isMastered,
      masteredAt: isMastered && !wasMastered ? new Date() : progress.masteredAt,
    },
  });

  return { newLevel, isMastered, wasMastered };
}

/**
 * Recommande le prochain exercice adapté au niveau de l'élève
 * Logique d'adaptation basée sur les performances
 */
export async function getNextExercise(
  studentId: string,
  skillId: string
): Promise<string | null> {
  const [student, skill] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { id: studentId } }),
    prisma.skill.findUnique({ where: { id: skillId } }),
  ]);

  if (!student || !skill) return null;

  // Récupérer les tentatives récentes pour analyse
  const recentAttempts = await getRecentAttempts(studentId, skillId, CONFIG.RECENT_ATTEMPTS_WINDOW);
  const profile = analyzeLearningProfile(recentAttempts, student);

  // Calculer la difficulté cible
  const targetDifficulty = calculateTargetDifficulty(profile, student.difficultyLevel);

  // Trouver les exercices déjà faits
  const completedExerciseIds = await prisma.attempt.findMany({
    where: {
      studentId,
      exercise: { skillId },
    },
    select: { exerciseId: true },
    distinct: ['exerciseId'],
  });

  const completedIds = completedExerciseIds.map((a) => a.exerciseId);

  // Chercher un exercice adapté non complété
  let exercises = await findExercisesByDifficulty(skillId, targetDifficulty, completedIds);

  // Si aucun exercice non fait, permettre de refaire les exercices
  if (exercises.length === 0) {
    exercises = await findExercisesByDifficulty(skillId, targetDifficulty);
    if (exercises.length === 0) return null;
  }

  // Prendre l'exercice le plus proche de la difficulté cible
  const closestExercise = findClosestExercise(exercises, targetDifficulty);
  return closestExercise?.id || null;
}

/**
 * Génère une recommandation personnalisée
 * Basée sur le type d'intervention nécessaire
 */
export async function generateRecommendation(
  studentId: string,
  skillId: string,
  type: RecommendationType,
  profile: LearningProfile
): Promise<RecommendationResult> {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: {
      subject: true,
      exercises: {
        where: { isPublished: true },
        orderBy: { difficultyLevel: 'asc' },
      },
    },
  });

  if (!skill) {
    throw new Error('Compétence introuvable');
  }

  // Récupérer la leçon associée
  const lesson = await prisma.lesson.findFirst({
    where: {
      subjectId: skill.subjectId,
      exercises: { some: { skillId } },
      isPublished: true,
    },
  });

  let recommendation: RecommendationResult;

  switch (type) {
    case 'REMEDIATION':
      // Remédiation : cours obligatoire + exercices guidés très simples
      const easyExercises = filterExercisesByDifficultyRange(skill.exercises, {
        max: CONFIG.DIFFICULTY_EASY_THRESHOLD,
        limit: 3,
      });

      recommendation = {
        type: 'REMEDIATION',
        title: '🆘 Prenons le temps de revoir ensemble',
        description: `Tu as du mal avec "${skill.name}". C'est normal, c'est difficile ! Revoyons la leçon ensemble et refaisons des exercices plus simples. Tu vas y arriver ! 💪`,
        exerciseIds: easyExercises,
        lessonIds: lesson ? [lesson.id] : [],
        priority: 100,
      };
      break;

    case 'REVIEW':
      // Revoir le cours après 2 erreurs
      const reviewExercises = filterExercisesByDifficultyRange(skill.exercises, {
        max: profile.difficultyLevel - CONFIG.DIFFICULTY_ADJUSTMENT_WARNING,
        limit: 2,
      });

      recommendation = {
        type: 'REVIEW',
        title: '📖 Revois la leçon',
        description: `Tu as fait quelques erreurs sur "${skill.name}". Relis la leçon pour bien comprendre, puis réessaie un exercice plus simple. Tu peux le faire ! 🎯`,
        exerciseIds: reviewExercises,
        lessonIds: lesson ? [lesson.id] : [],
        priority: 85,
      };
      break;

    case 'PRACTICE':
      // Continue à pratiquer
      const practiceExercises = filterExercisesByDifficultyRange(skill.exercises, {
        min: profile.difficultyLevel - CONFIG.DIFFICULTY_ADJUSTMENT_WARNING,
        max: profile.difficultyLevel + CONFIG.DIFFICULTY_ADJUSTMENT_WARNING,
        limit: 3,
      });

      recommendation = {
        type: 'PRACTICE',
        title: '🎯 Continue comme ça !',
        description: `Tu progresses bien sur "${skill.name}" ! Continue à t'entraîner pour devenir un expert. Prêt pour la suite ? 🚀`,
        exerciseIds: practiceExercises,
        lessonIds: [],
        priority: 60,
      };
      break;

    case 'ADVANCE':
      // Compétence maîtrisée → passer à la suivante
      const nextSkill = await prisma.skill.findFirst({
        where: {
          subjectId: skill.subjectId,
          order: { gt: skill.order },
        },
        include: {
          exercises: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            take: 2,
          },
        },
        orderBy: { order: 'asc' },
      });

      recommendation = {
        type: 'ADVANCE',
        title: '🏆 Bravo, compétence maîtrisée !',
        description: `Tu maîtrises maintenant "${skill.name}" ! ${
          nextSkill
            ? `Prêt à découvrir "${nextSkill.name}" ?`
            : 'Tu as terminé toutes les compétences de ce niveau !'
        } 🌟`,
        exerciseIds: nextSkill ? nextSkill.exercises.map((ex) => ex.id) : [],
        lessonIds: [],
        priority: 90,
      };
      break;

    case 'CHALLENGE':
      // Proposer un défi CM1 (extension future)
      const hardExercises = filterExercisesByDifficultyRange(skill.exercises, {
        min: CONFIG.DIFFICULTY_HARD_THRESHOLD,
        limit: 2,
      });

      recommendation = {
        type: 'CHALLENGE',
        title: '🌟 Défi spécial pour toi !',
        description: `Tu es très fort sur "${skill.name}" ! Je te propose un défi plus difficile. Pas d'inquiétude, ce n'est pas obligatoire, c'est juste pour t'amuser ! 🎪`,
        exerciseIds: hardExercises,
        lessonIds: [],
        priority: 50,
      };
      break;

    default:
      throw new Error(`Type de recommandation non supporté : ${type}`);
  }

  // Enregistrer la recommandation en base
  await prisma.recommendation.create({
    data: {
      studentId,
      userId: studentId, // Pour l'élève
      type: recommendation.type,
      priority: recommendation.priority,
      title: recommendation.title,
      description: recommendation.description,
      actionUrl: recommendation.lessonIds[0]
        ? `/lecons/${recommendation.lessonIds[0]}`
        : recommendation.exerciseIds[0]
        ? `/exercices/${recommendation.exerciseIds[0]}`
        : null,
      recommendedExerciseIds: recommendation.exerciseIds,
      recommendedLessonIds: recommendation.lessonIds,
      recommendedSkillIds: [skillId],
      isViewed: false,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    },
  });

  return recommendation;
}

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Récupère les tentatives récentes pour une compétence
 */
async function getRecentAttempts(
  studentId: string,
  skillId: string,
  limit: number
) {
  return prisma.attempt.findMany({
    where: {
      studentId,
      exercise: { skillId },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Analyse le profil d'apprentissage de l'élève
 * Calcule les métriques importantes pour l'adaptation
 */
function analyzeLearningProfile(
  recentAttempts: Awaited<ReturnType<typeof getRecentAttempts>>,
  student: { difficultyLevel: number; adaptationSpeed: number }
): LearningProfile {
  if (recentAttempts.length === 0) {
    return {
      difficultyLevel: student.difficultyLevel,
      adaptationSpeed: student.adaptationSpeed,
      recentSuccessRate: 0,
      consecutiveErrors: 0,
      totalAttempts: 0,
    };
  }

  // Taux de réussite récent
  const successCount = recentAttempts.filter((a) => a.isCorrect).length;
  const recentSuccessRate = successCount / recentAttempts.length;

  // Erreurs consécutives (depuis la dernière réussite)
  let consecutiveErrors = 0;
  for (const attempt of recentAttempts) {
    if (!attempt.isCorrect) {
      consecutiveErrors++;
    } else {
      break;
    }
  }

  return {
    difficultyLevel: student.difficultyLevel,
    adaptationSpeed: student.adaptationSpeed,
    recentSuccessRate,
    consecutiveErrors,
    totalAttempts: recentAttempts.length,
  };
}

/**
 * Met à jour le niveau de difficulté global de l'élève
 * Adapte progressivement selon les performances
 */
async function updateStudentDifficulty(
  studentId: string,
  profile: LearningProfile,
  currentDifficulty: number
): Promise<number> {
  let difficultyChange = 0;

  // Ajustement basé sur le taux de réussite récent
  if (profile.recentSuccessRate >= 0.85) {
    difficultyChange = CONFIG.DIFFICULTY_INCREMENT_HIGH;
  } else if (profile.recentSuccessRate >= 0.7) {
    difficultyChange = CONFIG.DIFFICULTY_INCREMENT_MEDIUM;
  } else if (profile.recentSuccessRate < 0.5) {
    difficultyChange = CONFIG.DIFFICULTY_DECREMENT_MEDIUM;
  } else if (profile.recentSuccessRate < 0.3) {
    difficultyChange = CONFIG.DIFFICULTY_DECREMENT_HIGH;
  }

  // Ajuster selon la vitesse d'adaptation
  difficultyChange = Math.round(difficultyChange * profile.adaptationSpeed);

  // Calculer la nouvelle difficulté (bornée entre 0 et 100)
  const newDifficulty = Math.max(0, Math.min(100, currentDifficulty + difficultyChange));

  // Ne mettre à jour que si changement significatif
  if (Math.abs(newDifficulty - currentDifficulty) >= 3) {
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { difficultyLevel: newDifficulty },
    });
    return newDifficulty;
  }

  return currentDifficulty;
}

/**
 * Calcule les points gagnés pour une tentative
 * Bonus pour performance parfaite et rapidité
 */
function calculatePoints(score: number, timeSpent: number, estimatedDuration: number): number {
  let points = CONFIG.BASE_POINTS;

  // Bonus selon le score
  if (score === 100) {
    points += CONFIG.BONUS_PERFECT;
  } else if (score >= 90) {
    points += 3;
  } else if (score >= 75) {
    points += 2;
  }

  // Bonus si rapide (moins que le temps estimé)
  if (timeSpent < estimatedDuration * 60 * 0.75) {
    points += CONFIG.BONUS_FAST;
  }

  // Minimum 1 point même en cas d'échec
  return Math.max(1, points);
}

/**
 * Récupère la compétence associée à un exercice
 */
async function getSkillFromExercise(exerciseId: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { skill: true },
  });
  return exercise?.skill;
}

// ============================================================
// EXTENSIONS FUTURES
// ============================================================

/**
 * TODO: Extension pour profils HPI (Haut Potentiel Intellectuel)
 * - Adapter la vitesse de progression plus rapidement
 * - Proposer des exercices de niveau supérieur plus tôt
 * - Détecter l'ennui (temps très court + score parfait)
 */
export async function detectGiftedProfile(studentId: string): Promise<boolean> {
  // Implémentation future
  return false;
}

/**
 * TODO: Extension pour niveau CM1
 * - Proposer des exercices CM1 après maîtrise CE2
 * - Créer un parcours progressif CE2 → CM1
 */
export async function unlockCM1Content(studentId: string): Promise<void> {
  // Implémentation future
}

/**
 * TODO: Système de badges et récompenses
 * - Badges de progression (Bronze, Argent, Or)
 * - Récompenses pour série de réussites
 * - Objectifs hebdomadaires
 */
export async function awardBadge(studentId: string, badgeType: string): Promise<void> {
  // Implémentation future
}
