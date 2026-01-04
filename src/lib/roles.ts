/**
 * Types TypeScript pour les rôles et permissions
 */

import { RoleType } from '@prisma/client';

export type UserWithRoles = {
  id: string;
  email: string;
  name: string | null;
  roles: { role: RoleType }[];
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(user: UserWithRoles, role: RoleType): boolean {
  return user.roles.some((r) => r.role === role);
}

/**
 * Vérifie si l'utilisateur a au moins un des rôles
 */
export function hasAnyRole(user: UserWithRoles, roles: RoleType[]): boolean {
  return user.roles.some((r) => roles.includes(r.role));
}

/**
 * Vérifie si l'utilisateur est élève
 */
export function isStudent(user: UserWithRoles): boolean {
  return hasRole(user, RoleType.ELEVE);
}

/**
 * Vérifie si l'utilisateur est parent
 */
export function isParent(user: UserWithRoles): boolean {
  return hasRole(user, RoleType.PARENT);
}

/**
 * Vérifie si l'utilisateur est professeur
 */
export function isTeacher(user: UserWithRoles): boolean {
  return hasRole(user, RoleType.PROFESSEUR);
}

/**
 * Vérifie si l'utilisateur est admin ou directeur
 */
export function isAdminOrDirector(user: UserWithRoles): boolean {
  return hasAnyRole(user, [RoleType.ADMIN, RoleType.DIRECTEUR]);
}
