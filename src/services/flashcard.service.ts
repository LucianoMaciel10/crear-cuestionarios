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

export async function getFlashcardsBySubject(
  subjectId: string,
): Promise<ISpacedRepetitionData[]> {
  return db.flashcards.where("idMateria").equals(subjectId).toArray();
}

export async function saveFlashcardsFromDefinitions(
  definitions: { concepto: string; definicion: string }[],
  idMateria: string,
): Promise<void> {
  const existingFlashcards = await getFlashcardsBySubject(idMateria);
  const existingConcepts = new Set(
    existingFlashcards.map((c) => c.concept.toLowerCase()),
  );

  const { createNewFlashcard } =
    await import("./spaced-repetition/sm2-algorithm");

  const newFlashcards = definitions
    .filter((def) => !existingConcepts.has(def.concepto.toLowerCase()))
    .map((def) =>
      createNewFlashcard(def.concepto, def.definicion, undefined, idMateria),
    );

  if (newFlashcards.length > 0) {
    await db.flashcards.bulkAdd(newFlashcards);
  }
}
