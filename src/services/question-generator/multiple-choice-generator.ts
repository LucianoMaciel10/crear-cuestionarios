import type { IQuestion } from "../../data/models";

export function generateMultipleChoiceQuestions(
  concepts: { concept: string; definition: string }[],
  idMateria?: string,
): IQuestion[] {
  if (concepts.length < 4) {
    return [];
  }

  return concepts.map((item, index) => {
    const correctOption = {
      id: crypto.randomUUID(),
      text: item.definition,
    };

    const distractorIndices = [
      (index + 1) % concepts.length,
      (index + 2) % concepts.length,
      (index + 3) % concepts.length,
    ];

    const incorrectOptions = distractorIndices.map((distractorIndex) => ({
      id: crypto.randomUUID(),
      text: concepts[distractorIndex].definition,
    }));

    const options = [correctOption, ...incorrectOptions];

    const rotatedOptions = [
      ...options.slice(index % 4),
      ...options.slice(0, index % 4),
    ];

    const correctAnswer = rotatedOptions.find(
      (option) => option.text === item.definition,
    )?.id;

    return {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      question: `¿Cuál es la definición correcta de "${item.concept}"?`,
      correctAnswer: correctAnswer || "",
      options: rotatedOptions,
      explanation: `La definición correcta de "${item.concept}" es: "${item.definition}"`,
      difficulty: "medium",
      topic: item.concept,
      idMateria,
    };
  });
}