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
    confidence: number; // Confianza en la extracción (0-1)
    sourceType: "ai" | "regex" | "manual"; // Método de extracción
    // Datos para repetición espaciada (reemplaza IFlashcard)
    easeFactor?: number;
    repetitionInterval?: number;
    lastReviewDate?: Date | null;
    nextReviewDate?: Date | null;
    repetitionCount?: number;
  };
  // Relaciones con otros nodos (para construir el grafo)
  relatedNodes?: string[];
}
