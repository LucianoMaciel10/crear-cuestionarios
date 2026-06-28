// src/components/domain/FlashcardFlip.tsx
import React, { useState } from 'react';
import type { ISpacedRepetitionData } from '../../data/models/spaced-repetition.model';
import QualityButtons from './QualityButtons';

interface FlashcardFlipProps {
  flashcard: ISpacedRepetitionData;
  onQualityRating: (quality: number) => void;
}

const FlashcardFlip: React.FC<FlashcardFlipProps> = ({ flashcard, onQualityRating }) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [quality, setQuality] = useState<number | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleQualitySelect = (selectedQuality: number) => {
    setQuality(selectedQuality);
    onQualityRating(selectedQuality);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white max-w-md mx-auto">
      <div
        className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
        style={{ cursor: 'pointer', perspective: '1000px' }}
      >
        <div
          className="flashcard-inner relative w-full h-64 transition-transform duration-500 transform-style-preserve-3d"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div
            className="flashcard-front absolute w-full h-full bg-white border rounded-lg p-4 flex items-center justify-center backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <h3 className="text-xl font-semibold text-center">{flashcard.concept}</h3>
          </div>
          <div
            className="flashcard-back absolute w-full h-full bg-gray-100 border rounded-lg p-4 flex flex-col items-center justify-center backface-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <h3 className="text-lg font-semibold text-center mb-2">Definición:</h3>
            <p className="text-center mb-4">{flashcard.definition}</p>
            {flashcard.explanation && (
              <p className="text-sm text-gray-600 text-center">
                <strong>Explicación:</strong> {flashcard.explanation}
              </p>
            )}
          </div>
        </div>
      </div>
      {isFlipped && !quality && (
        <div className="mt-4 flex justify-center gap-2">
          <QualityButtons onSelect={handleQualitySelect} />
        </div>
      )}
      {quality && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-center">
          <p className="font-medium">
            {quality >= 3 ? '¡Bien hecho!' : 'Sigue practicando'}
          </p>
          <p className="text-sm text-gray-600">
            Próximo repaso: {flashcard.nextReviewDate?.toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashcardFlip;