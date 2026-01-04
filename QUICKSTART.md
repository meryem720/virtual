# 🎯 Guide de Démarrage Rapide - MVP École Virtuelle CE2

## 📋 Prérequis absolus

1. **PostgreSQL** installé et démarré
   - Télécharger: https://www.postgresql.org/download/windows/
   - **IMPORTANT**: Noter le mot de passe que vous définissez pendant l'installation

2. **Node.js 18+** installé
   - Télécharger: https://nodejs.org/
   - Vérifier: `node --version` (doit afficher v18.x.x ou supérieur)

## 🚀 Installation en 5 étapes

### Étape 1: Créer la base de données

Ouvrir PowerShell/Terminal et exécuter:

```powershell
# Se connecter à PostgreSQL
psql -U postgres

# Entrer votre mot de passe PostgreSQL

# Créer la base de données
CREATE DATABASE ecole_virtuelle_ce2;

# Quitter
\q
```

### Étape 2: Configuration des variables d'environnement

Le fichier `.env` est déjà créé. **VOUS DEVEZ** modifier la ligne DATABASE_URL:

```
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE_ICI@localhost:5432/ecole_virtuelle_ce2?schema=public"
```

Remplacez `VOTRE_MOT_DE_PASSE_ICI` par le mot de passe PostgreSQL que vous avez défini.

### Étape 3: Installer les dépendances

```powershell
cd c:\Users\m.bakrim\virtuel
npm install --legacy-peer-deps
```

Cela prendra 1-2 minutes.

### Étape 4: Créer les tables et peupler la base

```powershell
# Générer le client Prisma
npx prisma generate

# Créer toutes les tables
npx prisma migrate dev --name init

# Peupler avec les données de démo
npx prisma db seed
```

### Étape 5: Démarrer l'application

```powershell
npm run dev
```

L'application sera accessible sur: **http://localhost:3000/login**

## 👥 Comptes de test

### Élève
- **Email**: `eleve@ecole.fr`
- **Mot de passe**: `password123`
- **Accès**: Interface élève avec exercices interactifs

### Parent
- **Email**: `parent@ecole.fr`
- **Mot de passe**: `password123`
- **Accès**: Dashboard de suivi de progression

### Professeur
- **Email**: `prof@ecole.fr`
- **Mot de passe**: `password123`
- **Accès**: (Interface à développer en Phase 2)

### Admin
- **Email**: `admin@ecole.fr`
- **Mot de passe**: `password123`
- **Accès**: (Interface à développer en Phase 2)

## 🎮 Tester le MVP

### Test 1: Parcours Élève

1. Aller sur http://localhost:3000/login
2. Cliquer sur le bouton "Compte Élève" (ou entrer `eleve@ecole.fr` / `password123`)
3. Vous serez redirigé vers `/student` avec 4 portes d'entrée
4. Cliquer sur une compétence (ex: "Tables de multiplication")
5. Lire la leçon
6. Cliquer sur un exercice
7. Répondre à la question
8. Voir le feedback et la progression

### Test 2: Système d'erreurs

1. En tant qu'élève, faire volontairement 3 exercices **incorrects** de suite
2. Observer:
   - ✅ Après 2 erreurs: Recommandation "REVIEW" + avertissement
   - ✅ Après 3 erreurs: Recommandation "REMEDIATION" + message "⚠️ Vous avez besoin de revoir la leçon"
   - ✅ Redirection vers la leçon

### Test 3: Dashboard Parent

1. Ouvrir un nouvel onglet sur http://localhost:3000/login
2. Cliquer sur "Compte Parent" (ou entrer `parent@ecole.fr` / `password123`)
3. Voir le dashboard avec:
   - Statistiques globales
   - Progression par matière
   - Forces et faiblesses
   - Activité récente
4. Dans l'onglet élève, faire quelques exercices
5. Rafraîchir le dashboard parent → Voir les mises à jour

## 📊 Données de démonstration

### 2 Compétences pilotes

