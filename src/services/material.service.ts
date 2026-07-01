// src/services/material.service.ts
import { db } from "../data/db/dexie-db";
import type { IMaterial } from "../data/models/material.model";
import { parsePDF } from "./material-parser/pdf-parser";
import { parseDOCX } from "./material-parser/docx-parser";
import { extractKnowledgeFromMaterial } from "./knowledge-extraction/extraction-service";

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
  const extractionResult = await extractKnowledgeFromMaterial(
    crypto.randomUUID(),
    textoPlano,
  );
  // Extraer contenido procesado del resultado para compatibilidad
  const contenidoProcesado = extractionResult.legacyContent || {
    conceptos: [],
    definiciones: [],
  };

  // Crear material
  const id = crypto.randomUUID();
  const material: IMaterial = {
    id,
    nombre,
    tipo,
    contenidoOriginal,
    contenidoProcesado,
    fechaCarga: new Date(),
    idMateria,
  };

  // Guardar material en la base de datos
  await db.materiales.add(material);
  return material;
}

export async function removeMaterial(id: string): Promise<void> {
  await db.materiales.delete(id);
}
