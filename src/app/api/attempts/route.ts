/**
 * POST /api/attempts
 * Enregistre une tentative d'exercice et retourne la progression mise à jour
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerAttempt } from '@/lib/progressEngine';
import { z } from 'zod';

const attemptSchema = z.object({
  studentId: z.string(),
  exerciseId: z.string(),
  userId: z.string(),
  answer: z.any(),
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  errorCount: z.number().min(0),
  hintsUsed: z.array(z.string()).optional(),
  timeSpent: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    const validated = attemptSchema.parse(body);

    // Enregistrer la tentative et mettre à jour la progression
    const result = await registerAttempt({
      studentId: validated.studentId,
      exerciseId: validated.exerciseId,
      userId: validated.userId,
      answer: validated.answer,
      isCorrect: validated.isCorrect,
      score: validated.score,
      errorCount: validated.errorCount,
      hintsUsed: validated.hintsUsed,
      timeSpent: validated.timeSpent,
      errors: validated.errorCount > 0 ? { details: 'Errors logged' } : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        attemptId: result.attemptId,
        newLevel: result.newLevel,
        newDifficulty: result.newDifficulty,
        pointsEarned: result.pointsEarned,
        recommendation: result.recommendation,
        shouldReviewLesson: result.shouldReviewLesson,
        needsRemediation: result.needsRemediaton,
      },
    });
  } catch (error) {
    console.error('Error registering attempt:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'enregistrement de la tentative' },
      { status: 500 }
    );
  }
}
