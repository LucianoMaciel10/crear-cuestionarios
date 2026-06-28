// src/hooks/useQuizEngine.ts
import { useState, useEffect } from "react";
import * as questionService from "../services/question.service";
import type { IQuestion } from "../data/models";

interface QuizState {
  questions: IQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  results: { correct: number; incorrect: number };
  isQuizComplete: boolean;
}

export function useQuizEngine() {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    results: { correct: 0, incorrect: 0 },
    isQuizComplete: false,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await questionService.getAllQuestions();
        setQuizState((prev) => ({ ...prev, questions }));
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

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
    return userAnswer === question.correctAnswer;
  };

  const nextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      // Quiz completo
      setQuizState((prev) => ({ ...prev, isQuizComplete: true }));
    }
  };

  const submitQuiz = () => {
    let correct = 0;
    let incorrect = 0;

    quizState.questions.forEach((question) => {
      const userAnswer = quizState.answers[question.id];
      if (userAnswer !== undefined) {
        if (checkAnswer(question.id, userAnswer)) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

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
