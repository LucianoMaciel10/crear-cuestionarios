import { db } from "../data/db/dexie-db";
import type { IMaterial } from "../data/models/material.model";
import { parseText } from "./material-parser/text-parser";
import { processText } from "./material-parser/text-processor";

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
  idMateria?: string
): Promise<string> {
  const id = crypto.randomUUID();
  const textoPlano = await parseText(contenidoOriginal ?? "");
  const contenidoProcesado = await processText(textoPlano);

  const nuevoMaterial: IMaterial = {
    id,
    nombre,
    tipo,
    contenidoOriginal,
    contenidoProcesado,
    fechaCarga: new Date(),
    idMateria
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
