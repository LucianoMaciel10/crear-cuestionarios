// src/data/models/spaced-repetition.model.ts

/**
 * Interfaz para representar una flashcard con datos de repetición espaciada.
 * @deprecated Usar IKnowledgeNode en su lugar
 * Esta interfaz se mantiene temporalmente para compatibilidad con versiones anteriores,
 * pero ya no se usa en el código activo. Todos los datos de flashcards ahora se almacenan
 * en KnowledgeNodes con metadata de repetición espaciada.
 */
export interface ISpacedRepetitionData {
  id: string;
  concept: string;
  definition: string;
  explanation?: string;
  easeFactor: number; // Factor de facilidad (EF)
  repetitionInterval: number; // Intervalo de repetición en días
  lastReviewDate: Date | null; // Fecha de la última revisión
  nextReviewDate: Date | null; // Fecha de la próxima revisión
  repetitionCount: number; // Número de repasos realizados
  idMateria?: string;
}
