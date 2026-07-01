// src/data/models/knowledge-node.model.ts

/**
 * Interfaz para representar un nodo de conocimiento en el Knowledge Engine.
 * Cada nodo representa una unidad atómica de conocimiento que puede ser:
 * - Un concepto
 * - Una definición
 * - Una relación entre conceptos
 * - Un ejemplo o caso de uso
 */
export interface IKnowledgeNode {
  id: string;
  type: "concept" | "definition" | "relationship" | "example";
  content: string;
  definition?: string; // Definición específica para flashcards
  explanation?: string; // Explicación adicional para flashcards
  subjectId?: string; // Referencia a la materia
  sourceMaterialId?: string; // Referencia al material original de donde se extrajo
  createdAt: Date;
  updatedAt: Date;

  metadata: {
    // Metadatos de extracción
    extraction: {
      confidence: number; // Confianza en la extracción (0-1)
      sourceType: "ai" | "regex" | "manual"; // Método de extracción
    };

    // Metadatos de repetición espaciada
    spacedRepetition: {
      // Algoritmo actual en uso
      algorithm: "sm2" | "fsrs" | "custom";

      // Estado actual del algoritmo
      currentState: {
        // Campos comunes a todos los algoritmos
        easeFactor: number; // Factor de facilidad (SM-2, FSRS)
        stability: number; // Estabilidad en días (FSRS)
        difficulty: number; // Dificultad (FSRS)
        repetitionCount: number; // Repasos exitosos
        lastReviewDate?: Date | null; // Último repaso
        nextReviewDate?: Date | null; // Próximo repaso

        // Campos específicos de SM-2
        sm2?: {
          interval: number; // Intervalo en días
        };

        // Campos específicos de FSRS
        fsrs?: {
          s: number; // Estabilidad
          d: number; // Dificultad
          r: number; // Retención
        };
      };

      // Historial completo de reviews
      reviewHistory: SpacedRepetitionReview[];
    };

    // Relaciones con otros nodos (para construir el grafo)
    relatedNodes?: string[];
  };
}

export interface SpacedRepetitionReview {
  id: string;
  timestamp: Date;
  quality: number; // 0-5 (SM-2) o 1-5 (FSRS)
  responseTime?: number; // Tiempo de respuesta en ms
  algorithmState: Record<string, unknown>; // Estado del algoritmo en ese momento
  notes?: string; // Notas del usuario
}
