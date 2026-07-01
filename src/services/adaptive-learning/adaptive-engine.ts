// src/services/adaptive-learning/adaptive-engine.ts
import type { ISpacedRepetitionData } from "../../data/models/spaced-repetition.model";
import type { IQuizAttempt } from "../../data/models/question.model";
import type { IKnowledgeNode } from "../../data/models/knowledge-node.model";

/**
 * Interfaz para representar el dominio de un tema.
 */
export interface ITopicMastery {
  topic: string;
  masteryLevel: number; // Nivel de dominio (0-1)
  totalQuestions: number; // Total de preguntas respondidas
  correctAnswers: number; // Respuestas correctas
  incorrectAnswers: number; // Respuestas incorrectas
}

/**
 * Interfaz para representar un punto débil.
 */
export interface IWeakPoint {
  topic: string;
  masteryLevel: number; // Nivel de dominio (0-1)
  difficulty: string; // Dificultad del tema
}

/**
 * Calcula el dominio por tema basado en el historial de respuestas.
 * @param attempts - Lista de intentos de quiz.
 * @returns Lista de temas con su nivel de dominio.
 */
export function calculateTopicMastery(
  attempts: IQuizAttempt[],
): ITopicMastery[] {
  const topicStats: Record<string, { correct: number; total: number }> = {};

  attempts.forEach((attempt) => {
    if (!topicStats[attempt.topic]) {
      topicStats[attempt.topic] = { correct: 0, total: 0 };
    }
    topicStats[attempt.topic].total++;
    if (attempt.isCorrect) {
      topicStats[attempt.topic].correct++;
    }
  });

  return Object.keys(topicStats).map((topic) => {
    const stats = topicStats[topic];
    const masteryLevel = stats.total > 0 ? stats.correct / stats.total : 0;
    return {
      topic,
      masteryLevel,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      incorrectAnswers: stats.total - stats.correct,
    };
  });
}

/**
 * Detecta los puntos débiles basado en el dominio por tema.
 * @param topicMastery - Lista de temas con su nivel de dominio.
 * @returns Lista de puntos débiles.
 */
export function detectWeakPoints(topicMastery: ITopicMastery[]): IWeakPoint[] {
  // Filtrar temas con un nivel de dominio menor a 0.5
  const weakPoints: IWeakPoint[] = topicMastery
    .filter((topic) => topic.masteryLevel < 0.5)
    .map((topic) => ({
      topic: topic.topic,
      masteryLevel: topic.masteryLevel,
      difficulty: topic.masteryLevel < 0.3 ? "high" : "medium",
    }));

  // Ordenar por nivel de dominio (de menor a mayor)
  weakPoints.sort((a, b) => a.masteryLevel - b.masteryLevel);

  return weakPoints;
}

/**
 * Calcula el dominio por tema basado en el historial de repasos de flashcards.
 * @param flashcards - Lista de flashcards repasadas.
 * @returns Lista de temas con su nivel de dominio.
 */
export function calculateFlashcardMastery(
  flashcards: ISpacedRepetitionData[],
): ITopicMastery[] {
  const topicStats: Record<string, { correct: number; total: number }> = {};

  flashcards.forEach((flashcard) => {
    // Verificar si la flashcard tiene un concepto y un contador de repasos
    if (flashcard.concept && flashcard.repetitionCount > 0) {
      if (!topicStats[flashcard.concept]) {
        topicStats[flashcard.concept] = { correct: 0, total: 0 };
      }
      topicStats[flashcard.concept].total++;
      // Aquí asumimos que la flashcard se respondió correctamente si el contador de repasos es mayor a 0
      // En una implementación real, esto debería basarse en el historial de repasos del usuario
      topicStats[flashcard.concept].correct++;
    }
  });

  return Object.keys(topicStats).map((topic) => {
    const stats = topicStats[topic];
    const masteryLevel = stats.total > 0 ? stats.correct / stats.total : 0;
    return {
      topic,
      masteryLevel,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      incorrectAnswers: stats.total - stats.correct,
    };
  });
}

/**
 * Calcula el dominio por tema basado en KnowledgeNodes
 * Usa el historial real de reviews para cálculo preciso
 * @param knowledgeNodes - Lista de nodos de conocimiento
 * @returns Lista de temas con su nivel de dominio
 */
