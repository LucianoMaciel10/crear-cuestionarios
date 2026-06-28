// src/pages/QuizPlayer.tsx
import React from 'react';
import { useQuizEngine } from '../hooks/useQuizEngine';
import QuestionCard from '../components/domain/QuestionCard';
import { useNavigate } from 'react-router-dom';

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
        <p className="text-lg text-gray-600">Cargando preguntas...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">No hay preguntas disponibles.</p>
      </div>
    );
  }

  if (isQuizComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white border rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Resultados del Cuestionario</h1>
        <div className="mb-4">
          <p className="text-lg">
            <span className="font-semibold">Correctas:</span> {results.correct}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Incorrectas:</span> {results.incorrect}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Total:</span> {questions.length}
          </p>
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          onClick={resetQuiz}
        >
          Reiniciar Cuestionario
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => navigate('/')}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cuestionario</h1>
        <p className="text-gray-600">
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
        <button
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={submitQuiz}
        >
          Finalizar Cuestionario
        </button>
      )}
    </div>
  );
};

export default QuizPlayer;