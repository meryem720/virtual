/**
 * Moteur d'adaptation pédagogique
 * Ajuste la difficulté en fonction des performances de l'élève
 */

import { prisma } from './prisma';

interface AttemptData {
  isCorrect: boolean;
  score: number;
  errorCount: number;
  timeSpent: number;
}

/**
 * Calcule le nouveau niveau de difficulté pour un élève
 * Algorithme adaptatif basé sur les tentatives récentes
 */
export async function calculateNewDifficulty(
  studentId: string,
  currentDifficulty: number,
  recentAttempts: AttemptData[]
): Promise<number> {
  // Récupérer le profil de l'élève
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
  });

  if (!student) return currentDifficulty;

  const adaptationSpeed = student.adaptationSpeed;
  
  // Calculer la performance moyenne
  const avgScore = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;
  const successRate = recentAttempts.filter((a) => a.isCorrect).length / recentAttempts.length;
  const avgErrors = recentAttempts.reduce((sum, a) => sum + a.errorCount, 0) / recentAttempts.length;

  let adjustment = 0;

  // Logique d'adaptation
  if (successRate > 0.8 && avgScore > 85) {
    // Très bon → augmenter la difficulté
    adjustment = 5 * adaptationSpeed;
  } else if (successRate > 0.6 && avgScore > 70) {
    // Bon → légère augmentation
    adjustment = 2 * adaptationSpeed;
  } else if (successRate < 0.4 || avgScore < 50) {
    // Difficultés → diminuer la difficulté
    adjustment = -5 * adaptationSpeed;
  } else if (successRate < 0.5 || avgScore < 60) {
    // Quelques difficultés → légère diminution
    adjustment = -2 * adaptationSpeed;
  }

  // Ajustement supplémentaire selon les erreurs
  if (avgErrors > 3) {
    adjustment -= 3;
  }

  // Appliquer l'ajustement et borner entre 0 et 100
  const newDifficulty = Math.max(0, Math.min(100, currentDifficulty + adjustment));

  return Math.round(newDifficulty);
}

/**
 * Recommande des exercices adaptés au niveau de l'élève
 */
export async function recommendExercises(
  studentId: string,
  skillId: string,
  limit: number = 5
): Promise<string[]> {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
  });

  if (!student) return [];

  const difficulty = student.difficultyLevel;
  const tolerance = 15; // Tolérance de ±15 points

  // Trouver les exercices dans la plage de difficulté
  const exercises = await prisma.exercise.findMany({
    where: {
      skillId,
      isPublished: true,
      difficultyLevel: {
        gte: difficulty - tolerance,
        lte: difficulty + tolerance,
      },
    },
    select: {
      id: true,
      difficultyLevel: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Prioriser les exercices proches du niveau de l'élève
  const sorted = exercises.sort((a, b) => {
    const diffA = Math.abs(a.difficultyLevel - difficulty);
    const diffB = Math.abs(b.difficultyLevel - difficulty);
    return diffA - diffB;
  });

  return sorted.slice(0, limit).map((e) => e.id);
}

/**
 * Met à jour la progression d'un élève sur une compétence
 */
export async function updateProgress(
  studentId: string,
  skillId: string,
  attempt: AttemptData
): Promise<void> {
  // Récupérer ou créer la progression
  let progress = await prisma.progress.findUnique({
    where: {
      studentId_skillId: {
        studentId,
        skillId,
      },
    },
  });

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
      },
    });
  }

  // Calculer les nouvelles valeurs
  const newTotalAttempts = progress.totalAttempts + 1;
  const newSuccessfulAttempts = progress.successfulAttempts + (attempt.isCorrect ? 1 : 0);
  const newTotalErrors = progress.totalErrors + attempt.errorCount;
  const newAverageScore = (progress.averageScore * progress.totalAttempts + attempt.score) / newTotalAttempts;

  // Calculer le nouveau niveau (0-100)
  const successRate = newSuccessfulAttempts / newTotalAttempts;
  const newLevel = Math.round(successRate * newAverageScore);

  // Vérifier si la compétence est maîtrisée
  const isMastered = newLevel >= 90 && newSuccessfulAttempts >= 3;

  // Mettre à jour
  await prisma.progress.update({
    where: {
      studentId_skillId: {
        studentId,
        skillId,
      },
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
      masteredAt: isMastered && !progress.isMastered ? new Date() : progress.masteredAt,
    },
  });
}
