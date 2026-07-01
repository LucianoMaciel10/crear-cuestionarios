// Barrel file para exportar modelos
// Mantiene single source of truth importando desde los archivos individuales

export type {
  IMaterial,
  IEtiqueta,
  IRelacion,
  IContenidoProcesado,
} from "./material.model";
export type { IMateria } from "./materia.model";
export type { IQuestion, IQuizAttempt } from "./question.model";
export type { ISpacedRepetitionData } from "./spaced-repetition.model";
export type { IKnowledgeNode } from "./knowledge-node.model";
