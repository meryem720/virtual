/**
 * Carte de recommandation personnalisée
 * Affiche une recommandation avec action
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecommendationType } from '@prisma/client';

interface RecommendationCardProps {
  id?: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: number;
  actionUrl?: string | null;
  onAction?: () => void;
}

export function RecommendationCard({
  type,
  title,
  description,
  priority,
  actionUrl,
  onAction,
}: RecommendationCardProps) {
  // Icône et style selon le type
  const getTypeConfig = () => {
    switch (type) {
      case 'REMEDIATION':
        return {
          icon: '🆘',
          color: 'border-red-500 bg-red-50',
          badgeColor: 'bg-red-500',
          buttonText: 'Commencer la remédiation',
        };
      case 'REVIEW':
        return {
          icon: '📖',
          color: 'border-orange-500 bg-orange-50',
          badgeColor: 'bg-orange-500',
          buttonText: 'Revoir la leçon',
        };
      case 'PRACTICE':
        return {
          icon: '🎯',
          color: 'border-blue-500 bg-blue-50',
          badgeColor: 'bg-blue-500',
          buttonText: 'Continuer à pratiquer',
        };
      case 'ADVANCE':
        return {
          icon: '🏆',
          color: 'border-green-500 bg-green-50',
          badgeColor: 'bg-green-500',
          buttonText: 'Découvrir la suite',
        };
      case 'CHALLENGE':
        return {
          icon: '🌟',
          color: 'border-purple-500 bg-purple-50',
          badgeColor: 'bg-purple-500',
          buttonText: 'Relever le défi',
        };
      default:
        return {
          icon: '💡',
          color: 'border-gray-500 bg-gray-50',
          badgeColor: 'bg-gray-500',
          buttonText: 'Voir',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Card className={`${config.color} border-2 kid-card`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{config.icon}</span>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {description}
              </CardDescription>
            </div>
          </div>
          {priority >= 85 && (
            <Badge className={config.badgeColor}>
              Priorité !
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full kid-button"
          onClick={() => {
            if (onAction) onAction();
            else if (actionUrl) window.location.href = actionUrl;
          }}
        >
          {config.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