#### 1. Mathématiques - Tables de multiplication (2, 3, 4)
- **Leçon**: Explications sur les tables avec exemples
- **6 Exercices** progressifs:
  - Exercice 1: Difficulté 25 (Table de 2)
  - Exercice 2: Difficulté 30 (Table de 2)
  - Exercice 3: Difficulté 35 (Table de 3)
  - Exercice 4: Difficulté 45 (Table de 3)
  - Exercice 5: Difficulté 55 (Table de 4)
  - Exercice 6: Difficulté 65 (Mélange tables 2,3,4)

#### 2. Français - Identifier sujet et verbe
- **Leçon**: Règles de grammaire avec exemples
- **6 Exercices** progressifs:
  - Exercice 1: Difficulté 25 (Phrases simples)
  - Exercice 2: Difficulté 30 (Phrases simples)
  - Exercice 3: Difficulté 40 (Verbes d'action)
  - Exercice 4: Difficulté 50 (Phrases composées)
  - Exercice 5: Difficulté 60 (Phrases complexes)
  - Exercice 6: Difficulté 70 (Phrases longues)

## 🧠 Moteur de progression automatique

### Règles de progression
- **Score ≥ 90%**: +8 points de niveau → "Excellent! Tu maîtrises parfaitement"
- **Score ≥ 75%**: +5 points → "Très bien! Continue comme ça"
- **Score ≥ 60%**: +3 points → "Bien! Encore un petit effort"
- **Score ≥ 50%**: +1 point → "Pas mal, tu progresses"
- **Score < 50%**: -2 points → "Revois la leçon et réessaie"

### Interventions automatiques
- **2 erreurs consécutives**:
  - Type: `REVIEW` (Révision)
  - Action: Avertissement
  - Adaptation: Exercices -10 de difficulté
  
- **3 erreurs consécutives**:
  - Type: `REMEDIATION` (Remédiation obligatoire)
  - Action: Redirection vers la leçon
  - Adaptation: Exercices -20 de difficulté
  - Message: "⚠️ Vous avez besoin de revoir la leçon"

- **Niveau > 95**:
  - Type: `CHALLENGE` (Défi)
  - Action: Proposition d'exercices CM1 (non bloquant)
  - Message: "🎉 Excellent! Tu es prêt pour un défi niveau CM1"

## 🛠️ Commandes utiles

```powershell
# Démarrer le serveur
npm run dev

# Visualiser la base de données (interface graphique)
npx prisma studio

# Réinitialiser complètement la base de données
npx prisma migrate reset

# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Linter
npm run lint

# Build production
npm run build
```

## ❌ Résolution de problèmes courants

### Erreur: "Can't reach database server"
**Solution**: PostgreSQL n'est pas démarré
```powershell
# Vérifier le service
Get-Service -Name postgresql*

# Démarrer le service (remplacer XX par votre version, ex: 16)
Start-Service -Name postgresql-x64-XX
```

### Erreur: "P1001: Can't reach database server"
**Solution**: Mot de passe incorrect dans le `.env`
- Vérifier le `DATABASE_URL` dans `.env`
- S'assurer que le mot de passe est correct

### Erreur: "Module '@prisma/client' has no exported member"
**Solution**: Client Prisma pas généré
```powershell
npx prisma generate
```

### Erreur: "npm install" échoue avec ERESOLVE
**Solution**: Utiliser `--legacy-peer-deps`
```powershell
npm install --legacy-peer-deps
```

### Page blanche après login
**Solution**: 
1. Vérifier la console du navigateur (F12)
2. Vérifier que le seed a bien fonctionné: `npx prisma studio`
3. Relancer: `npx prisma db seed`

### Exercices ne s'affichent pas
**Solution**: Vérifier les données
```powershell
# Ouvrir Prisma Studio
npx prisma studio

# Vérifier les tables:
# - User (4 utilisateurs)
# - StudentProfile (1 élève: Emma Dupont)
# - Skill (2 compétences)
# - Exercise (12 exercices)
```

## 📁 Structure du projet

```
c:\Users\m.bakrim\virtuel\
├── prisma/
│   ├── schema.prisma         # Modèle de données (15 tables)
│   └── seed.ts               # Données de démonstration
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # NextAuth configuration
│   │   │   ├── attempts/     # POST: Soumission exercice
│   │   │   ├── progress/     # GET: Progression élève
│   │   │   ├── recommendations/ # GET: Recommandations
│   │   │   └── exercises/    # GET: Détail exercice
│   │   ├── student/
│   │   │   ├── page.tsx      # Accueil élève (4 portes)
│   │   │   ├── skill/[id]/   # Détail compétence
│   │   │   └── exercise/[id]/ # Page exercice interactive
│   │   ├── parent/
│   │   │   └── page.tsx      # Dashboard parent
│   │   └── login/
│   │       └── page.tsx      # Page de connexion
│   ├── components/
│   │   ├── ui/               # Composants de base
│   │   └── student/          # Composants spécifiques élève
│   └── lib/
│       ├── prisma.ts         # Client Prisma
│       ├── progressEngine.ts # Moteur pédagogique
│       └── roles.ts          # Gestion des rôles
├── .env                      # Variables d'environnement (À CONFIGURER)
├── package.json              # Dépendances
├── SETUP.md                  # Guide d'installation complet
├── CHECKLIST.md              # Checklist de validation MVP
└── README.md                 # Documentation principale
```

## ✅ Checklist MVP validé

- [x] Base de données PostgreSQL configurée
- [x] Migrations appliquées (15 tables créées)
- [x] Seed exécuté (4 users, 2 skills, 12 exercises)
- [x] Authentification NextAuth fonctionnelle
- [x] Login élève redirige vers `/student`
- [x] Login parent redirige vers `/parent`
- [x] Page compétence affiche leçon + exercices
- [x] Page exercice interactive avec types QCM/QCU/INPUT
- [x] Feedback immédiat (correct/incorrect)
- [x] Progression mise à jour après chaque tentative
- [x] Système 2 erreurs → Avertissement
- [x] Système 3 erreurs → Remédiation + retour leçon
- [x] Dashboard parent affiche progression enfant
- [x] API `/api/attempts` fonctionne
- [x] API `/api/progress/[studentId]` fonctionne
- [x] API `/api/recommendations/[studentId]` fonctionne

## 🎯 Prochaines étapes (Phase 2)

1. **Dashboard Professeur**
   - Vue d'ensemble de la classe
   - Statistiques par élève
   - Identification des difficultés

2. **Gamification**
   - Système de points et badges
   - Classement de la classe
   - Récompenses virtuelles

3. **Notifications**
   - Email aux parents (résumé hebdomadaire)
   - Alertes en cas de difficulté
   - Rappels d'exercices

4. **Contenu enrichi**
   - 10+ compétences par matière
   - Vidéos explicatives
   - Exercices interactifs variés

5. **Rapports PDF**
   - Export progression pour parents
   - Bulletins personnalisés

6. **Abonnements Stripe**
   - Formule gratuite (limitée)
   - Formule premium (accès complet)

## 📞 Support

- Consultez [SETUP.md](./SETUP.md) pour le guide complet
- Consultez [CHECKLIST.md](./CHECKLIST.md) pour la validation détaillée
- Consultez [ARCHITECTURE.md](./ARCHITECTURE.md) pour la documentation technique

## 🚀 Démarrage immédiat (TL;DR)

```powershell
# 1. Créer DB (dans psql)
CREATE DATABASE ecole_virtuelle_ce2;

# 2. Modifier .env avec votre mot de passe PostgreSQL

# 3. Setup
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start
npm run dev

# 5. Ouvrir http://localhost:3000/login
# 6. Tester avec eleve@ecole.fr / password123
```

**Félicitations! Votre MVP École Virtuelle CE2 est prêt! 🎉**
