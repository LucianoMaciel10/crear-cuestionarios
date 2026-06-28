import type { IQuestion } from "../../data/models";

export const generateBooleanQuestions = (
  concepts: { concept: string; definition: string }[],
): IQuestion[] => {
  return concepts.map((item) => ({
    id: crypto.randomUUID(),
    type: "boolean",
    question: `¿Es correcta la siguiente definición: ${item.definition}?`,
    correctAnswer: true,
    options: [
      { id: "true", text: "Verdadero" },
      { id: "false", text: "Falso" },
    ],
    explanation: `La definición '${item.definition}' corresponde correctamente al concepto '${item.concept}'.`,
    difficulty: "easy",
    topic: item.concept,
  }));
};
