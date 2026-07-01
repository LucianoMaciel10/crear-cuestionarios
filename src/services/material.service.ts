// src/services/material.service.ts
import { db } from "../data/db/dexie-db";
import type { IMaterial } from "../data/models/material.model";
import { processText } from "./material-parser/text-processor";
import { parsePDF } from "./material-parser/pdf-parser";
import { parseDOCX } from "./material-parser/docx-parser";
import { saveFlashcardsFromDefinitions } from "./flashcard.service";
import { extractConceptsWithAI } from "./ai/concept-extraction.service";
import {
  createKnowledgeNodesFromConcepts,
  deleteKnowledgeNodesByMaterial,
} from "./knowledge-node.service";

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
  let aiResult: Awaited<ReturnType<typeof extractConceptsWithAI>> | null = null;

  if (textoPlano !== "") {
    // Intentar con IA primero
    aiResult = await extractConceptsWithAI(textoPlano);

    if (aiResult) {
      console.log("Extracción con IA exitosa", {
        conceptos: aiResult.conceptos.length,
        definiciones: aiResult.definiciones.length,
        relaciones: aiResult.relaciones.length,
      });

      // Mapear relaciones de Mistral API al modelo local
      const relacionesMapeadas = (
        aiResult.relaciones as unknown as Array<{
          concepto1: string;
          concepto2: string;
          tipo: string;
          descripcion: string;
        }>
      ).map((r) => ({
        id: crypto.randomUUID(),
        tipo: r.tipo,
        origen: r.concepto1,
        destino: r.concepto2,
        descripcion: r.descripcion,
      }));

      contenidoProcesado = {
        ...aiResult,
        relaciones: relacionesMapeadas,
      };
    } else {
      console.warn(
        "IA no disponible, usando motor de expresiones regulares como fallback",
      );
      contenidoProcesado = await processText(textoPlano);
    }
  } else {
    contenidoProcesado = await processText(textoPlano);
  }

  // Crear nodos de conocimiento a partir de los conceptos extraídos
  const sourceType = aiResult ? "ai" : "regex";
  await createKnowledgeNodesFromConcepts(
    contenidoProcesado.conceptos,
    contenidoProcesado.definiciones,
    id, // Asociar nodos a este material
    sourceType,
  );

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
  await deleteKnowledgeNodesByMaterial(id);
  await db.materiales.delete(id);
}
