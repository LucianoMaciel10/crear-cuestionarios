// src/services/flashcard.service.ts
import { db } from "../data/db/dexie-db";
import type { IKnowledgeNode } from "../data/models/knowledge-node.model";

/**
 * Obtiene KnowledgeNodes para flashcards por materia.
 * KnowledgeNode es ahora la entidad principal para flashcards, reemplazando al sistema antiguo.
 * @param subjectId - Identificador de la materia
 * @returns Lista de KnowledgeNodes aptos para flashcards (tipos "concept" y "definition")
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
 * @deprecated Usar getKnowledgeNodesForSubject() directamente
 */
export async function getKnowledgeNodesForFlashcards(
  subjectId: string,
): Promise<IKnowledgeNode[]> {
  return getKnowledgeNodesForSubject(subjectId);
}
