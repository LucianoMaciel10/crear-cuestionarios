// src/services/flashcard.service.ts
import { db } from "../data/db/dexie-db";
import type { ISpacedRepetitionData } from "../data/models/spaced-repetition.model";

/**
 * Obtiene todas las flashcards almacenadas.
 */
export async function getAllFlashcards(): Promise<ISpacedRepetitionData[]> {
  return db.flashcards.toArray();
}

/**
 * Guarda una flashcard en la base de datos.
 * @param flashcard - Flashcard a guardar.
 */
export async function saveFlashcard(
  flashcard: ISpacedRepetitionData,
): Promise<void> {
  await db.flashcards.add(flashcard);
}

/**
 * Actualiza una flashcard en la base de datos.
 * @param flashcard - Flashcard actualizada.
 */
export async function updateFlashcard(
  flashcard: ISpacedRepetitionData,
): Promise<void> {
  await db.flashcards.update(flashcard.id, flashcard);
}

/**
 * Elimina una flashcard por su ID.
 * @param id - Identificador de la flashcard.
 */
export async function removeFlashcard(id: string): Promise<void> {
  await db.flashcards.delete(id);
}
