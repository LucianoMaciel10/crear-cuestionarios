import React from "react";
import Button from "../common/Button";

interface GenerateQuestionsButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

const GenerateQuestionsButton: React.FC<GenerateQuestionsButtonProps> = ({
  onClick,
  isLoading = false,
}) => {
  return (
    <Button onClick={onClick} variant="primary" isLoading={isLoading}>
      Generar Preguntas
    </Button>
  );
};

export default GenerateQuestionsButton;
