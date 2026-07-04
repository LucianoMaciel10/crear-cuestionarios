// src/services/material.service.ts
import { db } from "../data/db/dexie-db";
import type { IMaterial } from "../data/models/material.model";
import { parsePDF } from "./material-parser/pdf-parser";
import { parsePPTX } from "./material-parser/pptx-parser";
import { extractKnowledgeFromMaterial } from "./knowledge-extraction/extraction-service";
import { BatchProcessor } from "./batch-processing/batch-processor";
import { batchCache } from "./batch-processing/batch-cache";
import type { ProcessingStage } from "../types/shared-types";

/**
 * Obtiene todos los materiales almacenados.
 */
export async function getAllMaterials(): Promise<IMaterial[]> {
  return db.materiales.toArray();
}

export async function getMaterialsBySubject(
  subjectId: string,
): Promise<IMaterial[]> {
  return db.materiales.where("idMateria").equals(subjectId).toArray();
}

/**
 * Crea un material con estado inicial
 */
export async function createMaterial(
  nombre: string,
  tipo: "texto" | "pdf" | "pptx" | "txt" | "md",
  contenidoOriginal?: string | ArrayBuffer,
  idMateria?: string,
  originalFilename?: string,
  fileType?: string,
): Promise<IMaterial> {
  const id = crypto.randomUUID();
  const material: IMaterial = {
    id,
    nombre,
    tipo,
    contenidoOriginal,
    fechaCarga: new Date(),
    idMateria,
    processingStatus: "pending",
    processingStartedAt: new Date(),
    originalFilename,
    fileType,
  };

  await db.materiales.add(material);
  return material;
}

/**
 * Actualiza el estado de procesamiento de un material
 */
export async function updateMaterialProcessingStatus(
  materialId: string,
  status: "processing" | "completed" | "failed",
  error?: string,
  stats?: {
    conceptCount?: number;
    definitionCount?: number;
    questionCount?: number;
  },
): Promise<void> {
  const updateData: Partial<IMaterial> = {
    processingStatus: status,
    processingFinishedAt: new Date(),
  };

  if (error) {
    updateData.processingError = error;
  }

  if (stats) {
    updateData.conceptCount = stats.conceptCount;
    updateData.definitionCount = stats.definitionCount;
    updateData.questionCount = stats.questionCount;
  }

  await db.materiales.update(materialId, updateData);
}

/**
 * Procesa un solo material (versión legacy para compatibilidad)
 */
export async function addMaterial(
  nombre: string,
  contenido: File | string,
  tipo: "texto" | "pdf" | "pptx" | "txt" | "md",
  idMateria?: string,
): Promise<IMaterial> {
  let contenidoOriginal: string | ArrayBuffer | undefined;
  let textoPlano = "";

  // Parsear contenido según tipo
  if (typeof contenido === "string") {
    contenidoOriginal = contenido;
    textoPlano = contenido;
  } else if (contenido instanceof File) {
    if (contenido.type === "application/pdf") {
      contenidoOriginal = await contenido.arrayBuffer();
      textoPlano = await parsePDF(contenidoOriginal);
    } else if (
      contenido.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      contenidoOriginal = await contenido.arrayBuffer();
      textoPlano = await parsePPTX(contenidoOriginal);
    } else {
      contenidoOriginal = await contenido.text();
      textoPlano = contenidoOriginal;
    }
  }

  // Crear material primero
  const material = await createMaterial(
    nombre,
    tipo,
    contenidoOriginal,
    idMateria,
    typeof contenido === "string" ? undefined : contenido.name,
    tipo,
  );

  try {
    // Extraer conocimiento usando el nuevo servicio
    await extractKnowledgeFromMaterial(material.id, textoPlano, {
      sourceMaterialId: material.id,
      sourceType: "ai",
    });

    // Actualizar estado a completado
    await updateMaterialProcessingStatus(material.id, "completed");
    return material;
  } catch (error) {
    await updateMaterialProcessingStatus(
      material.id,
      "failed",
      error instanceof Error ? error.message : "Error desconocido",
    );
    throw error;
  }
}

/**
 * Procesa múltiples archivos en batch con conversión a Markdown
 */
export async function processBatchMaterials(
  files: File[],
  subjectId: string,
  options: {
    preferAI?: boolean;
    generateQuestions?: boolean;
    onProgress?: (stages: ProcessingStage[]) => void;
  } = {},
): Promise<{
  success: boolean;
  materials: {
    id: string;
    name: string;
    markdownContent: string;
    knowledgeNodeIds: string[];
    questionIds?: string[];
  }[];
  stats: {
    totalFiles: number;
    processedFiles: number;
    knowledgeNodesCreated: number;
    questionsGenerated: number;
  };
}> {
  // Inicializar caché
  await batchCache.initialize();

  // Crear procesador por lotes
  const processor = new BatchProcessor({
    subjectId,
    preferAI: options.preferAI ?? true,
    generateQuestions: options.generateQuestions ?? true,
  });

  // Registrar callback de progreso si se proporciona
  if (options.onProgress) {
    // Simular notificaciones de progreso
    const interval = setInterval(() => {
      options.onProgress?.(processor.getStages());
    }, 200);

    // Limpiar intervalo al finalizar
    try {
      const result = await processor.processFiles(files);
      clearInterval(interval);
      options.onProgress?.(processor.getStages());
      return result;
    } catch (error) {
      clearInterval(interval);
      options.onProgress?.(processor.getStages());
      throw error;
    }
  }

  // Procesar archivos
  return processor.processFiles(files);
}

export async function removeMaterial(id: string): Promise<void> {
  await db.materiales.delete(id);
}
