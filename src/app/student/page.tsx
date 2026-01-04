/**
 * Page d'accueil élève
 * 4 portes d'entrée : Par matière, Par objectif, Diagnostic, Parcours recommandé
 */

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export default async function StudentHomePage() {
  // Fetch real skills from database
  const skills = await prisma.skill.findMany({
    take: 2,
    include: {
      subject: true,
    },
  });

  const doors = [
    {
      title: '📚 Par matière',
      description: 'Choisis une matière et découvre tes compétences',
      href: '/student/subjects',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      emoji: '📚',
    },
    {
      title: '🎯 Par objectif',
      description: 'Travaille une compétence précise',
      href: '/student/skills',
      color: 'bg-gradient-to-br from-green-400 to-green-600',
      emoji: '🎯',
    },
    {
      title: '🔍 Diagnostic',
      description: 'Découvre ton niveau et tes points forts',
      href: '/student/diagnostic',
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      emoji: '🔍',
    },
    {
      title: '🚀 Parcours recommandé',
      description: 'Suis ton parcours personnalisé',
      href: '/student/recommendations',
      color: 'bg-gradient-to-br from-orange-400 to-orange-600',
      emoji: '🚀',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-600">
                🎓 Mon École Virtuelle
              </h1>
              <p className="text-gray-600 mt-1">Bonjour Emma ! Prête à apprendre ?</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Tes points</p>
                <p className="text-2xl font-bold text-yellow-500">⭐ 0</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Comment veux-tu apprendre aujourd'hui ? 🌈
          </h2>
          <p className="text-xl text-gray-600">
            Choisis une porte et commence l'aventure !
          </p>
        </div>

        {/* Les 4 portes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {doors.map((door) => (
            <Link key={door.href} href={door.href}>
              <Card className={`
                ${door.color} 
                text-white 
                cursor-pointer 
                transition-all 
                duration-300 
                hover:scale-105 
                hover:shadow-2xl
                border-4
                border-white
                h-full
                min-h-[250px]
                kid-card
              `}>
                <CardHeader className="text-center pb-4">
                  <div className="text-8xl mb-4 animate-bounce">
                    {door.emoji}
                  </div>
                  <CardTitle className="text-3xl font-bold text-white">
                    {door.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-white text-lg font-medium opacity-90">
                    {door.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Section recommandations rapides */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            💡 Recommandations pour toi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {skills.map((skill) => (
              <Link key={skill.id} href={`/student/skill/${skill.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer kid-card">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{skill.subject.icon || '📚'}</span>
                      <div>
                        <CardTitle className="text-xl">{skill.name}</CardTitle>
                        <CardDescription>{skill.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
