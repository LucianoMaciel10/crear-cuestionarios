// src/components/domain/TopicMasteryChart.tsx
import React from 'react';
import type { ITopicMastery } from '../../services/adaptive-learning/adaptive-engine';

interface TopicMasteryChartProps {
  topicMastery: ITopicMastery[];
}

const TopicMasteryChart: React.FC<TopicMasteryChartProps> = ({ topicMastery }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4">Dominio por Tema</h2>
      {topicMastery.length === 0 ? (
        <p className="text-gray-600">No hay datos de dominio disponibles.</p>
      ) : (
        <div className="space-y-4">
          {topicMastery.map((topic) => (
            <div key={topic.topic} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <h3 className="font-medium">{topic.topic}</h3>
                <p className="text-sm text-gray-600">
                  {topic.correctAnswers} de {topic.totalQuestions} correctas
                </p>
              </div>
              <div className="w-32 h-4 bg-gray-200 rounded-full mx-4">
                <div
                  className="h-4 bg-blue-500 rounded-full"
                  style={{ width: `${topic.masteryLevel * 100}%` }}
                ></div>
              </div>
              <span className="font-medium text-blue-600">
                {(topic.masteryLevel * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicMasteryChart;