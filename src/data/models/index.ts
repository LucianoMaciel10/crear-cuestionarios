// Barrel file para exportar modelos
// Mantiene single source of truth importando desde los archivos individuales

export type { IMaterial, IEtiqueta, IRelacion } from "./material.model";
export type { IMateria } from "./materia.model";
export type { IQuestion, IQuizAttempt } from "./question.model";
export type { IKnowledgeNode } from "./knowledge-node.model";
// Exportación marcada como obsoleta para compatibilidad temporal
export type { ISpacedRepetitionData as ISpacedRepetitionData } from "./spaced-repetition.model";
