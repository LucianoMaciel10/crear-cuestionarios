// src/services/material.service.ts
import { db } from '../data/db/dexie-db';
import type { IMaterial } from '../data/models/material.model';

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
 * @returns El identificador generado.
 */
export async function add(
  nombre: string,
  tipo: 'texto' | 'pdf' | 'docx' | 'txt' | 'md',
  contenidoOriginal?: string | ArrayBuffer
): Promise<string> {
  const id = crypto.randomUUID();
  const nuevoMaterial: IMaterial = {
    id,
    nombre,
    tipo,
    contenidoOriginal,
    contenidoProcesado: {
      conceptos: [],
      definiciones: [],
      relaciones: []
    },
    fechaCarga: new Date()
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
