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
}

export interface IQuizAttempt {
  id: string;
  questionId: string;
  idMateria: string;
  topic: string;
  isCorrect: boolean;
  answeredAt: Date;
}
