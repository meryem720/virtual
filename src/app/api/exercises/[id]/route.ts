import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: {
        lesson: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Parse config if it's a JSON string
    const parsedExercise = {
      ...exercise,
      config: typeof exercise.config === 'string' 
        ? JSON.parse(exercise.config) 
        : exercise.config,
    };

    return NextResponse.json(parsedExercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
