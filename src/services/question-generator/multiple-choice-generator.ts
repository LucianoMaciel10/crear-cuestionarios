import type { IQuestion } from "../../data/models";
import type { IKnowledgeNode } from "../../data/models/knowledge-node.model";

/**
 * Genera preguntas de opción múltiple a partir de nodos de conocimiento.
 * Puede trabajar con el formato antiguo (conceptos/definiciones) o el nuevo (KnowledgeNodes).
 * @param knowledgeNodes - Nodos de conocimiento o array de conceptos/definiciones
 * @param idMateria - ID de la materia
 * @returns Array de preguntas de opción múltiple
 */
export function generateMultipleChoiceQuestions(
  knowledgeNodes: { concept: string; definition: string }[] | IKnowledgeNode[],
  idMateria?: string,
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
