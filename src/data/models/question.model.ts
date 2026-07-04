export interface IQuestion {
  id: string;
  type: "boolean" | "multiple-choice" | "short-answer";
  question: string;
  correctAnswer: string | boolean | string[];
  options?: { id: string; text: string }[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  idMateria?: string;
  // Nuevos campos para rastrear el origen de la pregunta
  sourceMaterialId?: string;
  sourceKnowledgeNodeId?: string;
}

export interface IQuizAttempt {
  id: string;
  questionId: string;
  idMateria: string;
  topic: string;
  isCorrect: boolean;
  answeredAt: Date;
}
