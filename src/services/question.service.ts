// src/services/question.service.ts
import { db } from "../data/db/dexie-db";
import type { IQuestion, IQuizAttempt } from "../data/models";

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
 * Elimina todas las preguntas asociadas a un material.
 * @param materialId - Identificador del material.
 */
export async function removeQuestionsByMaterial(
  materialId: string,
): Promise<void> {
  await db.questions.where("sourceMaterialId").equals(materialId).delete();
}

/**
 * Elimina todas las preguntas asociadas a un tema.
 * @param topic - Tema de las preguntas a eliminar.
 * @deprecated Usar removeQuestionsByMaterial() en su lugar.
 */
export async function removeQuestionsByTopic(topic: string): Promise<void> {
  await db.questions.where("topic").equals(topic).delete();
}

/**
 * Elimina una pregunta por su ID.
 * @param id - Identificador de la pregunta.
 */
export async function removeQuestion(id: string): Promise<void> {
  await db.questions.delete(id);
}

export async function getQuestionsBySubject(
  subjectId: string,
): Promise<IQuestion[]> {
  return db.questions.where("idMateria").equals(subjectId).toArray();
}

export async function saveQuizAttempts(
  attempts: IQuizAttempt[],
): Promise<void> {
  await db.quizAttempts.bulkAdd(attempts);
}

export async function getQuizAttemptsBySubject(
  subjectId: string,
): Promise<IQuizAttempt[]> {
  return db.quizAttempts.where("idMateria").equals(subjectId).toArray();
}

export async function getExistingTopicsBySubject(
  subjectId: string,
): Promise<Set<string>> {
  const questions = await getQuestionsBySubject(subjectId);
  return new Set(questions.map((q) => q.topic.toLowerCase()));
}
