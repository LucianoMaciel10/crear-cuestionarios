// src/services/subject.service.ts
import { db } from "../data/db/dexie-db";
import type { IMateria } from "../data/models/materia.model";

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
    descripcion: "",
  };
  await db.materias.add(nuevaMateria);
  return id;
}

/**
 * Actualiza una materia existente.
 *
 * @param id - Identificador de la materia a actualizar.
 * @param nombre - Nuevo nombre de la materia.
 */
export async function update(id: string, nombre: string): Promise<void> {
  await db.materias.update(id, { nombre });
}

/**
 * Elimina una materia existente a partir de su ID.
 * Realiza eliminación en cascada de todos los datos asociados.
 *
 * @param id - Identificador de la materia a borrar.
 */
export async function remove(id: string): Promise<void> {
  const materialesIds = await db.materiales
    .where("idMateria")
    .equals(id)
    .primaryKeys();
  const questionsIds = await db.questions
    .where("idMateria")
    .equals(id)
    .primaryKeys();
  const attemptsIds = await db.quizAttempts
    .where("idMateria")
    .equals(id)
    .primaryKeys();
  const knowledgeNodesIds = await db.knowledgeNodes
    .where("subjectId")
    .equals(id)
    .primaryKeys();

  await db.materiales.bulkDelete(materialesIds as string[]);
  await db.questions.bulkDelete(questionsIds as string[]);
  await db.quizAttempts.bulkDelete(attemptsIds as string[]);
  await db.knowledgeNodes.bulkDelete(knowledgeNodesIds as string[]);
  await db.materias.delete(id);
}
