// src/services/flashcard.service.ts
import { db } from "../data/db/dexie-db";
import type { IKnowledgeNode } from "../data/models/knowledge-node.model";

/**
 * Obtiene KnowledgeNodes para flashcards por materia.
 * @param subjectId - Identificador de la materia
 * @returns Lista de KnowledgeNodes aptos para flashcards
 */
export async function getKnowledgeNodesForSubject(
  subjectId: string,
): Promise<IKnowledgeNode[]> {
  const allNodes = await db.knowledgeNodes.toArray();
  return allNodes.filter(
    (node) =>
      node.subjectId === subjectId &&
      (node.type === "concept" || node.type === "definition"),
  );
}

/**
 * Obtiene KnowledgeNodes para flashcards por materia (alternativa a getFlashcardsFromKnowledgeNodes)
 */
export async function getKnowledgeNodesForFlashcards(
  subjectId: string,
): Promise<IKnowledgeNode[]> {
  return getKnowledgeNodesForSubject(subjectId);
}
