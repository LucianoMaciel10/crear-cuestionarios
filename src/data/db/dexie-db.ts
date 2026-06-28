import { Dexie } from "dexie";
import type { IMaterial, IMateria, IEtiqueta, IQuestion } from "../models";

class CuestionarioDB extends Dexie {
  materiales!: Dexie.Table<IMaterial, string>;
  materias!: Dexie.Table<IMateria, string>;
  etiquetas!: Dexie.Table<IEtiqueta, string>;
  questions!: Dexie.Table<IQuestion, string>;

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
  }
}

export const db = new CuestionarioDB();

// Validación de conexión
db.open()
  .then(() => console.log("Database opened successfully"))
  .catch((err) => console.error("Failed to open db:", err));
