# École Virtuelle CE2 - MVP Setup Guide

## Prérequis
- Node.js 18+ installé
- PostgreSQL installé et démarré
- Terminal (PowerShell sur Windows)

## Installation

### 1. Configuration de la base de données

Créez une base de données PostgreSQL :
```powershell
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE ecole_virtuelle_ce2;

# Quitter psql
\q
```

### 2. Configuration de l'environnement

Copiez `.env.example` vers `.env` et ajustez les valeurs :
```powershell
cp .env.example .env
```

Modifiez le fichier `.env` avec vos paramètres :
```
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/ecole_virtuelle_ce2?schema=public"
NEXTAUTH_SECRET="generer-avec-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Installation des dépendances

```powershell
npm install --legacy-peer-deps
```

### 4. Migration et seed de la base de données

```powershell
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma migrate dev --name init

# Peupler avec les données de démo
npx prisma db seed
```

### 5. Démarrage du serveur de développement

```powershell
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Comptes de démonstration

Après le seed, vous pouvez vous connecter avec :

### Élève
- Email: `eleve@ecole.fr`
- Mot de passe: `password123`

### Parent
- Email: `parent@ecole.fr`
- Mot de passe: `password123`

### Professeur
- Email: `prof@ecole.fr`
- Mot de passe: `password123`

### Admin
- Email: `admin@ecole.fr`
- Mot de passe: `password123`

## Structure du MVP

### Fonctionnalités Élève
1. **Page d'accueil** (`/student`) - 4 portes d'entrée
   - Par matière
   - Par objectif
   - Diagnostic
   - Parcours recommandé

2. **Page compétence** (`/student/skill/[id]`) - Leçon + exercices
   - Leçon interactive avec sections
   - Liste d'exercices progressifs

3. **Page exercice** (`/student/exercise/[id]`) - Interaction
   - Question avec différents types (QCM, QCU, INPUT, etc.)
   - Feedback immédiat (correct/incorrect)
   - Mise à jour de la progression
   - Recommandations adaptées

### Fonctionnalités Parent
1. **Tableau de bord** (`/parent`) - Suivi enfant
   - Métriques globales (compétences, niveau moyen)
   - Progression par matière
   - Forces et faiblesses
   - Activité récente
   - Recommandations

## Moteur de progression pédagogique

Le système adapte automatiquement la difficulté selon les performances :

### Règles de progression
- **Score ≥ 90%** : +8 points de niveau
- **Score ≥ 75%** : +5 points
- **Score ≥ 60%** : +3 points
- **Score ≥ 50%** : +1 point
- **Score < 50%** : -2 points

### Interventions automatiques
- **2 erreurs consécutives** : Avertissement + exercices plus faciles
- **3 erreurs consécutives** : Remédiation obligatoire + retour à la leçon
- **Niveau > 95** : Proposition d'exercices de niveau supérieur (CM1)

### Types de recommandations
1. **REMEDIATION** - Après 3+ erreurs
2. **REVIEW** - Après 2 erreurs
3. **PRACTICE** - Entraînement normal
4. **ADVANCE** - Progrès rapide
5. **CHALLENGE** - Excellence (>95%)

## Données de démonstration

Le seed crée 2 compétences pilotes :

### 1. Mathématiques - Tables de multiplication (2, 3, 4)
- 1 leçon avec explications
- 6 exercices progressifs (difficulté 25 → 65)

### 2. Français - Identification sujet/verbe
- 1 leçon avec règles grammaticales
- 6 exercices progressifs (difficulté 25 → 70)

## Commandes utiles

```powershell
# Démarrer le serveur
npm run dev

# Construire pour production
npm run build

# Démarrer en production
npm start

# Réinitialiser la base de données
npx prisma migrate reset

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Vérifier TypeScript
npx tsc --noEmit

# Linter
npm run lint
```

## Checklist de vérification

- [ ] `npm run dev` démarre sans erreur
- [ ] Page de login accessible sur `/login`
- [ ] Connexion avec `eleve@ecole.fr` fonctionne
- [ ] Redirection vers `/student` après login élève
- [ ] Navigation vers une compétence affiche la leçon et les exercices
- [ ] Clic sur un exercice charge la page interactive
- [ ] Réponse correcte augmente la progression
- [ ] Réponse incorrecte affiche le feedback
- [ ] 3 erreurs consécutives déclenchent la remédiation
- [ ] Connexion avec `parent@ecole.fr` fonctionne
- [ ] Dashboard parent affiche la progression de l'enfant

## Prochaines étapes

### MVP Phase 2
- [ ] Système de notifications
- [ ] Tableau de bord professeur
- [ ] Gestion de classe
- [ ] Statistiques avancées
- [ ] Gamification (badges, points, classement)
- [ ] Export PDF des rapports de progression
- [ ] Intégration Stripe pour abonnements

### Améliorations techniques
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD avec GitHub Actions
- [ ] Déploiement sur Vercel/Railway
- [ ] Monitoring avec Sentry
- [ ] Analytics avec Plausible/Google Analytics

## Support

Pour toute question ou problème :
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les variables d'environnement dans `.env`
3. Consultez les logs dans le terminal
4. Utilisez `npx prisma studio` pour inspecter la base de données
