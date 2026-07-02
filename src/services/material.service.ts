// src/services/material.service.ts
import { db } from "../data/db/dexie-db";
import type { IMaterial } from "../data/models/material.model";
import { parsePDF } from "./material-parser/pdf-parser";
import { parseDOCX } from "./material-parser/docx-parser";
import { extractKnowledgeFromMaterial } from "./knowledge-extraction/extraction-service";
import { BatchProcessor } from "./batch-processing/batch-processor";
import { batchCache } from "./batch-processing/batch-cache";
import type { ProcessingStage } from "../components/AddMaterialModal";

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
 * Procesa un solo material (versión legacy para compatibilidad)
 */
export async function addMaterial(
  nombre: string,
  contenido: File | string,
  tipo: "texto" | "pdf" | "docx" | "txt" | "md",
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      contenidoOriginal = await contenido.arrayBuffer();
      textoPlano = await parseDOCX(contenidoOriginal);
    } else {
      contenidoOriginal = await contenido.text();
      textoPlano = contenidoOriginal;
    }
  }

  // Extraer conocimiento usando el nuevo servicio
  await extractKnowledgeFromMaterial(crypto.randomUUID(), textoPlano, {
    sourceMaterialId: crypto.randomUUID(),
    sourceType: "ai",
  });

  // Crear material sin contenidoProcesado
  const id = crypto.randomUUID();
  const material: IMaterial = {
    id,
    nombre,
    tipo,
    contenidoOriginal,
    fechaCarga: new Date(),
    idMateria,
  };

  // Guardar material en la base de datos
  await db.materiales.add(material);
  return material;
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
