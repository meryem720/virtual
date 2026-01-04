/**
 * Page détail d'une compétence
 * Affiche le mini-cours et les exercices
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SkillPageProps {
  params: {
    id: string;
  };
}

export default async function SkillPage({ params }: SkillPageProps) {
  // Récupérer la compétence avec la leçon et les exercices
  const skill = await prisma.skill.findUnique({
    where: { id: params.id },
    include: {
      subject: true,
      exercises: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!skill) {
    notFound();
  }

  // Récupérer la leçon associée
  const lesson = await prisma.lesson.findFirst({
    where: {
      subjectId: skill.subjectId,
      exercises: {
        some: { skillId: skill.id },
      },
      isPublished: true,
    },
  });

  // Parser le contenu de la leçon
  const lessonContent = lesson
    ? (JSON.parse(lesson.content as string) as { sections: Array<{ type: string; title?: string; content: string }> })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/student">
              <Button variant="outline">← Retour</Button>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{skill.subject.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{skill.name}</h1>
                <p className="text-gray-600">{skill.subject.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - Leçon */}
          <div className="lg:col-span-2 space-y-6">
            {lesson && lessonContent ? (
              <Card className="kid-card">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    📖 {lesson.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {lesson.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {lessonContent.sections.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                      {section.title && (
                        <h3 className="text-xl font-bold text-gray-800">
                          {section.title}
                        </h3>
                      )}
                      <div className="bg-white p-4 rounded-lg border-2 border-primary-200">
                        <p className="whitespace-pre-line text-lg leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {lesson.videoUrl && (
                    <div className="mt-6">
                      <h3 className="text-xl font-bold mb-3">🎥 Vidéo explicative</h3>
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Vidéo à venir</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="kid-card">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 text-lg">
                    Aucune leçon disponible pour cette compétence
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Liste des exercices */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                ✏️ Exercices
                <Badge>{skill.exercises.length}</Badge>
              </h2>

              <div className="space-y-4">
                {skill.exercises.map((exercise, idx) => (
                  <Link key={exercise.id} href={`/student/exercise/${exercise.id}`}>
                    <Card className="kid-card cursor-pointer hover:shadow-xl hover:scale-105 transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <CardTitle className="text-xl">{exercise.title}</CardTitle>
                              <CardDescription className="text-base mt-1">
                                {exercise.instructions || `Temps estimé: ${exercise.estimatedTime} min`}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                exercise.difficulty < 35
                                  ? 'secondary'
                                  : exercise.difficulty < 65
                                  ? 'default'
                                  : 'destructive'
                              }
                              className="text-base px-4 py-2"
                            >
                              Niveau {exercise.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Progression */}
          <div className="space-y-6">
            <Card className="kid-card sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl">📊 Ta progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Niveau</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: '0%' }}
                      />
                    </div>
                    <span className="font-bold text-lg">0%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Exercices faits</p>
                    <p className="text-2xl font-bold text-primary-600">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Score moyen</p>
                    <p className="text-2xl font-bold text-green-600">-%</p>
                  </div>
                </div>

                <Button className="w-full kid-button mt-4">
                  🎯 Commencer un exercice
                </Button>
              </CardContent>
            </Card>

            {/* Conseils */}
            <Card className="bg-blue-50 border-blue-200 border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  💡 Conseil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  Commence par lire la leçon tranquillement. Ensuite, fais les exercices
                  dans l'ordre. Si tu as du mal, relis la leçon ! 📖
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
