// src/data/db/dexie-db.ts
import { Dexie } from "dexie";
import type {
  IMaterial,
  IMateria,
  IEtiqueta,
  IQuestion,
  IQuizAttempt,
  IKnowledgeNode,
} from "../models";

class CuestionarioDB extends Dexie {
  materiales!: Dexie.Table<IMaterial, string>;
  materias!: Dexie.Table<IMateria, string>;
  etiquetas!: Dexie.Table<IEtiqueta, string>;
  questions!: Dexie.Table<IQuestion, string>;
  quizAttempts!: Dexie.Table<IQuizAttempt, string>;
  knowledgeNodes!: Dexie.Table<IKnowledgeNode, string>;

  constructor() {
    super("CuestionarioDB");

    this.version(1).stores({
      materiales: "id, nombre, tipo, fechaCarga",
      materias: "id, nombre",
      etiquetas: "id, nombre",
    });

    this.version(2).stores({
      materiales: "id, nombre, tipo, fechaCarga",
      materias: "id, nombre",
      etiquetas: "id, nombre",
      questions: "id, topic, difficulty",
    });

    this.version(3).stores({
      materiales: "id, nombre, tipo, fechaCarga",
      materias: "id, nombre",
      etiquetas: "id, nombre",
      questions: "id, topic, difficulty",
      quizAttempts: "id, questionId, idMateria, topic, answeredAt",
    });

    this.version(4).stores({
      materiales: "id, nombre, tipo, fechaCarga",
      materias: "id, nombre",
      etiquetas: "id, nombre",
      questions: "id, topic, difficulty",
      quizAttempts: "id, questionId, idMateria, topic, answeredAt",
    });

    this.version(5).stores({
      materiales: "id, nombre, tipo, fechaCarga",
      materias: "id, nombre",
      etiquetas: "id, nombre",
      questions: "id, topic, difficulty, idMateria",
      quizAttempts: "id, questionId, idMateria, topic, answeredAt",
    });

    this.version(6).stores({
      materiales: "id, nombre, tipo, fechaCarga",
      materias: "id, nombre",
      etiquetas: "id, nombre",
      questions: "id, topic, difficulty, idMateria",
      quizAttempts: "id, questionId, idMateria, topic, answeredAt",
    });

    this.version(7).stores({
      materiales: "id, nombre, tipo, fechaCarga, idMateria",
      materias: "id, nombre",
      etiquetas: "id, nombre",
      questions: "id, topic, difficulty, idMateria",
      quizAttempts: "id, questionId, idMateria, topic, answeredAt",
    });

    this.version(8).stores({
      materiales: "id, nombre, tipo, fechaCarga, idMateria",
      materias: "id, nombre",
      etiquetas: "id, nombre",
      questions: "id, topic, difficulty, idMateria",
      quizAttempts: "id, questionId, idMateria, topic, answeredAt",
      knowledgeNodes: "id, type, content, sourceMaterialId, createdAt",
    });
  }
}

export const db = new CuestionarioDB();

db.open()
  .then(() => console.log("Database opened successfully"))
  .catch((err) => console.error("Failed to open db:", err));
