import { db } from '../data/db/dexie-db';
import type { IMateria } from '../data/models/materia.model';

/**
 * Obtiene todas las materias almacenadas en IndexedDB.
 */
export async function getAll(): Promise<IMateria[]> {
  return db.materias.toArray();
}

/**
 * Crea una nueva materia.
 * Solo requiere el nombre; la descripción se inicializa a cadena vacía.
 *
 * @param nombre - Nombre de la materia a crear.
 * @returns El ID (string) generado para la nueva materia.
 */
export async function add(nombre: string): Promise<string> {
  const id = crypto.randomUUID(); // Genera ID único tipo string
  const nuevaMateria: IMateria = {
    id,
    nombre,
    descripcion: ''
  };
  await db.materias.add(nuevaMateria);
  return id;
}

/**
 * Elimina una materia existente a partir de su ID.
 *
 * @param id - Identificador de la materia a borrar.
 */
export async function remove(id: string): Promise<void> {
  await db.materias.delete(id);
}
