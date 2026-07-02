// src/services/spaced-repetition/knowledge-node-updater.ts

import type {
  IKnowledgeNode,
  SpacedRepetitionReview,
} from "../../data/models/knowledge-node.model";
import { SM2Algorithm, type SM2State } from "./sm2-engine";

/**
 * Actualiza un KnowledgeNode con el resultado de una review usando SM-2
 * @param node - Nodo de conocimiento a actualizar
 * @param quality - Calidad de la respuesta (0-5)
 * @returns Nuevo nodo de conocimiento actualizado
 */
export function updateKnowledgeNodeWithSM2Review(
  node: IKnowledgeNode,
  quality: number,
): IKnowledgeNode {
  // Obtener estado actual de SM-2
  const currentSM2State: SM2State = {
    easeFactor: node.metadata.spacedRepetition.currentState.easeFactor,
    interval: node.metadata.spacedRepetition.currentState.sm2?.interval || 0,
    repetitionCount:
      node.metadata.spacedRepetition.currentState.repetitionCount,
  };

  // Calcular nuevo estado usando algoritmo SM-2 puro
  const newSM2State = SM2Algorithm.calculateNextState(currentSM2State, quality);

  // Crear registro de review
  const newReview: SpacedRepetitionReview = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    quality,
    algorithmState: {
      ...node.metadata.spacedRepetition.currentState,
      sm2: {
        interval: currentSM2State.interval,
      },
    },
  };

  // Calcular fechas
  const today = new Date();
  const nextReviewDate = SM2Algorithm.calculateNextReviewDate(
    today,
    newSM2State.interval,
  );

  // Actualizar el nodo
  return {
    ...node,
    updatedAt: new Date(),
    metadata: {
      ...node.metadata,
      spacedRepetition: {
        ...node.metadata.spacedRepetition,
        algorithm: "sm2",
        currentState: {
          ...node.metadata.spacedRepetition.currentState,
          easeFactor: newSM2State.easeFactor,
          stability: newSM2State.interval, // Para SM-2, stability = interval
          difficulty: newSM2State.easeFactor, // Para SM-2, difficulty ≈ easeFactor
          repetitionCount: newSM2State.repetitionCount,
          lastReviewDate: today,
          nextReviewDate: nextReviewDate,
          sm2: {
            interval: newSM2State.interval,
          },
        },
        reviewHistory: [
          ...(node.metadata.spacedRepetition.reviewHistory || []),
          newReview,
        ],
      },
    },
  };
}

/**
 * Inicializa un KnowledgeNode para repetición espaciada con SM-2
 * @param node - Nodo de conocimiento a inicializar
 * @returns Nuevo nodo de conocimiento con estado inicial de SM-2
 */
export function initializeKnowledgeNodeForSM2(
  node: IKnowledgeNode,
): IKnowledgeNode {
  const initialState = SM2Algorithm.createInitialState();

  return {
    ...node,
    updatedAt: new Date(),
    metadata: {
      ...node.metadata,
      spacedRepetition: {
        algorithm: "sm2",
        currentState: {
          easeFactor: initialState.easeFactor,
          stability: initialState.interval,
          difficulty: initialState.easeFactor,
          repetitionCount: initialState.repetitionCount,
          lastReviewDate: null,
          nextReviewDate: null,
          sm2: {
            interval: initialState.interval,
          },
        },
        reviewHistory: [],
      },
    },
  };
}

/**
 * Verifica si un KnowledgeNode está listo para repaso
 * @param node - Nodo de conocimiento
 * @returns true si está listo para repaso, false en caso contrario
 */
export function isKnowledgeNodeDueForReview(node: IKnowledgeNode): boolean {
  if (!node.metadata.spacedRepetition?.currentState?.nextReviewDate) {
    return false; // Nunca se ha repasado
  }

  const today = new Date();
  const nextReviewDate =
    node.metadata.spacedRepetition.currentState.nextReviewDate;

  return today >= nextReviewDate;
}

/**
 * Obtiene el historial de reviews de un KnowledgeNode
 * @param node - Nodo de conocimiento
 * @returns Array de reviews ordenadas cronológicamente
 */
export function getReviewHistory(
  node: IKnowledgeNode,
): SpacedRepetitionReview[] {
  return node.metadata.spacedRepetition?.reviewHistory || [];
}

/**
 * Calcula estadísticas de repetición espaciada
 * @param node - Nodo de conocimiento
 * @returns Objeto con estadísticas
 */
export function calculateSpacedRepetitionStats(node: IKnowledgeNode) {
  const history = getReviewHistory(node);

  if (history.length === 0) {
    return {
      successRate: 0,
      averageQuality: 0,
      streak: 0,
      totalReviews: 0,
      successfulReviews: 0,
    };
  }

  const successfulReviews = history.filter((r) => r.quality >= 3).length;
  const totalReviews = history.length;
  const successRate = successfulReviews / totalReviews;
  const averageQuality =
    history.reduce((sum, r) => sum + r.quality, 0) / totalReviews;

  // Calcular streak (rachas de éxito consecutivas)
  let streak = 0;
  let currentStreak = 0;

  for (const review of [...history].reverse()) {
    if (review.quality >= 3) {
      currentStreak++;
      streak = Math.max(streak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    successRate,
    averageQuality,
    streak,
    totalReviews,
    successfulReviews,
  };
}
