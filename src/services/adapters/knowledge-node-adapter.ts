// src/services/adapters/knowledge-node-adapter.ts

import type { IKnowledgeNode } from "../../data/models/knowledge-node.model";
import type { ISpacedRepetitionData } from "../../data/models/spaced-repetition.model";

/**
 * Convierte un KnowledgeNode a ISpacedRepetitionData para compatibilidad con flashcards.
 * @param node - Nodo de conocimiento
 * @returns Datos de repetición espaciada
 */
export function knowledgeNodeToFlashcard(
  node: IKnowledgeNode,
): ISpacedRepetitionData {
  return {
    id: node.id,
    concept: node.content,
    definition: node.definition || "",
    explanation: node.explanation,
    easeFactor: node.metadata.spacedRepetition.currentState.easeFactor,
    repetitionInterval:
      node.metadata.spacedRepetition.currentState.sm2?.interval || 0,
    lastReviewDate:
      node.metadata.spacedRepetition.currentState.lastReviewDate || null,
    nextReviewDate:
      node.metadata.spacedRepetition.currentState.nextReviewDate || null,
    repetitionCount:
      node.metadata.spacedRepetition.currentState.repetitionCount,
    idMateria: node.subjectId,
  };
}

/**
 * Convierte datos de repetición espaciada a KnowledgeNode.
 * @param flashcard - Datos de flashcard
 * @returns Nodo de conocimiento
 */
export function flashcardToKnowledgeNode(
  flashcard: ISpacedRepetitionData,
): IKnowledgeNode {
  return {
    id: flashcard.id,
    type: "concept",
    content: flashcard.concept,
    definition: flashcard.definition,
    explanation: flashcard.explanation,
    subjectId: flashcard.idMateria,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      extraction: {
        confidence: 1.0,
        sourceType: "manual",
      },
      spacedRepetition: {
        algorithm: "sm2",
        currentState: {
          easeFactor: flashcard.easeFactor,
          stability: flashcard.repetitionInterval,
          difficulty: flashcard.easeFactor,
          repetitionCount: flashcard.repetitionCount,
          lastReviewDate: flashcard.lastReviewDate,
          nextReviewDate: flashcard.nextReviewDate,
          sm2: {
            interval: flashcard.repetitionInterval,
          },
        },
        reviewHistory: [],
      },
    },
  };
}
