// src/services/knowledge-node.service.ts
import { db } from "../data/db/dexie-db";
import type { IKnowledgeNode } from "../data/models/knowledge-node.model";
import { getOCRTextCleaner } from "../services/ocr/ocr-text-cleaner.service";

/**
 * Obtiene todos los nodos de conocimiento almacenados.
 * @returns Promesa con array de IKnowledgeNode
 */
export async function getAllKnowledgeNodes(): Promise<IKnowledgeNode[]> {
  return db.knowledgeNodes.toArray();
}

/**
 * Obtiene nodos de conocimiento por tipo.
 * @param type - Tipo de nodo (concept, definition, relationship, example)
 * @returns Promesa con array de IKnowledgeNode del tipo especificado
 */
export async function getKnowledgeNodesByType(
  type: IKnowledgeNode["type"],
): Promise<IKnowledgeNode[]> {
  return db.knowledgeNodes.where("type").equals(type).toArray();
}

/**
 * Obtiene nodos de conocimiento asociados a un material.
 * @param materialId - ID del material
 * @returns Promesa con array de IKnowledgeNode
 */
export async function getKnowledgeNodesByMaterial(
  materialId: string,
): Promise<IKnowledgeNode[]> {
  return db.knowledgeNodes
    .where("sourceMaterialId")
    .equals(materialId)
    .toArray();
}

/**
 * Crea un nuevo nodo de conocimiento.
 * @param node - Nodo de conocimiento a crear
 * @returns Promesa con el ID del nodo creado
 */
export async function createKnowledgeNode(
  node: Omit<IKnowledgeNode, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const id = crypto.randomUUID();
  const newNode: IKnowledgeNode = {
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...node,
  };
  await db.knowledgeNodes.add(newNode);
  return id;
}

/**
 * Actualiza un nodo de conocimiento existente.
 * @param node - Nodo de conocimiento con los datos actualizados
 * @returns Promesa que se resuelve al completar la actualización
 */
export async function updateKnowledgeNode(node: IKnowledgeNode): Promise<void> {
  await db.knowledgeNodes.update(node.id, {
    ...node,
    updatedAt: new Date(),
  });
}

/**
 * Elimina un nodo de conocimiento.
 * @param id - ID del nodo a eliminar
 * @returns Promesa que se resuelve al completar la eliminación
 */
export async function deleteKnowledgeNode(id: string): Promise<void> {
  await db.knowledgeNodes.delete(id);
}

/**
 * Elimina todos los nodos de conocimiento asociados a un material.
 * @param materialId - ID del material
 * @returns Promesa que se resuelve al completar la eliminación
 */
export async function deleteKnowledgeNodesByMaterial(
  materialId: string,
): Promise<void> {
  const nodes = await db.knowledgeNodes
    .where("sourceMaterialId")
    .equals(materialId)
    .toArray();
  const nodeIds = nodes.map((node) => node.id);
  await db.knowledgeNodes.bulkDelete(nodeIds);
}

/**
 * Crea nodos de conocimiento a partir de conceptos y definiciones.
 * @param concepts - Array de conceptos
 * @param definitions - Array de definiciones
 * @param sourceMaterialId - ID del material fuente
 * @param sourceType - Tipo de fuente (ai, regex, manual)
 * @returns Promesa con array de IDs de los nodos creados
 */
export async function createKnowledgeNodesFromConcepts(
  concepts: string[],
  definitions: { concepto: string; definicion: string }[],
  sourceMaterialId?: string,
  sourceType: "ai" | "regex" | "manual" = "ai",
): Promise<string[]> {
  const createdIds: string[] = [];
  const ocrTextCleaner = getOCRTextCleaner();

  // Filtrar conceptos válidos
  const validConcepts = concepts.filter((concept) =>
    ocrTextCleaner.isValidConcept(concept),
  );

  // Limitar cantidad de conceptos (máximo 100)
  const limitedConcepts = validConcepts.slice(0, 100);

  // Crear nodos para conceptos válidos
  for (const concept of limitedConcepts) {
    const conceptId = await createKnowledgeNode({
      type: "concept",
      content: concept,
      sourceMaterialId,
      metadata: {
        extraction: {
          confidence: sourceType === "ai" ? 0.9 : 0.7,
          sourceType,
        },
        spacedRepetition: {
          algorithm: "sm2",
          currentState: {
            easeFactor: 2.5,
            stability: 0,
            difficulty: 2.5,
            repetitionCount: 0,
            lastReviewDate: null,
            nextReviewDate: null,
            sm2: {
              interval: 0,
            },
          },
          reviewHistory: [],
        },
      },
    });
    createdIds.push(conceptId);
  }

  // Filtrar definiciones válidas
  const validDefinitions = definitions.filter(
    (def) =>
      ocrTextCleaner.isValidConcept(def.concepto) && def.definicion.length > 10,
  );

  // Crear nodos para definiciones válidas
  for (const definition of validDefinitions) {
    const definitionId = await createKnowledgeNode({
      type: "definition",
      content: `${definition.concepto}: ${definition.definicion}`,
      sourceMaterialId,
      metadata: {
        extraction: {
          confidence: sourceType === "ai" ? 0.85 : 0.65,
          sourceType,
        },
        spacedRepetition: {
          algorithm: "sm2",
          currentState: {
            easeFactor: 2.5,
            stability: 0,
            difficulty: 2.5,
            repetitionCount: 0,
            lastReviewDate: null,
            nextReviewDate: null,
            sm2: {
              interval: 0,
            },
          },
          reviewHistory: [],
        },
      },
    });
    createdIds.push(definitionId);
  }

  return createdIds;
}
