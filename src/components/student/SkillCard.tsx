/**
 * Carte de compétence avec progression
 * Affiche une compétence et son niveau de maîtrise
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillCardProps {
  skillId: string;
  skillName: string;
  subjectName: string;
  subjectIcon: string;
  level: number;
  isMastered: boolean;
  totalAttempts: number;
  averageScore: number;
  onClick?: () => void;
}

export function SkillCard({
  skillId,
  skillName,
  subjectName,
  subjectIcon,
  level,
  isMastered,
  totalAttempts,
  averageScore,
  onClick,
}: SkillCardProps) {
  // Couleur selon le niveau
  const getProgressColor = () => {
    if (level >= 90) return 'bg-green-500';
    if (level >= 75) return 'bg-blue-500';
    if (level >= 50) return 'bg-yellow-500';
    if (level >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:scale-105',
        isMastered && 'border-green-500 border-2'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{subjectIcon}</span>
            <div>
              <CardTitle className="text-lg">{skillName}</CardTitle>
              <p className="text-sm text-muted-foreground">{subjectName}</p>
            </div>
          </div>
          {isMastered && (
            <Badge className="bg-green-500">
              🏆 Maîtrisé
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Barre de progression */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Progression</span>
              <span className="font-bold">{level}%</span>
            </div>
            <Progress value={level} className={cn('h-3', getProgressColor())} />
          </div>

          {/* Statistiques */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalAttempts} exercice{totalAttempts > 1 ? 's' : ''}</span>
            <span>Moyenne : {averageScore}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
