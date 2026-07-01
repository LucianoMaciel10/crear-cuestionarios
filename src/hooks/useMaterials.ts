// src/hooks/useMaterials.ts
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
    const result = await materialService.addMaterial(
      nombre,
      typeof contenidoOriginal === "string"
        ? contenidoOriginal
        : new File([contenidoOriginal as ArrayBuffer], "upload"),
      tipo,
      idMateria,
    );
    return result.id;
  };

  const removeMaterial = async (id: string): Promise<void> => {
    await materialService.removeMaterial(id);
  };

  return {
    materials: materials ?? [],
    addMaterial,
    removeMaterial,
    loading: materials === undefined,
  };
}
