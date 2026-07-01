// src/services/flashcard.service.ts
import { db } from "../data/db/dexie-db";
import type { ISpacedRepetitionData } from "../data/models/spaced-repetition.model";
import { knowledgeNodeToFlashcard } from "./adapters/knowledge-node-adapter";

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

/**
 * Obtiene flashcards desde KnowledgeNodes para una materia específica.
 * @param subjectId - Identificador de la materia
 * @returns Lista de flashcards convertidas desde KnowledgeNodes
 */
export async function getFlashcardsFromKnowledgeNodes(
  subjectId: string,
): Promise<ISpacedRepetitionData[]> {
  const knowledgeNodes = await db.knowledgeNodes
    .where("subjectId")
    .equals(subjectId)
    .toArray();

  return knowledgeNodes
    .filter((node) => node.type === "concept" || node.type === "definition")
    .map(knowledgeNodeToFlashcard);
}

/**
 * Obtiene todas las flashcards (combinando ambos sistemas).
 * Prioriza KnowledgeNodes, luego usa flashcards tradicionales.
 * @param subjectId - Identificador de la materia
 * @returns Lista combinada de flashcards
 */
export async function getAllFlashcardsForSubject(
  subjectId: string,
): Promise<ISpacedRepetitionData[]> {
  // Primero intentar obtener desde KnowledgeNodes
  const knowledgeNodeFlashcards =
    await getFlashcardsFromKnowledgeNodes(subjectId);

  if (knowledgeNodeFlashcards.length > 0) {
    return knowledgeNodeFlashcards;
  }

  // Si no hay KnowledgeNodes, usar el sistema tradicional
  return getFlashcardsBySubject(subjectId);
}
