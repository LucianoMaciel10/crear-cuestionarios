// src/services/spaced-repetition/sm2-algorithm.ts
import type { IKnowledgeNode } from "../../data/models/knowledge-node.model";

/**
 * Calcula el próximo estado usando el algoritmo SM-2 para KnowledgeNode
 */
export function calculateNextReviewForKnowledgeNode(
  node: IKnowledgeNode,
  quality: number,
): IKnowledgeNode {
  const today = new Date();
  const clampedQuality = Math.max(0, Math.min(5, quality));

  const currentState = node.metadata.spacedRepetition.currentState;
  const newEaseFactor =
    clampedQuality >= 3
      ? Math.max(
          1.3,
          currentState.easeFactor +
            0.1 -
            (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02),
        )
      : Math.max(1.3, currentState.easeFactor - 0.2);

  const newInterval =
    currentState.repetitionCount === 0
      ? 1
      : currentState.repetitionCount === 1
        ? 6
        : Math.ceil((currentState.sm2?.interval || 0) * newEaseFactor);

  const nextReviewDate = new Date(today);
  nextReviewDate.setDate(today.getDate() + newInterval);

  const newRepetitionCount =
    clampedQuality >= 3 ? currentState.repetitionCount + 1 : 0;

  return {
    ...node,
    metadata: {
      ...node.metadata,
      spacedRepetition: {
        ...node.metadata.spacedRepetition,
        currentState: {
          ...currentState,
          easeFactor: newEaseFactor,
          stability: newInterval,
          difficulty: newEaseFactor,
          repetitionCount: newRepetitionCount,
          lastReviewDate: today,
          nextReviewDate,
          sm2: {
            interval: newInterval,
          },
        },
      },
    },
  };
}

/**
 * Crea un nuevo KnowledgeNode con valores iniciales para SM-2
 */
export function createNewKnowledgeNode(
  concept: string,
  definition: string,
  explanation?: string,
  subjectId?: string,
): IKnowledgeNode {
  return {
    id: crypto.randomUUID(),
    type: "concept",
    content: concept,
    definition,
    explanation,
    subjectId,
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
          easeFactor: 2.5,
          stability: 0,
          difficulty: 2.5,
          repetitionCount: 0,
          lastReviewDate: null,
          nextReviewDate: null,
          sm2: {
            interval: 0,
          },
        },
        reviewHistory: [],
      },
    },
  };
}
