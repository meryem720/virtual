/**
 * ============================================================
 * SEED SCRIPT - ÉCOLE VIRTUELLE CE2
 * ============================================================
 * Initialise la base avec des données pédagogiques réalistes
 * pour les compétences pilotes du CE2
 * 
 * Usage: npm run db:seed
 * ============================================================
 */

import { PrismaClient, RoleType, ExerciseType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding - École Virtuelle CE2\n');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================================
  // 1. CRÉER LES UTILISATEURS
  // ============================================================
  console.log('👤 Création des utilisateurs...');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ecole.fr',
      name: 'Admin Système',
      password: hashedPassword,
      roles: { create: { role: RoleType.ADMIN } },
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'prof@ecole.fr',
      name: 'Mme Dubois',
      password: hashedPassword,
      roles: { create: { role: RoleType.PROFESSEUR } },
      teacherProfile: {
        create: {
          firstName: 'Sophie',
          lastName: 'Dubois',
          specialties: ['Mathématiques', 'Français'],
        },
      },
    },
  });

  const parent = await prisma.user.create({
    data: {
      email: 'parent@ecole.fr',
      name: 'M. Martin',
      password: hashedPassword,
      roles: { create: { role: RoleType.PARENT } },
      parentProfile: {
        create: {
          firstName: 'Jean',
          lastName: 'Martin',
          phone: '0612345678',
        },
      },
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'eleve@ecole.fr',
      name: 'Emma Martin',
      password: hashedPassword,
      roles: { create: { role: RoleType.ELEVE } },
      studentProfile: {
        create: {
          firstName: 'Emma',
          lastName: 'Martin',
          birthDate: new Date('2016-09-15'),
          difficultyLevel: 50,
          adaptationSpeed: 1.0,
          avatar: '👧',
        },
      },
    },
  });

  console.log('   ✅ 4 utilisateurs créés (admin, prof, parent, élève)\n');

  // ============================================================
  // 2. LIER PARENT-ENFANT
  // ============================================================

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: parent.id },
  });
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: student.id },
  });

  if (!parentProfile || !studentProfile) {
    throw new Error('Profils non trouvés');
  }

  await prisma.parentChildLink.create({
    data: {
      parentId: parentProfile.id,
      childId: studentProfile.id,
      relationship: 'Père',
      canViewProgress: true,
      canReceiveNotifications: true,
    },
  });

  console.log('👨‍👧 Lien parent-enfant créé\n');

  // ============================================================
  // 3. CRÉER LA CLASSE
  // ============================================================

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: teacher.id },
  });

  if (!teacherProfile) {
    throw new Error('Profil enseignant non trouvé');
  }

  const classGroup = await prisma.classGroup.create({
    data: {
      name: 'CE2-A 2025-2026',
      description: 'Classe de CE2 - Groupe A',
      schoolYear: '2025-2026',
      teacherId: teacherProfile.id,
      isActive: true,
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: studentProfile.id,
      classId: classGroup.id,
      status: 'ACTIVE',
    },
  });

  console.log('🏫 Classe CE2-A créée avec 1 élève inscrit\n');

  // ============================================================
  // 4. CRÉER LES MATIÈRES
  // ============================================================
  console.log('📚 Création des matières...');

  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Mathématiques',
      description: 'Calcul, problèmes et géométrie pour le CE2',
      icon: '🔢',
      color: '#3B82F6',
      order: 1,
      createdById: teacherProfile.id,
    },
  });

  const frenchSubject = await prisma.subject.create({
    data: {
      name: 'Français',
      description: 'Grammaire, conjugaison et vocabulaire',
      icon: '📚',
      color: '#10B981',
      order: 2,
      createdById: teacherProfile.id,
    },
  });

  console.log('   ✅ Mathématiques et Français créées\n');

  // ============================================================
  // 5. COMPÉTENCE 1 : MULTIPLICATIONS (TABLES 2, 3, 4)
  // ============================================================
  console.log('🔢 Création compétence MULTIPLICATIONS...');

  const multiplicationSkill = await prisma.skill.create({
    data: {
      subjectId: mathSubject.id,
      name: 'Multiplications (tables de 2, 3, 4)',
      description: 'Maîtriser les tables de multiplication de 2, 3 et 4',
      difficultyLevel: 45,
      order: 1,
    },
  });

  // === LEÇON MULTIPLICATIONS ===
  const multiplicationLesson = await prisma.lesson.create({
    data: {
      subjectId: mathSubject.id,
      title: 'Les tables de multiplication de 2, 3 et 4',
      description: 'Apprends et révise tes tables de multiplication !',
      content: JSON.stringify({
        sections: [
          {
            type: 'introduction',
            content: '🎯 La multiplication, c\'est une addition rapide !\nAu lieu d\'écrire 2 + 2 + 2 + 2, on écrit 2 × 4 = 8',
          },
          {
            type: 'table',
            title: '📊 Table de 2',
            content: '2 × 1 = 2\n2 × 2 = 4\n2 × 3 = 6\n2 × 4 = 8\n2 × 5 = 10',
          },
          {
            type: 'table',
            title: '📊 Table de 3',
            content: '3 × 1 = 3\n3 × 2 = 6\n3 × 3 = 9\n3 × 4 = 12\n3 × 5 = 15',
          },
          {
            type: 'table',
            title: '📊 Table de 4',
            content: '4 × 1 = 4\n4 × 2 = 8\n4 × 3 = 12\n4 × 4 = 16\n4 × 5 = 20',
          },
          {
            type: 'tip',
            content: '💡 Astuce : Pour la table de 2, compte de 2 en 2 !\nPour la table de 4, c\'est le double de la table de 2 !',
          },
        ],
      }),
      thumbnailUrl: null,
      videoUrl: null,
      estimatedDuration: 15,
      order: 1,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // === EXERCICES MULTIPLICATIONS (6 exercices niveau 1-3) ===
  
  // Niveau 1 - Table de 2 facile
  const mathEx1 = await prisma.exercise.create({
    data: {
      lessonId: multiplicationLesson.id,
      skillId: multiplicationSkill.id,
      title: 'Table de 2 - Débutant',
      instructions: 'Choisis la bonne réponse pour chaque multiplication de la table de 2 🎯',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Combien font 2 × 3 ?',
            options: ['4', '6', '8', '10'],
            correctAnswer: 1,
            feedback: {
              correct: '🎉 Bravo ! 2 × 3 = 6, c\'est parfait !',
              incorrect: '🤔 Pas tout à fait... Compte de 2 en 2 : 2, 4, 6 !',
            },
          },
          {
            id: 'q2',
            question: 'Combien font 2 × 5 ?',
            options: ['8', '10', '12', '14'],
            correctAnswer: 1,
            feedback: {
              correct: '✨ Excellent ! 2 × 5 = 10 !',
              incorrect: '💭 Réfléchis : 2 + 2 + 2 + 2 + 2 = ?',
            },
          },
          {
            id: 'q3',
            question: 'Combien font 2 × 2 ?',
            options: ['2', '4', '6', '8'],
            correctAnswer: 1,
            feedback: {
              correct: '🌟 Super ! 2 × 2 = 4, tu as compris !',
              incorrect: '🔍 Essaie encore : 2 fois 2, c\'est comme 2 + 2',
            },
          },
        ],
      },
      difficultyLevel: 25,
      points: 10,
      minAttempts: 1,
      maxAttempts: 3,
      order: 1,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 1 - Table de 2 moyen
  const mathEx2 = await prisma.exercise.create({
    data: {
      lessonId: multiplicationLesson.id,
      skillId: multiplicationSkill.id,
      title: 'Table de 2 - Intermédiaire',
      instructions: 'Continue avec des multiplications un peu plus grandes 🚀',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Combien font 2 × 7 ?',
            options: ['12', '14', '16', '18'],
            correctAnswer: 1,
            feedback: {
              correct: '🎊 Génial ! 2 × 7 = 14, continue comme ça !',
              incorrect: '🎯 Réessaie : compte de 2 en 2 jusqu\'à 7 fois',
            },
          },
          {
            id: 'q2',
            question: 'Combien font 2 × 9 ?',
            options: ['16', '18', '20', '22'],
            correctAnswer: 1,
            feedback: {
              correct: '🏆 Bravo champion ! 2 × 9 = 18 !',
              incorrect: '💡 Indice : c\'est juste avant 20',
            },
          },
          {
            id: 'q3',
            question: 'Combien font 2 × 6 ?',
            options: ['10', '12', '14', '16'],
            correctAnswer: 1,
            feedback: {
              correct: '⭐ Parfait ! 2 × 6 = 12, tu progresses !',
              incorrect: '🤓 Pense à 6 + 6, c\'est pareil !',
            },
          },
        ],
      },
      difficultyLevel: 35,
      points: 15,
      minAttempts: 1,
      maxAttempts: 3,
      order: 2,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 2 - Table de 3 facile
  const mathEx3 = await prisma.exercise.create({
    data: {
      lessonId: multiplicationLesson.id,
      skillId: multiplicationSkill.id,
      title: 'Table de 3 - Découverte',
      instructions: 'Passons maintenant à la table de 3 ! Compte de 3 en 3 🎨',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Combien font 3 × 2 ?',
            options: ['3', '6', '9', '12'],
            correctAnswer: 1,
            feedback: {
              correct: '🌈 Super ! 3 × 2 = 6, bien joué !',
              incorrect: '🧮 Aide-toi : 3 + 3 = ?',
            },
          },
          {
            id: 'q2',
            question: 'Combien font 3 × 4 ?',
            options: ['9', '12', '15', '18'],
            correctAnswer: 1,
            feedback: {
              correct: '🎉 Bravo ! 3 × 4 = 12, tu es fort !',
              incorrect: '💭 Compte : 3, 6, 9, 12...',
            },
          },
          {
            id: 'q3',
            question: 'Combien font 3 × 3 ?',
            options: ['6', '9', '12', '15'],
            correctAnswer: 1,
            feedback: {
              correct: '✨ Excellent ! 3 × 3 = 9 !',
              incorrect: '🔢 3 fois 3, c\'est 3 + 3 + 3',
            },
          },
        ],
      },
      difficultyLevel: 40,
      points: 15,
      minAttempts: 1,
      maxAttempts: 3,
      order: 3,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 2 - Table de 3 moyen
  const mathEx4 = await prisma.exercise.create({
    data: {
      lessonId: multiplicationLesson.id,
      skillId: multiplicationSkill.id,
      title: 'Table de 3 - Entraînement',
      instructions: 'Continue avec les multiplications de 3 ! Tu y arrives très bien 💪',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Combien font 3 × 5 ?',
            options: ['12', '15', '18', '21'],
            correctAnswer: 1,
            feedback: {
              correct: '🎯 Parfait ! 3 × 5 = 15 !',
              incorrect: '🎨 Compte de 3 en 3 : 3, 6, 9, 12, 15',
            },
          },
          {
            id: 'q2',
            question: 'Combien font 3 × 7 ?',
            options: ['18', '21', '24', '27'],
            correctAnswer: 1,
            feedback: {
              correct: '🌟 Super ! 3 × 7 = 21, champion !',
              incorrect: '🤔 Continue à compter de 3 en 3...',
            },
          },
          {
            id: 'q3',
            question: 'Combien font 3 × 6 ?',
            options: ['15', '18', '21', '24'],
            correctAnswer: 1,
            feedback: {
              correct: '🏅 Bravo ! 3 × 6 = 18, excellent !',
              incorrect: '💡 C\'est entre 15 et 21...',
            },
          },
        ],
      },
      difficultyLevel: 50,
      points: 20,
      minAttempts: 1,
      maxAttempts: 3,
      order: 4,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 3 - Table de 4 facile
  const mathEx5 = await prisma.exercise.create({
    data: {
      lessonId: multiplicationLesson.id,
      skillId: multiplicationSkill.id,
      title: 'Table de 4 - Découverte',
      instructions: 'La table de 4 maintenant ! Astuce : c\'est le double de la table de 2 🎪',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Combien font 4 × 2 ?',
            options: ['6', '8', '10', '12'],
            correctAnswer: 1,
            feedback: {
              correct: '🎊 Génial ! 4 × 2 = 8, bien vu !',
              incorrect: '💭 Pense : 4 + 4 = ?',
            },
          },
          {
            id: 'q2',
            question: 'Combien font 4 × 3 ?',
            options: ['8', '12', '16', '20'],
            correctAnswer: 1,
            feedback: {
              correct: '✨ Bravo ! 4 × 3 = 12, tu es sur la bonne voie !',
              incorrect: '🧮 Compte : 4 + 4 + 4 = ?',
            },
          },
          {
            id: 'q3',
            question: 'Combien font 4 × 4 ?',
            options: ['12', '14', '16', '18'],
            correctAnswer: 2,
            feedback: {
              correct: '🏆 Parfait ! 4 × 4 = 16, super !',
              incorrect: '🔍 4 fois 4, c\'est comme 4 + 4 + 4 + 4',
            },
          },
        ],
      },
      difficultyLevel: 55,
      points: 20,
      minAttempts: 1,
      maxAttempts: 3,
      order: 5,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 3 - Mixte difficile
  const mathEx6 = await prisma.exercise.create({
    data: {
      lessonId: multiplicationLesson.id,
      skillId: multiplicationSkill.id,
      title: 'Tables mélangées - Challenge',
      instructions: 'Montre ce que tu sais ! Tables de 2, 3 et 4 mélangées 🌟',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Combien font 4 × 5 ?',
            options: ['16', '18', '20', '22'],
            correctAnswer: 2,
            feedback: {
              correct: '🎉 Extraordinaire ! 4 × 5 = 20 !',
              incorrect: '🎯 Compte de 4 en 4 : 4, 8, 12, 16, 20',
            },
          },
          {
            id: 'q2',
            question: 'Combien font 3 × 8 ?',
            options: ['21', '24', '27', '30'],
            correctAnswer: 1,
            feedback: {
              correct: '🌟 Incroyable ! 3 × 8 = 24, tu es un champion !',
              incorrect: '💪 Continue : 3, 6, 9, 12, 15, 18, 21, 24',
            },
          },
          {
            id: 'q3',
            question: 'Combien font 2 × 8 ?',
            options: ['14', '16', '18', '20'],
            correctAnswer: 1,
            feedback: {
              correct: '👏 Magnifique ! 2 × 8 = 16 !',
              incorrect: '🔢 Souviens-toi : 8 + 8 = ?',
            },
          },
          {
            id: 'q4',
            question: 'Combien font 4 × 7 ?',
            options: ['24', '26', '28', '30'],
            correctAnswer: 2,
            feedback: {
              correct: '🏆 Exceptionnel ! 4 × 7 = 28, bravo !',
              incorrect: '💡 C\'est 4 × 6 + 4...',
            },
          },
          {
            id: 'q5',
            question: 'Combien font 3 × 9 ?',
            options: ['24', '27', '30', '33'],
            correctAnswer: 1,
            feedback: {
              correct: '🎊 Fantastique ! 3 × 9 = 27, tu maîtrises !',
              incorrect: '🌈 Presque ! C\'est juste avant 30',
            },
          },
        ],
      },
      difficultyLevel: 65,
      points: 25,
      minAttempts: 1,
      maxAttempts: 3,
      order: 6,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  console.log('   ✅ 1 leçon + 6 exercices de multiplications créés\n');

  // ============================================================
  // 6. COMPÉTENCE 2 : SUJET ET VERBE (FRANÇAIS)
  // ============================================================
  console.log('📚 Création compétence SUJET ET VERBE...');

  const grammarSkill = await prisma.skill.create({
    data: {
      subjectId: frenchSubject.id,
      name: 'Identifier le sujet et le verbe',
      description: 'Reconnaître le sujet et le verbe dans une phrase simple',
      difficultyLevel: 40,
      order: 1,
    },
  });

  // === LEÇON SUJET ET VERBE ===
  const grammarLesson = await prisma.lesson.create({
    data: {
      subjectId: frenchSubject.id,
      title: 'Le sujet et le verbe dans la phrase',
      description: 'Apprends à reconnaître qui fait l\'action et quelle est l\'action',
      content: JSON.stringify({
        sections: [
          {
            type: 'introduction',
            content: '🎯 Dans chaque phrase, il y a un SUJET (qui fait l\'action) et un VERBE (l\'action).',
          },
          {
            type: 'example',
            title: '📝 Exemple 1',
            content: 'Le chat mange.\n👉 SUJET : Le chat (c\'est lui qui mange)\n👉 VERBE : mange (c\'est l\'action)',
          },
          {
            type: 'example',
            title: '📝 Exemple 2',
            content: 'Les enfants jouent dans le jardin.\n👉 SUJET : Les enfants\n👉 VERBE : jouent',
          },
          {
            type: 'method',
            title: '🔍 Comment trouver le verbe ?',
            content: 'Pose la question : "Qu\'est-ce qu\'on fait dans la phrase ?"\nOn peut aussi dire "ne...pas" autour du verbe.',
          },
          {
            type: 'method',
            title: '🔍 Comment trouver le sujet ?',
            content: 'Pose la question : "Qui est-ce qui ?" + le verbe\nExemple : Qui est-ce qui mange ? → Le chat',
          },
          {
            type: 'tip',
            content: '💡 Astuce : Le sujet est souvent avant le verbe !',
          },
        ],
      }),
      thumbnailUrl: null,
      videoUrl: null,
      estimatedDuration: 12,
      order: 1,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // === EXERCICES FRANÇAIS (6 exercices niveau 1-3) ===

  // Niveau 1 - Trouver le verbe facile
  const frEx1 = await prisma.exercise.create({
    data: {
      lessonId: grammarLesson.id,
      skillId: grammarSkill.id,
      title: 'Trouve le verbe - Facile',
      instructions: 'Dans chaque phrase, trouve le verbe (l\'action) 🎯',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Le chien court dans le jardin.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['chien', 'court', 'jardin', 'le'],
            correctAnswer: 1,
            feedback: {
              correct: '🎉 Bravo ! "court" est bien le verbe, c\'est l\'action !',
              incorrect: '🤔 Le verbe, c\'est l\'action ! Que fait le chien ?',
            },
          },
          {
            id: 'q2',
            question: 'Marie dessine un beau soleil.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['Marie', 'dessine', 'soleil', 'beau'],
            correctAnswer: 1,
            feedback: {
              correct: '✨ Parfait ! "dessine" est le verbe !',
              incorrect: '💭 Qu\'est-ce que Marie fait ?',
            },
          },
          {
            id: 'q3',
            question: 'Les oiseaux chantent.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['oiseaux', 'les', 'chantent', 'et'],
            correctAnswer: 2,
            feedback: {
              correct: '🌟 Super ! "chantent" est bien le verbe !',
              incorrect: '🎵 Que font les oiseaux ?',
            },
          },
        ],
      },
      difficultyLevel: 25,
      points: 10,
      minAttempts: 1,
      maxAttempts: 3,
      order: 1,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 1 - Trouver le sujet facile
  const frEx2 = await prisma.exercise.create({
    data: {
      lessonId: grammarLesson.id,
      skillId: grammarSkill.id,
      title: 'Trouve le sujet - Facile',
      instructions: 'Maintenant, trouve le sujet (qui fait l\'action) 🎨',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Le chat dort sur le canapé.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['Le chat', 'dort', 'le canapé', 'sur'],
            correctAnswer: 0,
            feedback: {
              correct: '🎊 Bravo ! "Le chat" est le sujet, c\'est lui qui dort !',
              incorrect: '🐱 Qui est-ce qui dort ?',
            },
          },
          {
            id: 'q2',
            question: 'Tom mange une pomme.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['mange', 'Tom', 'pomme', 'une'],
            correctAnswer: 1,
            feedback: {
              correct: '✨ Excellent ! "Tom" est bien le sujet !',
              incorrect: '🍎 Qui est-ce qui mange ?',
            },
          },
          {
            id: 'q3',
            question: 'Mes parents travaillent.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['Mes parents', 'Mes', 'travaillent', 'parents'],
            correctAnswer: 0,
            feedback: {
              correct: '🏆 Parfait ! "Mes parents" est le sujet complet !',
              incorrect: '👨‍👩‍👧 Qui est-ce qui travaille ?',
            },
          },
        ],
      },
      difficultyLevel: 30,
      points: 10,
      minAttempts: 1,
      maxAttempts: 3,
      order: 2,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 2 - Verbe et sujet moyen
  const frEx3 = await prisma.exercise.create({
    data: {
      lessonId: grammarLesson.id,
      skillId: grammarSkill.id,
      title: 'Sujet et verbe - Intermédiaire',
      instructions: 'Phrases un peu plus longues ! Tu peux le faire 💪',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'La petite fille joue avec son ballon rouge.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['fille', 'joue', 'ballon', 'petite'],
            correctAnswer: 1,
            feedback: {
              correct: '🎉 Bravo ! "joue" est le verbe !',
              incorrect: '⚽ Quelle est l\'action ?',
            },
          },
          {
            id: 'q2',
            question: 'Mon grand frère construit une cabane.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['Mon grand frère', 'construit', 'cabane', 'une'],
            correctAnswer: 0,
            feedback: {
              correct: '🌟 Parfait ! "Mon grand frère" est le sujet complet !',
              incorrect: '🏠 Qui construit ?',
            },
          },
          {
            id: 'q3',
            question: 'Les élèves de CE2 écrivent une histoire.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['élèves', 'CE2', 'écrivent', 'histoire'],
            correctAnswer: 2,
            feedback: {
              correct: '✨ Super ! "écrivent" est bien le verbe !',
              incorrect: '📝 Que font les élèves ?',
            },
          },
        ],
      },
      difficultyLevel: 40,
      points: 15,
      minAttempts: 1,
      maxAttempts: 3,
      order: 3,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 2 - Phrases avec plusieurs noms
  const frEx4 = await prisma.exercise.create({
    data: {
      lessonId: grammarLesson.id,
      skillId: grammarSkill.id,
      title: 'Attention aux pièges !',
      instructions: 'Il y a plusieurs noms, mais un seul sujet ! Trouve-le 🎯',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Le maître explique la leçon aux enfants.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['Le maître', 'la leçon', 'les enfants', 'explique'],
            correctAnswer: 0,
            feedback: {
              correct: '🎊 Bravo ! C\'est "Le maître" qui fait l\'action !',
              incorrect: '👨‍🏫 Qui est-ce qui explique ?',
            },
          },
          {
            id: 'q2',
            question: 'Sophie donne un cadeau à sa maman.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['Sophie', 'un cadeau', 'sa maman', 'donne'],
            correctAnswer: 0,
            feedback: {
              correct: '✨ Excellent ! "Sophie" est le sujet !',
              incorrect: '🎁 Qui fait l\'action de donner ?',
            },
          },
          {
            id: 'q3',
            question: 'Les fleurs du jardin sentent bon.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['fleurs', 'jardin', 'sentent', 'bon'],
            correctAnswer: 2,
            feedback: {
              correct: '🌸 Parfait ! "sentent" est le verbe !',
              incorrect: '🌺 Quelle est l\'action ?',
            },
          },
        ],
      },
      difficultyLevel: 50,
      points: 20,
      minAttempts: 1,
      maxAttempts: 3,
      order: 4,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 3 - Verbes à plusieurs mots
  const frEx5 = await prisma.exercise.create({
    data: {
      lessonId: grammarLesson.id,
      skillId: grammarSkill.id,
      title: 'Verbes composés',
      instructions: 'Attention ! Parfois le verbe est fait de 2 mots 🎪',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Paul a mangé son goûter.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['Paul', 'a mangé', 'mangé', 'goûter'],
            correctAnswer: 1,
            feedback: {
              correct: '🎉 Bravo ! "a mangé" est le verbe complet !',
              incorrect: '🍪 Le verbe est composé de 2 mots : a + mangé',
            },
          },
          {
            id: 'q2',
            question: 'Les enfants ont joué dans la cour.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['ont joué', 'joué', 'Les enfants', 'dans la cour'],
            correctAnswer: 0,
            feedback: {
              correct: '✨ Parfait ! "ont joué" est le verbe complet !',
              incorrect: '⚽ N\'oublie pas le petit mot "ont" devant !',
            },
          },
          {
            id: 'q3',
            question: 'Ma sœur est partie à l\'école.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['Ma sœur', 'est partie', 'l\'école', 'sœur'],
            correctAnswer: 0,
            feedback: {
              correct: '🌟 Super ! "Ma sœur" est le sujet !',
              incorrect: '🎒 Qui est parti à l\'école ?',
            },
          },
        ],
      },
      difficultyLevel: 60,
      points: 20,
      minAttempts: 1,
      maxAttempts: 3,
      order: 5,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  // Niveau 3 - Challenge complet
  const frEx6 = await prisma.exercise.create({
    data: {
      lessonId: grammarLesson.id,
      skillId: grammarSkill.id,
      title: 'Challenge final - Expert',
      instructions: 'Montre que tu es un expert ! Phrases complexes 🌟',
      type: ExerciseType.QCU,
      config: {
        questions: [
          {
            id: 'q1',
            question: 'Hier soir, mes amis et moi avons regardé un film.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['Hier soir', 'mes amis et moi', 'mes amis', 'un film'],
            correctAnswer: 1,
            feedback: {
              correct: '🏆 Extraordinaire ! Le sujet complet est "mes amis et moi" !',
              incorrect: '🎬 Qui a regardé le film ?',
            },
          },
          {
            id: 'q2',
            question: 'Le petit chien de la voisine aboie très fort.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['chien', 'voisine', 'aboie', 'fort'],
            correctAnswer: 2,
            feedback: {
              correct: '🎊 Bravo champion ! "aboie" est le verbe !',
              incorrect: '🐕 Quelle est l\'action ?',
            },
          },
          {
            id: 'q3',
            question: 'Pendant la récréation, tous les enfants ont couru.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['la récréation', 'tous les enfants', 'les enfants', 'Pendant'],
            correctAnswer: 1,
            feedback: {
              correct: '🌈 Fantastique ! "tous les enfants" est le sujet complet !',
              incorrect: '🏃 Qui a couru ? Attention au mot complet !',
            },
          },
          {
            id: 'q4',
            question: 'Le gros chat noir de ma grand-mère dort paisiblement.',
            questionPrompt: 'Quel est le sujet ?',
            options: ['Le chat', 'Le gros chat noir de ma grand-mère', 'ma grand-mère', 'chat noir'],
            correctAnswer: 1,
            feedback: {
              correct: '👏 Incroyable ! Tu as trouvé le sujet complet !',
              incorrect: '🐱 Le sujet inclut tous les mots qui décrivent qui dort',
            },
          },
          {
            id: 'q5',
            question: 'Demain matin, nous partirons en vacances.',
            questionPrompt: 'Quel est le verbe ?',
            options: ['Demain', 'partirons', 'nous', 'vacances'],
            correctAnswer: 1,
            feedback: {
              correct: '🎉 Parfait ! "partirons" est le verbe !',
              incorrect: '🏖️ Quelle est l\'action ?',
            },
          },
        ],
      },
      difficultyLevel: 70,
      points: 25,
      minAttempts: 1,
      maxAttempts: 3,
      order: 6,
      createdById: teacherProfile.id,
      isPublished: true,
    },
  });

  console.log('   ✅ 1 leçon + 6 exercices de grammaire créés\n');

  // ============================================================
  // 7. CRÉER UNE PROGRESSION INITIALE POUR L'ÉLÈVE
  // ============================================================
  console.log('📊 Création de la progression initiale...');

  await prisma.progress.create({
    data: {
      studentId: studentProfile.id,
      skillId: multiplicationSkill.id,
      level: 0,
      previousLevel: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      totalErrors: 0,
      averageScore: 0,
      isMastered: false,
    },
  });

  await prisma.progress.create({
    data: {
      studentId: studentProfile.id,
      skillId: grammarSkill.id,
      level: 0,
      previousLevel: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      totalErrors: 0,
      averageScore: 0,
      isMastered: false,
    },
  });

  console.log('   ✅ Progression initialisée pour 2 compétences\n');

  // ============================================================
  // 8. CRÉER DES RECOMMANDATIONS INITIALES
  // ============================================================
  console.log('💡 Création des recommandations...');

  await prisma.recommendation.create({
    data: {
      studentId: studentProfile.id,
      userId: student.id,
      type: 'PRACTICE',
      priority: 90,
      title: '🔢 Commence les multiplications !',
      description: 'Apprends les tables de 2, 3 et 4. C\'est facile, tu vas voir !',
      actionUrl: `/lecons/${multiplicationLesson.id}`,
      recommendedExerciseIds: [mathEx1.id],
      recommendedLessonIds: [multiplicationLesson.id],
      recommendedSkillIds: [multiplicationSkill.id],
      isViewed: false,
      isCompleted: false,
    },
  });

  await prisma.recommendation.create({
    data: {
      studentId: studentProfile.id,
      userId: student.id,
      type: 'PRACTICE',
      priority: 85,
      title: '📚 Découvre le sujet et le verbe !',
      description: 'Apprends à reconnaître qui fait l\'action dans une phrase',
      actionUrl: `/lecons/${grammarLesson.id}`,
      recommendedExerciseIds: [frEx1.id],
      recommendedLessonIds: [grammarLesson.id],
      recommendedSkillIds: [grammarSkill.id],
      isViewed: false,
      isCompleted: false,
    },
  });

  console.log('   ✅ 2 recommandations créées\n');

  // ============================================================
  // RÉSUMÉ FINAL
  // ============================================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 SEEDING TERMINÉ AVEC SUCCÈS !');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📦 CONTENU CRÉÉ :');
  console.log('   👤 4 utilisateurs (admin, professeur, parent, élève)');
  console.log('   🏫 1 classe CE2-A avec 1 élève inscrit');
  console.log('   📚 2 matières (Mathématiques, Français)');
  console.log('   🎯 2 compétences pilotes :');
  console.log('      • Multiplications (tables 2, 3, 4)');
  console.log('      • Identifier le sujet et le verbe');
  console.log('   📖 2 leçons complètes');
  console.log('   ✏️  12 exercices progressifs (6 par compétence)');
  console.log('   💡 2 recommandations personnalisées\n');
  
  console.log('🔐 COMPTES DE TEST :');
  console.log('   Admin     : admin@ecole.fr / password123');
  console.log('   Professeur: prof@ecole.fr / password123');
  console.log('   Parent    : parent@ecole.fr / password123');
  console.log('   Élève     : eleve@ecole.fr / password123\n');
  
  console.log('🚀 PROCHAINES ÉTAPES :');
  console.log('   1. npm run dev');
  console.log('   2. Se connecter avec un compte test');
  console.log('   3. Explorer les leçons et exercices\n');
  
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ ERREUR LORS DU SEEDING :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
