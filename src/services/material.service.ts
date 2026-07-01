// src/services/material.service.ts
import { db } from "../data/db/dexie-db";
import type { IMaterial } from "../data/models/material.model";
import { parsePDF } from "./material-parser/pdf-parser";
import { parseDOCX } from "./material-parser/docx-parser";
import { saveFlashcardsFromDefinitions } from "./flashcard.service";
import { extractKnowledgeFromMaterial } from "./knowledge-extraction/extraction-service";

/**
 * Obtiene todos los materiales almacenados.
 */
export async function getAll(): Promise<IMaterial[]> {
  return db.materiales.toArray();
}

/**
 * Crea un nuevo material respetando estrictamente la interfaz IMaterial.
 * @param nombre - Nombre del material.
 * @param tipo - Tipo de archivo.
 * @param contenidoOriginal - Contenido opcional (string o ArrayBuffer).
 * @param idMateria - Identificador de la materia.
 * @returns El identificador generado.
 */
export async function add(
  nombre: string,
  tipo: "texto" | "pdf" | "docx" | "txt" | "md",
  contenidoOriginal?: string | ArrayBuffer,
  idMateria?: string,
): Promise<string> {
  const id = crypto.randomUUID();
  let textoPlano = "";

  if (contenidoOriginal) {
    if (typeof contenidoOriginal === "string") {
      textoPlano = contenidoOriginal;
    } else {
      // Parsear según el tipo de archivo
      switch (tipo) {
        case "pdf":
          textoPlano = await parsePDF(contenidoOriginal);
          break;
        case "docx":
          textoPlano = await parseDOCX(contenidoOriginal);
          break;
        default:
          textoPlano = new TextDecoder("utf-8").decode(contenidoOriginal);
      }
    }
  }

  // Delegar extracción de conocimiento al servicio especializado
  const extractionResult = await extractKnowledgeFromMaterial(id, textoPlano, {
    preferAI: true,
    sourceMaterialId: id,
  });

  // Extraer contenido procesado del resultado para compatibilidad
  const contenidoProcesado = extractionResult.legacyContent || {
    conceptos: [],
    definiciones: [],
    relaciones: [],
  };

  if (idMateria && contenidoProcesado.definiciones.length > 0) {
    await saveFlashcardsFromDefinitions(
      contenidoProcesado.definiciones,
      idMateria,
    );
  }

  const nuevoMaterial: IMaterial = {
    id,
    nombre,
    tipo,
    contenidoOriginal,
    contenidoProcesado,
    fechaCarga: new Date(),
    idMateria,
  };

  await db.materiales.add(nuevoMaterial);
  return id;
}

/**
 * Elimina un material existente por su ID.
 * @param id - Identificador del material.
 */
export async function remove(id: string): Promise<void> {
  // Eliminar nodos de conocimiento asociados
  const { deleteKnowledgeNodesByMaterial } =
    await import("./knowledge-node.service");
  await deleteKnowledgeNodesByMaterial(id);
  await db.materiales.delete(id);
}
