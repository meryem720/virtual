/**
 * Dashboard Parent
 * Suivi de la progression des enfants
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Pour la démo, on utilise l'ID de l'élève Emma du seed
const DEMO_STUDENT_ID = 'emma-student-id'; // À remplacer par vraie session

export default async function ParentDashboardPage() {
  // Récupérer tous les enfants du parent (pour la démo, on prend Emma)
  const students = await prisma.studentProfile.findMany({
    where: {
      // En production : filter by parent via ParentChildLink
    },
    take: 1, // Demo : 1 seul enfant
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Si pas d'enfant, afficher message
  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Aucun enfant associé</CardTitle>
            <CardDescription>
              Contactez l'administrateur pour associer votre compte à votre enfant.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const student = students[0];

  // Récupérer la progression
  const progress = await prisma.progress.findMany({
    where: { studentId: student.id },
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

  // Statistiques
  const totalSkills = progress.length;
  const masteredSkills = progress.filter((p) => p.isMastered).length;
  const averageLevel = totalSkills > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.level, 0) / totalSkills)
    : 0;

  // Compétences par matière
  const progressBySubject = progress.reduce((acc, p) => {
    const subjectName = p.skill.subject.name;
    if (!acc[subjectName]) {
      acc[subjectName] = {
        icon: p.skill.subject.icon,
        color: p.skill.subject.color,
        skills: [],
      };
    }
    acc[subjectName].skills.push(p);
    return acc;
  }, {} as Record<string, { icon: string; color: string | null; skills: typeof progress }>);

  // Points forts et faibles
  const strengths = progress
    .filter((p) => p.level >= 75)
    .sort((a, b) => b.level - a.level)
    .slice(0, 3);

  const weaknesses = progress
    .filter((p) => p.level < 50)
    .sort((a, b) => a.level - b.level)
    .slice(0, 3);

  // Activité récente
  const recentAttempts = await prisma.attempt.findMany({
    where: { studentId: student.id },
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

  // Recommandations
  const recommendations = await prisma.recommendation.findMany({
    where: {
      studentId: student.id,
      isCompleted: false,
    },
    orderBy: { priority: 'desc' },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Suivi de {student.firstName}
              </h1>
              <p className="text-gray-600 mt-1">
                Tableau de bord parental
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">← Retour</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Progression globale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {averageLevel}%
              </div>
              <Progress value={averageLevel} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Compétences maîtrisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {masteredSkills}/{totalSkills}
              </div>
              <p className="text-sm text-gray-500">
                {totalSkills > 0
                  ? `${Math.round((masteredSkills / totalSkills) * 100)}% de réussite`
                  : 'Aucune activité'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Points accumulés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                ⭐ {student.totalPoints}
              </div>
              <p className="text-sm text-gray-500">
                Série : {student.currentStreak} jour{student.currentStreak > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progression par matière */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">📊 Progression par matière</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(progressBySubject).map(([subjectName, data]) => {
                  const subjectAverage = Math.round(
                    data.skills.reduce((sum, s) => sum + s.level, 0) / data.skills.length
                  );

                  return (
                    <div key={subjectName}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{data.icon}</span>
                          <span className="font-semibold">{subjectName}</span>
                        </div>
                        <span className="font-bold text-lg">{subjectAverage}%</span>
                      </div>
                      <Progress value={subjectAverage} className="h-3 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill) => (
                          <Badge
                            key={skill.id}
                            variant={skill.isMastered ? 'default' : 'secondary'}
                          >
                            {skill.skill.name} ({skill.level}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Points forts et faibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Points forts */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    💪 Points forts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {strengths.length > 0 ? (
                    <ul className="space-y-3">
                      {strengths.map((s) => (
                        <li key={s.id} className="flex items-center justify-between">
                          <span className="text-sm">{s.skill.name}</span>
                          <Badge className="bg-green-600">{s.level}%</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Aucune compétence forte identifiée pour le moment
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Points faibles */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📈 À améliorer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weaknesses.length > 0 ? (
                    <ul className="space-y-3">
                      {weaknesses.map((s) => (
                        <li key={s.id} className="flex items-center justify-between">
                          <span className="text-sm">{s.skill.name}</span>
                          <Badge variant="destructive">{s.level}%</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Aucune difficulté majeure détectée 🎉
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">📅 Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAttempts.length > 0 ? (
                  <div className="space-y-3">
                    {recentAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{attempt.exercise.title}</p>
                          <p className="text-sm text-gray-500">
                            {attempt.exercise.skill.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={attempt.isCorrect ? 'default' : 'destructive'}
                          >
                            {attempt.score}%
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(attempt.completedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Aucune activité récente
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Recommandations */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">💡 Recommandations</CardTitle>
                <CardDescription>
                  Actions suggérées pour votre enfant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
                    >
                      <h4 className="font-semibold text-sm mb-2">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mb-3">
                        {rec.description}
                      </p>
                      <Badge className="bg-blue-600 text-xs">
                        {rec.type === 'REMEDIATION' && '🆘 Urgent'}
                        {rec.type === 'REVIEW' && '📖 À revoir'}
                        {rec.type === 'PRACTICE' && '🎯 Pratique'}
                        {rec.type === 'ADVANCE' && '🏆 Progression'}
                        {rec.type === 'CHALLENGE' && '🌟 Défi'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucune recommandation pour le moment
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Conseils */}
            <Card className="bg-purple-50 border-purple-200 border-2">
              <CardHeader>
                <CardTitle className="text-lg">👨‍👩‍👧 Conseils parentaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>
                    ✅ <strong>Encouragez</strong> les efforts plutôt que les résultats
                  </p>
                  <p>
                    ✅ <strong>Respectez</strong> le rythme d'apprentissage
                  </p>
                  <p>
                    ✅ <strong>Célébrez</strong> chaque petite victoire
                  </p>
                  <p>
                    ✅ <strong>Soyez disponible</strong> en cas de difficulté
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
