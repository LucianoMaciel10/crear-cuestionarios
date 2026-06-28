// src/components/domain/WeakPointsList.tsx
import React from "react";
import type { IWeakPoint } from "../../services/adaptive-learning/adaptive-engine";

interface WeakPointsListProps {
  weakPoints: IWeakPoint[];
}

const WeakPointsList: React.FC<WeakPointsListProps> = ({ weakPoints }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4">Puntos Débiles</h2>
      {weakPoints.length === 0 ? (
        <p className="text-gray-600">No se detectaron puntos débiles.</p>
      ) : (
        <div className="space-y-3">
          {weakPoints.map((weakPoint) => (
            <div
              key={weakPoint.topic}
              className={`p-3 rounded flex items-center justify-between ${
                weakPoint.difficulty === "high"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div>
                <h3 className="font-medium">{weakPoint.topic}</h3>
                <p className="text-sm text-gray-600">
                  Dominio: {(weakPoint.masteryLevel * 100).toFixed(0)}%
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  weakPoint.difficulty === "high"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {weakPoint.difficulty === "high" ? "Alta" : "Media"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeakPointsList;
