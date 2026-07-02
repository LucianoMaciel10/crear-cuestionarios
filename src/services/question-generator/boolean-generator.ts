import type { IQuestion } from "../../data/models";
import type { IKnowledgeNode } from "../../data/models/knowledge-node.model";

/**
 * Genera preguntas booleanas a partir de nodos de conocimiento.
 * Puede trabajar con el formato antiguo (conceptos/definiciones) o el nuevo (KnowledgeNodes).
 * Ahora soporta generación basada en corpus con relaciones entre conceptos.
 * @param knowledgeNodes - Nodos de conocimiento o array de conceptos/definiciones
 * @param idMateria - ID de la materia
 * @param options - Opciones para generación mejorada
 * @returns Array de preguntas booleanas
 */
export const generateBooleanQuestions = (
  knowledgeNodes: { concept: string; definition: string }[] | IKnowledgeNode[],
  idMateria?: string,
  options?: {
    includeRelatedConcepts?: boolean;
    difficultyLevel?: "easy" | "medium" | "hard";
  },
): IQuestion[] => {
  // Normalizar entrada: convertir KnowledgeNodes a formato concepto-definición
  const concepts = knowledgeNodes
    .map((node) => {
      if (typeof node === "object" && "type" in node && "content" in node) {
        // Es un KnowledgeNode
        const knode = node as IKnowledgeNode;
        if (knode.type === "definition") {
          // Extraer concepto y definición del contenido
          const [concept, definition] = knode.content.split(": ");
          return { concept, definition };
        }
        return { concept: knode.content, definition: "" };
      } else {
        // Es el formato antiguo
        return node as { concept: string; definition: string };
      }
    })
    .filter((c) => c.concept && c.concept.trim() !== "");

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

  const questions: IQuestion[] = [];
  const difficulty = options?.difficultyLevel || "medium";

  for (let i = 0; i < concepts.length; i++) {
    const item = concepts[i];
    const isTrue = Math.random() > 0.5;
    const nextIndex = (i + 1) % concepts.length;
    const falseDefinition = concepts[nextIndex].definition;

    const correctAnswer = isTrue;
    const definitionToUse = isTrue ? item.definition : falseDefinition;

    // Generar preguntas de diferente dificultad
    let questionText = `¿La siguiente definición corresponde al concepto "${item.concept}"?\n\n${definitionToUse}`;
    let explanation = isTrue
      ? `La definición mostrada sí corresponde a "${item.concept}".`
      : `La definición mostrada no corresponde a "${item.concept}".`;

    // Para preguntas de mayor dificultad, incluir conceptos relacionados
    if (difficulty === "hard" && options?.includeRelatedConcepts) {
      const relatedConceptIndex = (i + 2) % concepts.length;
      const relatedConcept = concepts[relatedConceptIndex];

      questionText = `¿Cuál de las siguientes afirmaciones sobre "${item.concept}" y "${relatedConcept.concept}" es correcta?\n\n${definitionToUse}`;
      explanation = isTrue
        ? `La definición describe correctamente la relación entre "${item.concept}" y "${relatedConcept.concept}".`
        : `La definición no describe correctamente la relación entre estos conceptos.`;
    }

    questions.push({
      id: crypto.randomUUID(),
      type: "boolean",
      question: questionText,
      correctAnswer,
      options: [
        { id: "true", text: "Verdadero" },
        { id: "false", text: "Falso" },
      ],
      explanation,
      difficulty,
      topic: item.concept,
      idMateria,
    });
  }

  return questions;
};
