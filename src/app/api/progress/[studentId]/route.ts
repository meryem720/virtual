/**
 * GET /api/progress/[studentId]
 * Récupère la progression complète d'un élève
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;

    // Récupérer le profil élève
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        difficultyLevel: true,
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Élève introuvable' },
        { status: 404 }
      );
    }

    // Récupérer la progression par compétence
    const progress = await prisma.progress.findMany({
      where: { studentId },
      include: {
        skill: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        lastPracticedAt: 'desc',
      },
    });

    // Statistiques globales
    const totalSkills = progress.length;
    const masteredSkills = progress.filter((p) => p.isMastered).length;
    const averageLevel =
      totalSkills > 0
        ? Math.round(progress.reduce((sum, p) => sum + p.level, 0) / totalSkills)
        : 0;

    // Tentatives récentes
    const recentAttempts = await prisma.attempt.findMany({
      where: { studentId },
      include: {
        exercise: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        student,
        progress: progress.map((p) => ({
          skillId: p.skillId,
          skillName: p.skill.name,
          subjectName: p.skill.subject.name,
          subjectIcon: p.skill.subject.icon,
          level: p.level,
          previousLevel: p.previousLevel,
          totalAttempts: p.totalAttempts,
          successfulAttempts: p.successfulAttempts,
          averageScore: Math.round(p.averageScore),
          isMastered: p.isMastered,
          lastPracticedAt: p.lastPracticedAt,
        })),
        statistics: {
          totalSkills,
          masteredSkills,
          averageLevel,
          totalAttempts: recentAttempts.length,
        },
        recentActivity: recentAttempts.map((a) => ({
          exerciseTitle: a.exercise.title,
          skillName: a.exercise.skill.name,
          score: a.score,
          isCorrect: a.isCorrect,
          pointsEarned: a.pointsEarned,
          completedAt: a.completedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la progression' },
      { status: 500 }
    );
  }
}
