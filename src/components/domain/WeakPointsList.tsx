// src/components/domain/WeakPointsList.tsx
import React from "react";
import type { IWeakPoint } from "../../services/adaptive-learning/adaptive-engine";
import Card from "../common/Card";

interface WeakPointsListProps {
  weakPoints: IWeakPoint[];
}

const WeakPointsList: React.FC<WeakPointsListProps> = ({ weakPoints }) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-50">
        Puntos Débiles
      </h2>
      {weakPoints.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No se detectaron puntos débiles.
        </p>
      ) : (
        <div className="space-y-3">
          {weakPoints.map((weakPoint) => (
            <div
              key={weakPoint.topic}
              className={`p-3 rounded-lg flex items-center justify-between ${
                weakPoint.difficulty === "high"
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700"
              }`}
            >
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-50">
                  {weakPoint.topic}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dominio: {Math.round(weakPoint.masteryLevel * 100)}%
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  weakPoint.difficulty === "high"
                    ? "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200"
                    : "bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200"
                }`}
              >
                {weakPoint.difficulty === "high" ? "Alta" : "Media"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default WeakPointsList;
