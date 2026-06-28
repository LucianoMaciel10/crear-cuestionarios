// src/components/domain/QualityButtons.tsx
import React from 'react';

interface QualityButtonsProps {
  onSelect: (quality: number) => void;
}

const QualityButtons: React.FC<QualityButtonsProps> = ({ onSelect }) => {
  const qualities = [0, 1, 2, 3, 4, 5];

  return (
    <div className="flex gap-2">
      {qualities.map((q) => (
        <button
          key={q}
          className={`px-3 py-1 rounded text-white text-sm font-medium $
            ${q === 0 || q === 1 ? 'bg-red-500 hover:bg-red-600' : ''}
            ${q === 2 ? 'bg-orange-500 hover:bg-orange-600' : ''}
            ${q === 3 ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
            ${q === 4 ? 'bg-green-500 hover:bg-green-600' : ''}
            ${q === 5 ? 'bg-blue-500 hover:bg-blue-600' : ''}
          `}
          onClick={() => onSelect(q)}
        >
          {q}
        </button>
      ))}
    </div>
  );
};

export default QualityButtons;