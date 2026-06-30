// src/components/domain/QuestionCard.tsx
import React, { useState } from "react";
import type { IQuestion } from "../../data/models";
import Card from "../common/Card";
import Button from "../common/Button";

interface QuestionCardProps {
  question: IQuestion;
  onAnswer: (questionId: string, answer: string) => void;
  onNext?: () => void;
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
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-50">
        {question.question}
      </h2>
      <div className="mb-4 space-y-2">
        {question.options?.map((option) => (
          <button
            key={option.id}
            className={`block w-full p-3 text-left border rounded-lg transition-colors duration-200 ${
              selectedAnswer === option.id
                ? isCorrect
                  ? "bg-green-100 border-green-500 dark:bg-green-900/20 dark:border-green-500"
                  : isIncorrect
                    ? "bg-red-100 border-red-500 dark:bg-red-900/20 dark:border-red-500"
                    : "bg-primary-100 border-primary-500 dark:bg-primary-900/20 dark:border-primary-500"
                : "bg-gray-50 border-gray-300 dark:bg-gray-700/30 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => handleAnswer(option.id)}
            disabled={showFeedback}
          >
            {option.text}
          </button>
        ))}
      </div>
      {showFeedback && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <p
            className={`font-medium ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {isCorrect ? "¡Correcto!" : "Incorrecto"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {question.explanation}
          </p>
        </div>
      )}
      {!showFeedback && selectedAnswer && onNext && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onNext} variant="primary">
            Siguiente
          </Button>
        </div>
      )}
    </Card>
  );
};

export default QuestionCard;
