# CHECKLIST MVP - École Virtuelle CE2

## ✅ Phase 1 : Installation et configuration

### 1.1 PostgreSQL
- [ ] PostgreSQL est installé (télécharger depuis https://www.postgresql.org/download/ si besoin)
- [ ] Le service PostgreSQL est démarré
  ```powershell
  # Vérifier le service
  Get-Service -Name postgresql*
  
  # Si arrêté, démarrer le service
  Start-Service -Name postgresql-x64-XX
  ```
- [ ] La base de données est créée
  ```powershell
  psql -U postgres
  CREATE DATABASE ecole_virtuelle_ce2;
  \q
  ```

### 1.2 Dépendances Node.js
- [ ] Node.js 18+ installé (`node --version`)
- [ ] Dépendances installées
  ```powershell
  npm install --legacy-peer-deps
  ```

### 1.3 Variables d'environnement
- [ ] Fichier `.env` créé avec :
  ```
  DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/ecole_virtuelle_ce2?schema=public"
  NEXTAUTH_SECRET="votre-secret-min-32-caracteres"
  NEXTAUTH_URL="http://localhost:3000"
  ```

## ✅ Phase 2 : Base de données

### 2.1 Migration
- [ ] Génération du client Prisma réussie
  ```powershell
  npx prisma generate
  ```
- [ ] Migration appliquée sans erreur
  ```powershell
  npx prisma migrate dev --name init
  ```
- [ ] Tables créées (vérifier avec Prisma Studio)
  ```powershell
  npx prisma studio
  ```

### 2.2 Seed (données de démo)
- [ ] Seed exécuté avec succès
  ```powershell
  npx prisma db seed
  ```
- [ ] 4 utilisateurs créés (admin, prof, parent, eleve)
- [ ] 2 compétences créées (Multiplications, Grammaire)
- [ ] 12 exercices créés (6 par compétence)

## ✅ Phase 3 : Serveur de développement

### 3.1 Démarrage
- [ ] Le serveur démarre sans erreur TypeScript
  ```powershell
  npm run dev
  ```
- [ ] Application accessible sur http://localhost:3000
- [ ] Aucune erreur dans la console du terminal

## ✅ Phase 4 : Authentification (Login)

### 4.1 Page de login
- [ ] Page `/login` accessible
- [ ] Formulaire email/password affiché
- [ ] Boutons démo (élève, parent, prof) présents

### 4.2 Connexion Élève
- [ ] Login avec `eleve@ecole.fr` / `password123` fonctionne
- [ ] Redirection vers `/student` après login
- [ ] Session utilisateur active (vérifier avec l'outil développeur)
- [ ] Nom de l'élève affiché dans l'interface

### 4.3 Connexion Parent
- [ ] Login avec `parent@ecole.fr` / `password123` fonctionne
- [ ] Redirection vers `/parent` après login
- [ ] Dashboard parent s'affiche correctement

## ✅ Phase 5 : Interface Élève

### 5.1 Page d'accueil élève (`/student`)
- [ ] 4 cartes d'entrée affichées (Matière, Objectif, Diagnostic, Recommandé)
- [ ] Section recommandations visible
- [ ] Navigation fluide

### 5.2 Page compétence (`/student/skill/[id]`)
- [ ] Clic sur une compétence depuis l'accueil fonctionne
- [ ] Leçon affichée avec sections
- [ ] Liste des 6 exercices progressifs visible
- [ ] Badges de difficulté corrects

### 5.3 Page exercice (`/student/exercise/[id]`)
- [ ] Clic sur un exercice charge la page
- [ ] Question affichée clairement
- [ ] Type d'exercice approprié (QCU, QCM, INPUT, etc.)
- [ ] Bouton "Valider ma réponse" présent

## ✅ Phase 6 : Moteur de progression

### 6.1 Réponse correcte
- [ ] Réponse correcte acceptée
- [ ] Feedback positif affiché (✓ Excellent!)
- [ ] Message encourageant visible
- [ ] Niveau de progression augmente (+5 ou +8 points)
- [ ] Barre de progression mise à jour
- [ ] Bouton "Continuer" disponible

### 6.2 Réponse incorrecte
- [ ] Réponse incorrecte détectée
- [ ] Feedback négatif affiché (✗ Pas tout à fait...)
- [ ] Message d'explication visible
- [ ] Niveau diminue légèrement (-2 points)
- [ ] Bouton "Continuer" disponible

### 6.3 Système d'erreurs consécutives

#### Test 1 : 2 erreurs consécutives
- [ ] Faire 2 exercices incorrects de suite
- [ ] Recommandation "REVIEW" générée
- [ ] Message d'avertissement affiché
- [ ] Exercices plus faciles proposés (difficulté -10)

#### Test 2 : 3 erreurs consécutives
- [ ] Faire 3 exercices incorrects de suite
- [ ] Recommandation "REMEDIATION" générée
- [ ] Message "⚠️ Vous avez besoin de revoir la leçon" affiché
- [ ] Flag `shouldReviewLesson = true`
- [ ] Redirection vers la leçon après clic sur "Revoir la leçon"
- [ ] Exercices très faciles proposés (difficulté -20)

### 6.4 Excellence (optionnel pour MVP)
- [ ] Atteindre 95+ de niveau
- [ ] Recommandation "CHALLENGE" générée
- [ ] Exercices CM1 proposés (non bloquant)

## ✅ Phase 7 : Interface Parent

### 7.1 Dashboard parent (`/parent`)
- [ ] Login avec `parent@ecole.fr` fonctionne
- [ ] 3 métriques globales affichées :
  - [ ] Nombre total de compétences
  - [ ] Compétences maîtrisées
  - [ ] Niveau moyen
- [ ] Section "Progression par matière" avec Mathématiques et Français
- [ ] Section "Points forts et faiblesses"
- [ ] Section "Activité récente" avec liste des tentatives
- [ ] Section "Recommandations" dans la barre latérale

### 7.2 Suivi en temps réel
- [ ] Faire un exercice en tant qu'élève
- [ ] Rafraîchir le dashboard parent
- [ ] Nouvelle tentative visible dans "Activité récente"
- [ ] Statistiques mises à jour

## ✅ Phase 8 : Flux complet End-to-End

### Scénario 1 : Parcours réussi
1. [ ] Login élève
2. [ ] Aller sur compétence "Multiplications"
3. [ ] Lire la leçon
4. [ ] Faire exercice 1 (facile) - réponse correcte
5. [ ] Niveau augmente à ~8-10
6. [ ] Faire exercice 2 - réponse correcte
7. [ ] Niveau augmente à ~15-18
8. [ ] Progression visible dans la barre

### Scénario 2 : Parcours avec difficultés
1. [ ] Login élève
2. [ ] Aller sur compétence "Grammaire"
3. [ ] Faire exercice 1 - réponse incorrecte
4. [ ] Feedback "Pas tout à fait..." affiché
5. [ ] Faire exercice 2 - réponse incorrecte
6. [ ] Recommandation "REVIEW" visible
7. [ ] Message avertissement présent
8. [ ] Faire exercice 3 - réponse incorrecte
9. [ ] Recommandation "REMEDIATION" générée
10. [ ] Message "⚠️ Vous avez besoin de revoir la leçon"
11. [ ] Clic "Revoir la leçon"
12. [ ] Redirection vers page compétence
13. [ ] Leçon affichée en haut de page

### Scénario 3 : Suivi parent
1. [ ] Login parent dans un autre onglet
2. [ ] Dashboard parent s'affiche
3. [ ] Voir progression initiale de l'enfant
4. [ ] Dans l'onglet élève, faire 2-3 exercices
5. [ ] Rafraîchir dashboard parent
6. [ ] Nouvelles tentatives visibles dans "Activité récente"
7. [ ] Métriques mises à jour (niveau moyen, etc.)

## ✅ Phase 9 : Vérifications techniques

### 9.1 Sécurité
- [ ] Pas de mots de passe en clair dans le code
- [ ] Sessions JWT avec secret sécurisé
- [ ] Variables sensibles dans `.env` (pas commité)

### 9.2 Performance
- [ ] Page de login charge en < 2s
- [ ] Navigation entre pages fluide
- [ ] Pas de lag lors de la soumission d'exercice
- [ ] API `/api/attempts` répond en < 500ms

### 9.3 Qualité du code
- [ ] Pas d'erreurs TypeScript (`npx tsc --noEmit`)
- [ ] Pas d'erreurs ESLint (`npm run lint`)
- [ ] Console du navigateur propre (pas d'erreurs rouges)

### 9.4 Base de données
- [ ] Toutes les relations fonctionnent
- [ ] Contraintes d'intégrité respectées
- [ ] Pas de doublons dans les données seed
- [ ] Prisma Studio affiche toutes les tables correctement

## 🎯 Résumé : MVP validé si tous les ✅ sont cochés

### Critères de validation minimale (pour release MVP)
1. ✅ Authentification fonctionne (élève + parent)
2. ✅ Navigation complète (accueil → compétence → exercice)
3. ✅ Soumission d'exercice avec feedback
4. ✅ Progression mise à jour après chaque tentative
5. ✅ Système d'erreurs consécutives (2 et 3 erreurs)
6. ✅ Remédiation force retour à la leçon
7. ✅ Dashboard parent affiche progression enfant
8. ✅ Aucune erreur technique bloquante

## 📝 Notes et observations

```
[Notez ici les éventuels bugs ou améliorations à prévoir]

- 
- 
- 
```

## 🚀 Prochaines étapes après validation

1. [ ] Tests utilisateurs avec vrais élèves CE2
2. [ ] Ajout de nouvelles compétences (10+ par matière)
3. [ ] Système de gamification (badges, points)
4. [ ] Notifications pour les parents
5. [ ] Dashboard professeur
6. [ ] Export PDF des rapports
7. [ ] Intégration Stripe pour abonnements
