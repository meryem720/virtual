/**
 * GET /api/recommendations/[studentId]
 * Récupère les recommandations personnalisées pour un élève
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;

    // Vérifier que l'élève existe
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Élève introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les recommandations actives (non complétées et non expirées)
    const recommendations = await prisma.recommendation.findMany({
      where: {
        studentId,
        isCompleted: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 10,
    });

    // Enrichir avec les données des exercices et leçons
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const exercises = await prisma.exercise.findMany({
          where: { id: { in: rec.recommendedExerciseIds } },
          select: {
            id: true,
            title: true,
            difficultyLevel: true,
            points: true,
          },
        });

        const lessons = await prisma.lesson.findMany({
          where: { id: { in: rec.recommendedLessonIds } },
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        });

        const skills = await prisma.skill.findMany({
          where: { id: { in: rec.recommendedSkillIds } },
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                name: true,
                icon: true,
                color: true,
              },
            },
          },
        });

        return {
          id: rec.id,
          type: rec.type,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          actionUrl: rec.actionUrl,
          exercises,
          lessons,
          skills,
          isViewed: rec.isViewed,
          createdAt: rec.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedRecommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des recommandations' },
      { status: 500 }
    );
  }
}
