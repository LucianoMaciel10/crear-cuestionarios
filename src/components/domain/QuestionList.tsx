import React from "react";
import type { IQuestion } from "../../data/models";
import Card from "../common/Card";

interface QuestionListProps {
  questions: IQuestion[];
}

const QuestionList: React.FC<QuestionListProps> = ({ questions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map((question) => (
        <Card key={question.id} className="p-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-2">
            {question.question}
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
              {question.topic}
            </span>
            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 rounded-full text-primary-600 dark:text-primary-400">
              {question.difficulty}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuestionList;
