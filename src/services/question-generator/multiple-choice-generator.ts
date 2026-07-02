import type { IQuestion } from "../../data/models";
import type { IKnowledgeNode } from "../../data/models/knowledge-node.model";

/**
 * Genera preguntas de opción múltiple a partir de nodos de conocimiento.
 * Puede trabajar con el formato antiguo (conceptos/definiciones) o el nuevo (KnowledgeNodes).
 * Ahora soporta generación basada en corpus con relaciones entre conceptos.
 * @param knowledgeNodes - Nodos de conocimiento o array de conceptos/definiciones
 * @param idMateria - ID de la materia
 * @param options - Opciones para generación mejorada
 * @returns Array de preguntas de opción múltiple
 */
export function generateMultipleChoiceQuestions(
  knowledgeNodes: { concept: string; definition: string }[] | IKnowledgeNode[],
  idMateria?: string,
  options?: {
    includeRelatedConcepts?: boolean;
    difficultyLevel?: "easy" | "medium" | "hard";
  },
): IQuestion[] {
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

  if (concepts.length < 4) {
    return [];
  }

  const questions: IQuestion[] = [];
  const difficulty = options?.difficultyLevel || "medium";

  for (let i = 0; i < concepts.length; i++) {
    const item = concepts[i];
    const correctOption = {
      id: crypto.randomUUID(),
      text: item.definition,
    };

    const distractorIndices = [
      (i + 1) % concepts.length,
      (i + 2) % concepts.length,
      (i + 3) % concepts.length,
    ];

    const incorrectOptions = distractorIndices.map((distractorIndex) => ({
      id: crypto.randomUUID(),
      text: concepts[distractorIndex].definition,
    }));

    const options = [correctOption, ...incorrectOptions];

    const rotatedOptions = [
      ...options.slice(i % 4),
      ...options.slice(0, i % 4),
    ];

    const correctAnswer = rotatedOptions.find(
      (option) => option.text === item.definition,
    )?.id;

    // Generar pregunta según dificultad
    let questionText = `¿Cuál es la definición correcta de "${item.concept}"?`;
    let explanation = `La definición correcta de "${item.concept}" es: "${item.definition}"`;

    // Para preguntas de mayor dificultad
    if (difficulty === "hard" && options?.includeRelatedConcepts) {
      const relatedConceptIndex = (i + 2) % concepts.length;
      const relatedConcept = concepts[relatedConceptIndex];

      questionText = `¿Cuál de las siguientes opciones describe mejor la relación entre "${item.concept}" y "${relatedConcept.concept}"?`;
      explanation = `La opción correcta describe la relación entre "${item.concept}" y "${relatedConcept.concept}" basada en sus definiciones.`;
    } else if (difficulty === "medium") {
      questionText = `Seleccione la definición más precisa para "${item.concept}":`;
    }

    questions.push({
      id: crypto.randomUUID(),
      type: "multiple-choice",
      question: questionText,
      correctAnswer: correctAnswer || "",
      options: rotatedOptions,
      explanation,
      difficulty,
      topic: item.concept,
      idMateria,
    });
  }

  return questions;
}
