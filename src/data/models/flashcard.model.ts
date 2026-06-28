// src/data/models/flashcard.model.ts

/**
 * Interfaz para representar una flashcard con datos de repetición espaciada.
 */
export interface IFlashcard {
  id: string;
  concept: string;
  definition: string;
  explanation?: string;
  easeFactor: number; // Factor de facilidad (EF)
  repetitionInterval: number; // Intervalo de repetición en días
  lastReviewDate: Date | null; // Fecha de la última revisión
  nextReviewDate: Date | null; // Fecha de la próxima revisión
  repetitionCount: number; // Número de repasos realizados
}