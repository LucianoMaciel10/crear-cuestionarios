// src/services/material.service.ts
import { db } from "../data/db/dexie-db";
import type { IMaterial } from "../data/models/material.model";
import { processText } from "./material-parser/text-processor";
import { parsePDF } from "./material-parser/pdf-parser";
import { parseDOCX } from "./material-parser/docx-parser";
import { saveFlashcardsFromDefinitions } from "./flashcard.service";
import { extractConceptsWithAI } from "./ai/concept-extraction.service";

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

  let contenidoProcesado;
  if (textoPlano !== "") {
    const aiResult = await extractConceptsWithAI(textoPlano);
    contenidoProcesado = aiResult || (await processText(textoPlano));
  } else {
    contenidoProcesado = await processText(textoPlano);
  }

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
  await db.materiales.delete(id);
}
