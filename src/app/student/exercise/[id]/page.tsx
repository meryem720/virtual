'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RecommendationCard } from '@/components/student/RecommendationCard';

type ExerciseType = 'QCM' | 'QCU' | 'DRAG_DROP' | 'INPUT_NUMBER' | 'INPUT_TEXT' | 'ORDER' | 'TRUE_FALSE' | 'FILL_BLANK';

interface Exercise {
  id: string;
  title: string;
  instructions: string;
  type: ExerciseType;
  difficultyLevel: number;
  config: {
    questions: Array<{
      id: string;
      question: string;
      options?: string[];
      correctAnswer: any;
      feedback: {
        correct: string;
        incorrect: string;
      };
    }>;
  };
  lesson: {
    id: string;
    title: string;
  };
  skill: {
    id: string;
    name: string;
  };
}

interface AttemptResult {
  success: boolean;
  message: string;
  attempt: any;
  progress: any;
  recommendation?: any;
  shouldReviewLesson: boolean;
  needsRemediation: boolean;
  newLevel: number;
}

export default function ExercisePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch exercise data
  useEffect(() => {
    async function fetchExercise() {
      try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        if (!response.ok) throw new Error('Failed to fetch exercise');
        const data = await response.json();
        setExercise(data);
        setStartTime(new Date());
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    }

    if (exerciseId) {
      fetchExercise();
    }
  }, [exerciseId]);

  const checkAnswer = (
    userAns: any, 
    correctAns: any, 
    type: ExerciseType,
    options?: string[]
  ): boolean => {
    if (type === 'QCM') {
      return JSON.stringify(userAns.sort()) === JSON.stringify(correctAns.sort());
    } else if (type === 'QCU' || type === 'TRUE_FALSE') {
      // For QCU, correctAns is the INDEX in the options array
      // userAns is the selected option TEXT
      if (options && options[correctAns]) {
        return userAns === options[correctAns];
      }
      // Fallback to number comparison if no options provided
      return Number(userAns) === Number(correctAns);
    } else if (type === 'INPUT_NUMBER') {
      return Number(userAns) === Number(correctAns);
    } else if (type === 'INPUT_TEXT') {
      return userAns.toLowerCase().trim() === correctAns.toLowerCase().trim();
    } else if (type === 'ORDER') {
      return JSON.stringify(userAns) === JSON.stringify(correctAns);
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!exercise || userAnswer === null || !session?.user?.studentProfileId) return;
    
    const currentQuestion = exercise.config.questions[currentQuestionIndex];
    setSubmitting(true);

    const isCorrect = checkAnswer(
      userAnswer, 
      currentQuestion.correctAnswer, 
      exercise.type,
      currentQuestion.options
    );
    
    // Update counters
    if (isCorrect) {
      setTotalCorrect(totalCorrect + 1);
    } else {
      setTotalErrors(totalErrors + 1);
    }
    
    // Show feedback for this question
    setFeedback({
      show: true,
      isCorrect,
      message: isCorrect ? currentQuestion.feedback.correct : currentQuestion.feedback.incorrect,
    });
    
    setSubmitting(false);
  };

  const handleNextQuestion = () => {
    if (!exercise) return;
    
    // Reset for next question
    setFeedback(null);
    setUserAnswer(null);
    
    // Check if there are more questions
    if (currentQuestionIndex < exercise.config.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Exercise complete - submit to backend
      submitFinalResult();
    }
  };
  
  const submitFinalResult = async () => {
    if (!exercise || !session?.user?.studentProfileId || !session?.user?.id) return;
    
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const totalQuestions = exercise.config.questions.length;
    const isCorrect = totalCorrect > totalQuestions / 2; // Pass if more than half correct
    const score = Math.round((totalCorrect / totalQuestions) * 100);

    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: session.user.studentProfileId,
          exerciseId: exercise.id,
          userId: session.user.id,
          answer: { totalCorrect, totalErrors, totalQuestions }, // Aggregate answer
          isCorrect,
          score,
          errorCount: totalErrors,
          timeSpent,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit attempt');

      const result: AttemptResult = await response.json();
      setAttemptResult(result);
    } catch (error) {
      console.error('Error submitting attempt:', error);
    }
  };

  const handleNext = () => {
    if (attemptResult?.shouldReviewLesson || attemptResult?.needsRemediation) {
      // Redirect to lesson
      router.push(`/student/skill/${exercise?.skill.id}`);
    } else {
      // Continue with next exercise or go back to skill
      router.push(`/student/skill/${exercise?.skill.id}`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Exercice introuvable.</p>
            <Button onClick={() => router.push('/student')} className="w-full mt-4">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = exercise.config.questions[currentQuestionIndex];
  const totalQuestions = exercise.config.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/student/skill/${exercise.skill.id}`)}
            className="mb-4"
          >
            ← Retour
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{exercise.skill.name}</Badge>
            <Badge variant="secondary">Difficulté: {exercise.difficultyLevel}</Badge>
            <Badge>Question {currentQuestionIndex + 1}/{totalQuestions}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{exercise.title}</h1>
          <p className="text-gray-600 mt-1">{exercise.instructions}</p>
        </div>

        {/* Main Exercise Card */}
        {!attemptResult ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-800">{currentQuestion.question}</p>
            </div>

            {/* Render different input types based on exercise type */}
            {!feedback?.show && currentQuestion.options && (
              <div className="space-y-4">
                {/* QCU - Single Choice */}
                {exercise.type === 'QCU' && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option: string, index: number) => (
                      <label
                        key={index}
                        className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* QCM - Multiple Choice */}
                {exercise.type === 'QCM' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option: string, index: number) => (
                      <label
                        key={index}
                        className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          value={option}
                          onChange={(e) => {
                            const current = userAnswer || [];
                            if (e.target.checked) {
                              setUserAnswer([...current, option]);
                            } else {
                              setUserAnswer(current.filter((a: string) => a !== option));
                            }
                          }}
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* INPUT_NUMBER */}
                {exercise.type === 'INPUT_NUMBER' && (
                  <input
                    type="number"
                    placeholder="Entrez votre réponse"
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full p-4 border rounded-lg text-lg"
                  />
                )}

                {/* INPUT_TEXT */}
                {exercise.type === 'INPUT_TEXT' && (
                  <input
                    type="text"
                    placeholder="Entrez votre réponse"
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full p-4 border rounded-lg text-lg"
                  />
                )}

                {/* TRUE_FALSE */}
                {exercise.type === 'TRUE_FALSE' && (
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setUserAnswer('true')}
                      variant={userAnswer === 'true' ? 'default' : 'outline'}
                      className="flex-1 h-20 text-lg"
                    >
                      Vrai
                    </Button>
                    <Button
                      onClick={() => setUserAnswer('false')}
                      variant={userAnswer === 'false' ? 'default' : 'outline'}
                      className="flex-1 h-20 text-lg"
                    >
                      Faux
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={userAnswer === null || submitting}
                  className="w-full mt-6"
                  size="lg"
                >
                  {submitting ? 'Vérification...' : 'Valider ma réponse'}
                </Button>
              </div>
            )}

            {/* Feedback Display */}
            {feedback?.show && (
              <div className="space-y-6">
                <div
                  className={`p-6 rounded-lg ${
                    feedback.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        feedback.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {feedback.isCorrect ? (
                        <span className="text-white text-2xl">✓</span>
                      ) : (
                        <span className="text-white text-2xl">✗</span>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${feedback.isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                        {feedback.isCorrect ? 'Excellent !' : 'Pas tout à fait...'}
                      </h3>
                    </div>
                  </div>
                  <p className={`text-lg ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {feedback.message}
                  </p>
                </div>

                <Button onClick={handleNextQuestion} className="w-full" size="lg">
                  {isLastQuestion ? 'Terminer l\'exercice' : 'Question suivante →'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        ) : (
          /* Exercise Complete - Show Results */
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Exercice terminé !</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary-600 mb-2">
                  {totalCorrect}/{totalQuestions}
                </p>
                <p className="text-gray-600">Bonnes réponses</p>
              </div>

              {/* Progression Update */}
              {attemptResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Votre progression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Niveau: {attemptResult.newLevel}/100</span>
                          <span className="text-sm text-gray-600">
                            {attemptResult.newLevel > (attemptResult.progress?.level || 0) ? '+' : ''}
                            {attemptResult.newLevel - (attemptResult.progress?.level || 0)}
                          </span>
                        </div>
                        <Progress value={attemptResult.newLevel} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {attemptResult?.recommendation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recommandation</h3>
                  <RecommendationCard
                    type={attemptResult.recommendation.type}
                    title={attemptResult.recommendation.title || ''}
                    description={attemptResult.recommendation.description || ''}
                    priority={attemptResult.recommendation.priority}
                  />
                </div>
              )}

              {/* Warning messages */}
              {attemptResult?.needsRemediation && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-900 font-medium">
                    ⚠️ Vous avez besoin de revoir la leçon. Vous allez être redirigé vers le cours.
                  </p>
                </div>
              )}

              <Button onClick={handleNext} className="w-full" size="lg">
                {attemptResult?.shouldReviewLesson || attemptResult?.needsRemediation
                  ? 'Revoir la leçon'
                  : 'Continuer'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
