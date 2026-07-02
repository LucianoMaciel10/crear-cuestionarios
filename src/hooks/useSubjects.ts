import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../data/db/dexie-db";
import * as subjectService from "../services/subject.service";

/**
 * Hook para gestionar las materias.
 * Utiliza useLiveQuery para mantener la lista actualizada automáticamente.
 */
export function useSubjects() {
  // Sincroniza automáticamente los datos de la tabla 'materias'
  const subjects = useLiveQuery(() => db.materias.toArray(), []);

  /**
   * Crea una nueva materia.
   * @param nombre Nombre de la materia.
   */
  async function addSubject(nombre: string): Promise<void> {
    await subjectService.add(nombre);
  }

  /**
   * Elimina una materia por su ID.
   * @param id Identificador de la materia.
   */
  async function removeSubject(id: string): Promise<void> {
    await subjectService.remove(id);
  }

  /**
   * Actualiza una materia.
   * @param id Identificador de la materia.
   * @param nombre Nuevo nombre de la materia.
   */
  async function editSubject(id: string, nombre: string): Promise<void> {
    await subjectService.update(id, nombre);
  }

  return {
    subjects: subjects ?? [],
    addSubject,
    removeSubject,
    editSubject,
    loading: subjects === undefined,
  };
}
