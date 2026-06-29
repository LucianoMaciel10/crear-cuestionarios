// src/components/domain/TopicMasteryChart.tsx
import React from "react";
import type { ITopicMastery } from "../../services/adaptive-learning/adaptive-engine";
import Card from "../common/Card";

interface TopicMasteryChartProps {
  topicMastery: ITopicMastery[];
}

const TopicMasteryChart: React.FC<TopicMasteryChartProps> = ({
  topicMastery,
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-50">
        Dominio por Tema
      </h2>
      {topicMastery.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No hay datos de dominio disponibles.
        </p>
      ) : (
        <div className="space-y-3">
          {topicMastery.map((topic) => {
            const percentage = Math.round(topic.masteryLevel * 100);
            const barColor =
              percentage >= 70
                ? "bg-green-500"
                : percentage >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500";

            return (
              <div
                key={topic.topic}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-50">
                    {topic.topic}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {topic.correctAnswers} de {topic.totalQuestions} correctas
                  </p>
                </div>
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded-full mx-3">
                  <div
                    className={`h-3 ${barColor} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span
                  className={`font-medium ${percentage >= 70 ? "text-green-600 dark:text-green-400" : percentage >= 40 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default TopicMasteryChart;
