// src/pages/QuizPlayer.tsx
import React from "react";
import { useQuizEngine } from "../hooks/useQuizEngine";
import QuestionCard from "../components/domain/QuestionCard";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

const QuizPlayer: React.FC = () => {
  const {
    questions,
    currentQuestionIndex,
    answers,
    results,
    isQuizComplete,
    loading,
    answerQuestion,
    nextQuestion,
    submitQuiz,
    resetQuiz,
  } = useQuizEngine();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Cargando preguntas...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No hay preguntas disponibles.
        </p>
      </div>
    );
  }

  if (isQuizComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-50">
            Resultados del Cuestionario
          </h1>
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${(results.correct / questions.length) * 100}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {Math.round((results.correct / questions.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.correct}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Correctas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.incorrect}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Incorrectas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {questions.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={resetQuiz} variant="primary" className="w-full">
              Reiniciar Cuestionario
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              className="w-full"
            >
              Volver al Inicio
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Cuestionario
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </p>
      </div>
      <QuestionCard
        question={currentQuestion}
        onAnswer={answerQuestion}
        onNext={nextQuestion}
        showFeedback={false}
        userAnswer={answers[currentQuestion.id]}
      />
      {currentQuestionIndex === questions.length - 1 && (
        <div className="mt-6">
          <Button onClick={submitQuiz} variant="success" className="w-full">
            Finalizar Cuestionario
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;
