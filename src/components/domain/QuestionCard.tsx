// src/components/domain/QuestionCard.tsx
import React, { useState } from "react";
import type { IQuestion } from "../../data/models";

interface QuestionCardProps {
  question: IQuestion;
  onAnswer: (questionId: string, answer: string) => void;
  onNext: () => void;
  showFeedback?: boolean;
  userAnswer?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  onNext,
  showFeedback = false,
  userAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    userAnswer || null,
  );

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    onAnswer(question.id, answer);
  };

  const isCorrect = showFeedback && selectedAnswer === question.correctAnswer;
  const isIncorrect = showFeedback && selectedAnswer !== question.correctAnswer;

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4">{question.question}</h2>
      <div className="mb-4">
        {question.options?.map((option) => (
          <button
            key={option.id}
            className={`block w-full p-2 mb-2 border rounded ${
              selectedAnswer === option.id
                ? isCorrect
                  ? "bg-green-100 border-green-500"
                  : isIncorrect
                    ? "bg-red-100 border-red-500"
                    : "bg-blue-100 border-blue-500"
                : "bg-gray-50 border-gray-300"
            }`}
            onClick={() => handleAnswer(option.id)}
            disabled={showFeedback}
          >
            {option.text}
          </button>
        ))}
      </div>
      {showFeedback && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p
            className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}
          >
            {isCorrect ? "¡Correcto!" : "Incorrecto"}
          </p>
          <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
        </div>
      )}
      {!showFeedback && selectedAnswer && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onNext}
        >
          Siguiente
        </button>
      )}
    </div>
  );
};

export default QuestionCard;
