// src/services/knowledge-extraction/extraction-service.ts
/**
 * Servicio de Extracción de Conocimiento
 * Responsabilidad única: Transformar texto en KnowledgeNodes
 * Este servicio centraliza toda la lógica de extracción de conocimiento,
 * permitiendo fácil reemplazo de proveedores y manteniendo una API consistente.
 */

import type { IKnowledgeNode } from "../../data/models/knowledge-node.model";
import type { IRelacion } from "../../data/models/material.model";
import { createKnowledgeNodesFromConcepts } from "../knowledge-node.service";
import { extractConceptsWithAI } from "../ai/concept-extraction.service";
import { processText } from "../material-parser/text-processor";

/**
 * Opciones de extracción de conocimiento
 */
export interface ExtractionOptions {
  /**
   * Priorizar IA sobre regex (default: true)
   */
  preferAI?: boolean;
  /**
   * Fuente del conocimiento para metadata
   */
  sourceType?: "ai" | "regex" | "manual";
  /**
   * ID del material fuente
   */
  sourceMaterialId?: string;
}

/**
 * Resultado de la extracción de conocimiento
 */
export interface ExtractionResult {
  /**
   * IDs de los KnowledgeNodes creados
   */
  knowledgeNodeIds: string[];
  /**
   * Contenido procesado legado (para compatibilidad)
   */
  legacyContent?: {
    conceptos: string[];
    definiciones: { concepto: string; definicion: string }[];
    relaciones: IRelacion[];
  };
  /**
   * Estadísticas de la extracción
   */
  stats: {
    source: "ai" | "regex";
    conceptCount: number;
    definitionCount: number;
    relationshipCount: number;
  };
}

/**
 * Extrae conocimiento desde texto y crea KnowledgeNodes
 * @param text - Texto a analizar
 * @param options - Opciones de extracción
 * @returns Promesa con IDs de KnowledgeNodes creados y datos legacy
 */
export async function extractKnowledgeFromText(
  text: string,
  options?: ExtractionOptions,
): Promise<ExtractionResult> {
  const preferAI = options?.preferAI ?? true;
  const sourceMaterialId = options?.sourceMaterialId;

  let extractionResult;
  let source: "ai" | "regex" = "regex";

  // Intentar con IA primero si está preferida
  if (preferAI) {
    extractionResult = await extractConceptsWithAI(text);
    if (extractionResult) {
      source = "ai";
    }
  }

  // Fallback a regex si IA no está disponible o no está preferida
  if (!extractionResult) {
    extractionResult = await processText(text);
    source = "regex";
  }

  // Crear KnowledgeNodes desde los conceptos extraídos
  const knowledgeNodeIds = await createKnowledgeNodesFromConcepts(
    extractionResult.conceptos,
    extractionResult.definiciones,
    sourceMaterialId,
    source,
  );

  // Devolver resultado con datos legacy para compatibilidad
  return {
    knowledgeNodeIds,
    legacyContent: {
      conceptos: extractionResult.conceptos,
      definiciones: extractionResult.definiciones,
      relaciones: extractionResult.relaciones,
    },
    stats: {
      source,
      conceptCount: extractionResult.conceptos.length,
      definitionCount: extractionResult.definiciones.length,
      relationshipCount: extractionResult.relaciones.length,
    },
  };
}

/**
 * Extrae conocimiento desde un material existente
 * @param materialId - ID del material
 * @param content - Contenido original del material
 * @param options - Opciones de extracción
 * @returns Promesa con IDs de KnowledgeNodes creados
 */
export async function extractKnowledgeFromMaterial(
  materialId: string,
  content: string | ArrayBuffer,
  options?: ExtractionOptions,
): Promise<ExtractionResult> {
  // Convertir contenido a texto si es ArrayBuffer
  const text =
    typeof content === "string"
      ? content
      : new TextDecoder("utf-8").decode(content);

  // Extraer conocimiento del texto
  return extractKnowledgeFromText(text, {
    ...options,
    sourceMaterialId: materialId,
  });
}

/**
 * Obtiene KnowledgeNodes asociados a un material
 * @param materialId - ID del material
 * @returns Promesa con KnowledgeNodes
 */
export async function getKnowledgeNodesByMaterial(
  materialId: string,
): Promise<IKnowledgeNode[]> {
  const { getKnowledgeNodesByMaterial } =
    await import("../knowledge-node.service");
  return getKnowledgeNodesByMaterial(materialId);
}
