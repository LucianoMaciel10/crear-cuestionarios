// src/services/spaced-repetition/sm2-algorithm.ts
import type { ISpacedRepetitionData } from "../../data/models/spaced-repetition.model";

/**
 * Calcula la próxima fecha de repaso utilizando el algoritmo SM-2.
 * @param card - Datos de la flashcard.
 * @param quality - Calidad de la respuesta (0-5).
 * @returns Datos actualizados de la flashcard.
 */
export function calculateNextReview(
  card: ISpacedRepetitionData,
  quality: number,
): ISpacedRepetitionData {
  const today = new Date();

  // Asegurarse de que la calidad esté en el rango válido (0-5)
  const clampedQuality = Math.max(0, Math.min(5, quality));

  // Actualizar el factor de facilidad (EF)
  const newEaseFactor =
    clampedQuality >= 3
      ? Math.max(
          1.3,
          card.easeFactor +
            0.1 -
            (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02),
        )
      : Math.max(1.3, card.easeFactor - 0.2);

  // Calcular el nuevo intervalo de repetición
  const newRepetitionInterval =
    card.repetitionCount === 0
      ? 1
      : card.repetitionCount === 1
        ? 6
        : Math.ceil(card.repetitionInterval * newEaseFactor);

  // Calcular la próxima fecha de repaso
  const nextReviewDate = new Date(today);
  nextReviewDate.setDate(today.getDate() + newRepetitionInterval);

  // Actualizar el contador de repasos
  const newRepetitionCount = clampedQuality >= 3 ? card.repetitionCount + 1 : 0;

  return {
    ...card,
    easeFactor: newEaseFactor,
    repetitionInterval: newRepetitionInterval,
    lastReviewDate: today,
    nextReviewDate,
    repetitionCount: newRepetitionCount,
  };
}

/**
 * Crea una nueva flashcard con valores iniciales para el algoritmo SM-2.
 * @param concept - Concepto de la flashcard.
 * @param definition - Definición del concepto.
 * @param explanation - Explicación opcional.
 * @param idMateria - Identificador de la materia.
 * @returns Nueva flashcard con datos de repetición espaciada.
 */
export function createNewFlashcard(
  concept: string,
  definition: string,
  explanation?: string,
  idMateria?: string,
): ISpacedRepetitionData {
  return {
    id: crypto.randomUUID(),
    concept,
    definition,
    explanation,
    easeFactor: 2.5, // Factor de facilidad inicial
    repetitionInterval: 0, // Intervalo inicial (0 días)
    lastReviewDate: null, // No se ha revisado aún
    nextReviewDate: null, // No se ha calculado aún
    repetitionCount: 0, // No se ha repasado aún
    idMateria,
  };
}
