import React from "react";
import type { IQuestion } from "../../data/models";

interface QuestionListProps {
  questions: IQuestion[];
}

const QuestionList: React.FC<QuestionListProps> = ({ questions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map((question) => (
        <div key={question.id} className="border p-4 rounded shadow">
          <h2 className="font-bold">{question.question}</h2>
          <p className="text-sm text-gray-600">Tema: {question.topic}</p>
          <p className="text-sm text-gray-600">
            Dificultad: {question.difficulty}
          </p>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
