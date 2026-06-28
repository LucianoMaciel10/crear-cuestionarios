import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../data/db/dexie-db";
import * as materialService from "../services/material.service";

/**
 * Hook para gestionar los materiales.
 * Utiliza useLiveQuery para mantener la lista actualizada automáticamente.
 */
export function useMaterials(subjectId?: string) {
  const materials = useLiveQuery(() =>
    subjectId
      ? db.materiales.where("idMateria").equals(subjectId).toArray()
      : db.materiales.toArray(),
  );

  const addMaterial = async (
    nombre: string,
    tipo: "texto" | "pdf" | "docx" | "txt" | "md",
    contenidoOriginal?: string | ArrayBuffer,
    idMateria?: string,
  ): Promise<string> => {
    return await materialService.add(
      nombre,
      tipo,
      contenidoOriginal,
      idMateria,
    );
  };

  const removeMaterial = async (id: string): Promise<void> => {
    await materialService.remove(id);
  };

  return {
    materials: materials ?? [],
    addMaterial,
    removeMaterial,
    loading: materials === undefined,
  };
}
