/**
 * Utilitaires génériques
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge les classes Tailwind intelligemment
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formater une date en français
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Calculer le pourcentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Générer une couleur selon le niveau de progression
 */
export function getProgressColor(level: number): string {
  if (level < 25) return 'text-red-500';
  if (level < 50) return 'text-orange-500';
  if (level < 75) return 'text-yellow-500';
  if (level < 90) return 'text-blue-500';
  return 'text-green-500';
}
