// src/components/domain/QualityButtons.tsx
import React from "react";
import Button from "../common/Button";

interface QualityButtonsProps {
  onSelect: (quality: number) => void;
}

const QualityButtons: React.FC<QualityButtonsProps> = ({ onSelect }) => {
  const qualities = [0, 1, 2, 3, 4, 5];

  const getVariant = (q: number) => {
    if (q === 0 || q === 1) return "danger";
    if (q === 2) return "danger"; // Using danger for orange-like color
    if (q === 3) return "warning"; // We'll add warning variant
    if (q === 4) return "success";
    if (q === 5) return "primary";
    return "secondary";
  };

  return (
    <div className="flex gap-2">
      {qualities.map((q) => (
        <Button
          key={q}
          onClick={() => onSelect(q)}
          variant={getVariant(q)}
          size="sm"
          className="px-3 py-1"
        >
          {q}
        </Button>
      ))}
    </div>
  );
};

export default QualityButtons;
