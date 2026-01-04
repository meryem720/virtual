# 🎓 ÉCOLE VIRTUELLE CE2

Plateforme éducative personnalisée pour élèves de CE2 avec suivi par compétences et moteur d'adaptation.

## 📋 Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: NextAuth.js
- **Paiements**: Stripe
- **Styling**: Tailwind CSS + Radix UI

## 🗂️ Structure du Projet

```
virtuel/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données complet
│   └── seed.ts                # Script de peuplement
├── public/                    # Fichiers statiques
├── src/
│   ├── app/                   # App Router Next.js
│   │   ├── api/              # Routes API
│   │   ├── eleve/            # Interface élève
│   │   ├── parent/           # Interface parent
│   │   ├── professeur/       # Interface professeur
│   │   ├── directeur/        # Interface directeur
│   │   ├── admin/            # Interface admin
│   │   ├── layout.tsx        # Layout racine
│   │   ├── page.tsx          # Page d'accueil
│   │   └── globals.css       # Styles globaux
│   ├── components/            # Composants React
│   │   ├── ui/               # Composants UI réutilisables
│   │   ├── student/          # Composants élève
│   │   ├── teacher/          # Composants professeur
│   │   └── parent/           # Composants parent
│   ├── lib/                   # Utilitaires
│   │   ├── prisma.ts         # Client Prisma
│   │   ├── roles.ts          # Gestion des rôles
│   │   ├── utils.ts          # Utilitaires génériques
│   │   └── adaptation-engine.ts  # Moteur adaptatif
│   └── types/                 # Types TypeScript
│       └── index.ts          # Types globaux
├── .env.example              # Variables d'environnement
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Étapes

1. **Cloner et installer les dépendances**

```bash
npm install
```

2. **Configurer les variables d'environnement**

```bash
cp .env.example .env
```

Éditer `.env` avec vos valeurs :
- `DATABASE_URL`: Connexion PostgreSQL
- `NEXTAUTH_SECRET`: Générer avec `openssl rand -base64 32`
- Clés Stripe (optionnel pour le MVP)

3. **Initialiser la base de données**

```bash
# Créer les tables
npm run db:push

# Générer le client Prisma
npm run db:generate

# Peupler avec des données de test
npm run db:seed
```

4. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📊 Modèles de Données

### Utilisateurs & Rôles
- **User**: Utilisateur base (NextAuth compatible)
- **UserRole**: Association utilisateur-rôle (many-to-many)
- **StudentProfile**: Profil élève avec paramètres adaptatifs
- **TeacherProfile**: Profil enseignant
- **ParentProfile**: Profil parent
- **ParentChildLink**: Lien parent-enfant

### Structure Pédagogique
- **ClassGroup**: Classes (ex: CE2-A)
- **Enrollment**: Inscription élève dans classe
- **Subject**: Matières (Maths, Français, etc.)
- **Skill**: Compétences à acquérir (granularité fine)

### Contenu
- **Lesson**: Leçons théoriques
- **Exercise**: Exercices interactifs (QCM, glisser-déposer, etc.)

### Suivi & Progression
- **Attempt**: Tentatives d'exercice (capture erreurs et temps)
- **Progress**: Progression par compétence (niveau 0-100)
- **Evaluation**: Évaluations formelles par professeur
- **Recommendation**: Recommandations personnalisées

### Abonnements
- **Subscription**: Abonnements famille (Stripe)

## 🎯 Rôles Utilisateurs

### ELEVE
- Accès aux leçons et exercices
- Suivi de progression personnalisé
- Recommandations adaptées

### PARENT
- Visualisation progression enfants
- Accès aux rapports
- Notifications

### PROFESSEUR
- Gestion de classes
- Création de contenu (leçons, exercices)
- Évaluations élèves

### DIRECTEUR
- Vue d'ensemble établissement
- Statistiques globales
- Gestion des professeurs

### ADMIN
- Administration système complète
- Gestion des utilisateurs
- Configuration plateforme

## 🧠 Moteur d'Adaptation

Le système ajuste automatiquement la difficulté basé sur :
- **Taux de réussite** des tentatives
- **Nombre d'erreurs** commises
- **Temps passé** sur exercices
- **Score moyen** obtenu

Paramètres personnalisables par élève :
- `difficultyLevel` (0-100)
- `adaptationSpeed` (0.5 = lent, 2.0 = rapide)
- `needsAccessibility` (besoins spécifiques)

## 🔐 Authentification

NextAuth.js configuré pour :
- Email/Mot de passe
- OAuth (Google, etc.) - à configurer
- Protection des routes par rôle
- Sessions sécurisées

## 💳 Abonnements (Stripe)

Statuts gérés :
- TRIAL (période d'essai)
- ACTIVE (abonnement actif)
- PAST_DUE (paiement en retard)
- CANCELED (annulé)
- EXPIRED (expiré)

## 📱 Interface Enfant-Friendly

CSS adapté CE2 (8-9 ans) :
- Boutons larges (`kid-button`)
- Cartes arrondies (`kid-card`)
- Couleurs vives
- Animations encourageantes
- Textes grande taille

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Mode développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter ESLint

npm run db:generate  # Générer client Prisma
npm run db:push      # Pousser le schéma (dev)
npm run db:migrate   # Créer migration
npm run db:studio    # Interface Prisma Studio
npm run db:seed      # Peupler données test
```

## 📈 Prochaines Étapes

1. Implémenter NextAuth complet
2. Créer les interfaces par rôle
3. Développer composants exercices interactifs
4. Intégrer Stripe webhooks
5. Ajouter système de notifications
6. Tests unitaires et E2E
7. Déploiement (Vercel recommandé)

## 📝 Comptes de Test (après seed)

- **Admin**: admin@ecole.fr / password123
- **Professeur**: prof@ecole.fr / password123
- **Parent**: parent@ecole.fr / password123
- **Élève**: eleve@ecole.fr / password123

## 📄 Licence

Propriétaire - École Virtuelle CE2

---

**Développé avec ❤️ pour les élèves de CE2**
