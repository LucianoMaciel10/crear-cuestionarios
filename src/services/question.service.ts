// src/services/question.service.ts
import { db } from '../data/db/dexie-db';
import type { IQuestion } from '../data/models';

/**
 * Obtiene todas las preguntas almacenadas.
 */
export async function getAllQuestions(): Promise<IQuestion[]> {
  return db.questions.toArray();
}

/**
 * Guarda una lista de preguntas en la base de datos.
 * @param questions - Lista de preguntas a guardar.
 */
export async function saveQuestions(questions: IQuestion[]): Promise<void> {
  await db.questions.bulkAdd(questions);
}

/**
 * Elimina todas las preguntas asociadas a un tema.
 * @param topic - Tema de las preguntas a eliminar.
 */
export async function removeQuestionsByTopic(topic: string): Promise<void> {
  await db.questions.where('topic').equals(topic).delete();
}

/**
 * Elimina una pregunta por su ID.
 * @param id - Identificador de la pregunta.
 */
export async function removeQuestion(id: string): Promise<void> {
  await db.questions.delete(id);
}