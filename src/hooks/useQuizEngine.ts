// src/hooks/useQuizEngine.ts
import { useState, useEffect } from "react";
import * as questionService from "../services/question.service";
import type { IQuestion, IQuizAttempt } from "../data/models";

interface QuizState {
  questions: IQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  results: { correct: number; incorrect: number };
  isQuizComplete: boolean;
}

export function useQuizEngine(subjectId: string) {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    results: { correct: 0, incorrect: 0 },
    isQuizComplete: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions =
          await questionService.getQuestionsBySubject(subjectId);
        setQuizState((prev) => ({ ...prev, questions }));
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [subjectId, refreshKey]);

  const answerQuestion = (questionId: string, userAnswer: string) => {
    setQuizState((prev) => {
      const updatedAnswers = { ...prev.answers, [questionId]: userAnswer };
      return { ...prev, answers: updatedAnswers };
    });
  };

  const checkAnswer = (questionId: string, userAnswer: string) => {
    const question = quizState.questions.find((q) => q.id === questionId);
    if (!question) return false;

    // Comparar la respuesta del usuario con la respuesta correcta
    return userAnswer === String(question.correctAnswer);
  };

  const nextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  };

  const submitQuiz = async () => {
    let correct = 0;
    let incorrect = 0;
    const attempts: IQuizAttempt[] = [];

    quizState.questions.forEach((question) => {
      const userAnswer = quizState.answers[question.id];
      if (userAnswer !== undefined) {
        const isCorrect = checkAnswer(question.id, userAnswer);
        if (isCorrect) {
          correct++;
        } else {
          incorrect++;
        }

        attempts.push({
          id: crypto.randomUUID(),
          questionId: question.id,
          idMateria: subjectId,
          topic: question.topic,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });

    if (attempts.length > 0) {
      await questionService.saveQuizAttempts(attempts);
    }

    setQuizState((prev) => ({
      ...prev,
      results: { correct, incorrect },
      isQuizComplete: true,
    }));
  };

  const resetQuiz = () => {
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      results: { correct: 0, incorrect: 0 },
      isQuizComplete: false,
    });
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  return {
    ...quizState,
    loading,
    answerQuestion,
    checkAnswer,
    nextQuestion,
    submitQuiz,
    resetQuiz,
  };
}
