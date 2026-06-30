import type { IQuestion } from "../../data/models";

export const generateBooleanQuestions = (
  concepts: { concept: string; definition: string }[],
  idMateria?: string,
): IQuestion[] => {
  if (concepts.length === 0) {
    return [];
  }

  if (concepts.length === 1) {
    const item = concepts[0];
    return [
      {
        id: crypto.randomUUID(),
        type: "boolean",
        question: `¿La siguiente definición corresponde al concepto "${item.concept}"?\n\n${item.definition}`,
        correctAnswer: true,
        options: [
          { id: "true", text: "Verdadero" },
          { id: "false", text: "Falso" },
        ],
        explanation: `La definición mostrada sí corresponde a "${item.concept}".`,
        difficulty: "easy",
        topic: item.concept,
        idMateria,
      },
    ];
  }

  return concepts.map((item, index) => {
    const isTrue = Math.random() > 0.5;
    const nextIndex = (index + 1) % concepts.length;
    const falseDefinition = concepts[nextIndex].definition;

    const correctAnswer = isTrue;
    const definitionToUse = isTrue ? item.definition : falseDefinition;

    return {
      id: crypto.randomUUID(),
      type: "boolean",
      question: `¿La siguiente definición corresponde al concepto "${item.concept}"?\n\n${definitionToUse}`,
      correctAnswer,
      options: [
        { id: "true", text: "Verdadero" },
        { id: "false", text: "Falso" },
      ],
      explanation: isTrue
        ? `La definición mostrada sí corresponde a "${item.concept}".`
        : `La definición mostrada no corresponde a "${item.concept}".`,
      difficulty: "easy",
      topic: item.concept,
      idMateria,
    };
  });
};