export function calculateKnowledgeNodeMastery(
  knowledgeNodes: IKnowledgeNode[],
): ITopicMastery[] {
  const topicStats: Record<string, { correct: number; total: number }> = {};

  knowledgeNodes.forEach((node) => {
    // Solo considerar conceptos y definiciones
    if (node.type !== "concept" && node.type !== "definition") return;

    const topic = node.content;
    const reviewHistory = node.metadata.spacedRepetition?.reviewHistory || [];

    if (reviewHistory.length === 0) return;

    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }

    // Contar reviews exitosas (quality >= 3 para SM-2)
    const successfulReviews = reviewHistory.filter(
      (r) => r.quality >= 3,
    ).length;

    topicStats[topic].correct += successfulReviews;
    topicStats[topic].total += reviewHistory.length;
  });

  return Object.keys(topicStats).map((topic) => {
    const stats = topicStats[topic];
    const masteryLevel = stats.total > 0 ? stats.correct / stats.total : 0;
    return {
      topic,
      masteryLevel,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      incorrectAnswers: stats.total - stats.correct,
    };
  });
}

/**
 * Combina el dominio por tema de preguntas y flashcards.
 * @param questionMastery - Dominio por tema de preguntas.
 * @param flashcardMastery - Dominio por tema de flashcards.
 * @returns Dominio por tema combinado.
 */
export function combineMastery(
  questionMastery: ITopicMastery[],
  flashcardMastery: ITopicMastery[],
): ITopicMastery[] {
  const combinedStats: Record<string, { correct: number; total: number }> = {};

  // Combinar estadísticas de preguntas
  questionMastery.forEach((topic) => {
    if (!combinedStats[topic.topic]) {
      combinedStats[topic.topic] = { correct: 0, total: 0 };
    }
    combinedStats[topic.topic].correct += topic.correctAnswers;
    combinedStats[topic.topic].total += topic.totalQuestions;
  });

  // Combinar estadísticas de flashcards
  flashcardMastery.forEach((topic) => {
    if (!combinedStats[topic.topic]) {
      combinedStats[topic.topic] = { correct: 0, total: 0 };
    }
    combinedStats[topic.topic].correct += topic.correctAnswers;
    combinedStats[topic.topic].total += topic.totalQuestions;
  });

  return Object.keys(combinedStats).map((topic) => {
    const stats = combinedStats[topic];
    const masteryLevel = stats.total > 0 ? stats.correct / stats.total : 0;
    return {
      topic,
      masteryLevel,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      incorrectAnswers: stats.total - stats.correct,
    };
  });
}

/**
 * Combina dominio de preguntas con dominio de KnowledgeNodes
 * @param questionMastery - Dominio por tema de preguntas
 * @param knowledgeNodeMastery - Dominio por tema de KnowledgeNodes
 * @returns Dominio por tema combinado
 */
export function combineQuestionAndKnowledgeNodeMastery(
  questionMastery: ITopicMastery[],
  knowledgeNodeMastery: ITopicMastery[],
): ITopicMastery[] {
  const combinedStats: Record<string, { correct: number; total: number }> = {};

  // Combinar estadísticas de preguntas
  questionMastery.forEach((topic) => {
    if (!combinedStats[topic.topic]) {
      combinedStats[topic.topic] = { correct: 0, total: 0 };
    }
    combinedStats[topic.topic].correct += topic.correctAnswers;
    combinedStats[topic.topic].total += topic.totalQuestions;
  });

  // Combinar estadísticas de KnowledgeNodes
  knowledgeNodeMastery.forEach((topic) => {
    if (!combinedStats[topic.topic]) {
      combinedStats[topic.topic] = { correct: 0, total: 0 };
    }
    combinedStats[topic.topic].correct += topic.correctAnswers;
    combinedStats[topic.topic].total += topic.totalQuestions;
  });

  return Object.keys(combinedStats).map((topic) => {
    const stats = combinedStats[topic];
    const masteryLevel = stats.total > 0 ? stats.correct / stats.total : 0;
    return {
      topic,
      masteryLevel,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      incorrectAnswers: stats.total - stats.correct,
    };
  });
}
