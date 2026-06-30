// src/services/ai/concept-extraction.service.ts
import type { IContenidoProcesado } from "../../data/models/material.model";

export async function extractConceptsWithAI(
  text: string,
): Promise<IContenidoProcesado | null> {
  // Verificar conexión a internet
  if (!navigator.onLine) {
    return null;
  }

  try {
    // Llamar a la función serverless
    const response = await fetch("/api/extract-concepts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    // Verificar respuesta
    if (!response.ok) {
      return null;
    }

    // Parsear respuesta
    const data: unknown = await response.json();

    // Validar estructura
    if (
      typeof data !== "object" ||
      data === null ||
      !("conceptos" in data) ||
      !("definiciones" in data) ||
      !("relaciones" in data) ||
      !Array.isArray(data.conceptos) ||
      !Array.isArray(data.definiciones) ||
      !Array.isArray(data.relaciones)
    ) {
      return null;
    }

    // Validar tipos de los elementos
    const conceptos = data.conceptos as unknown[];
    const definiciones = data.definiciones as unknown[];

    if (
      !conceptos.every((c) => typeof c === "string") ||
      !definiciones.every(
        (d) =>
          typeof d === "object" &&
          d !== null &&
          "concepto" in d &&
          "definicion" in d &&
          typeof d.concepto === "string" &&
          typeof d.definicion === "string",
      )
    ) {
      return null;
    }

    // Retornar datos válidos
    return {
      conceptos: data.conceptos as string[],
      definiciones: data.definiciones as {
        concepto: string;
        definicion: string;
      }[],
      relaciones: data.relaciones as [],
    };
  } catch {
    // Manejar errores de red
    return null;
  }
}
