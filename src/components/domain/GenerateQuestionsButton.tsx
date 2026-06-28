import React from 'react';

interface GenerateQuestionsButtonProps {
  onClick: () => void;
}

const GenerateQuestionsButton: React.FC<GenerateQuestionsButtonProps> = ({ onClick }) => {
  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      onClick={onClick}
    >
      Generar Preguntas
    </button>
  );
};

export default GenerateQuestionsButton;
