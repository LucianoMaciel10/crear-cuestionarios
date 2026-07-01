// src/services/ai/concept-extraction.service.ts
import type { IContenidoProcesado } from "../../data/models/material.model";

export async function extractConceptsWithAI(
  text: string,
): Promise<IContenidoProcesado | null> {
  // Verificar conexión a internet
  if (!navigator.onLine) {
    console.log("Sin conexión a internet, usando fallback");
    return null;
  }

  try {
    console.log("Usando API real de Mistral");

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
      // En desarrollo local, la API puede no estar disponible (404)
      if (import.meta.env.DEV && response.status === 404) {
        console.warn("API no disponible en desarrollo local, usando fallback");
      } else {
        try {
          const errorData = await response.json();
          console.error("Error detallado de la API:", {
            status: response.status,
            error: errorData.error,
            details: errorData.details,
            solution: errorData.solution,
          });
        } catch (parseError) {
          console.error("Error al parsear respuesta de error:", parseError);
        }
      }
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
      !Array.isArray(data.conceptos) ||
      !Array.isArray(data.definiciones)
    ) {
      console.log("Estructura de respuesta inválida:", data);
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
      console.log("Tipos de datos inválidos en la respuesta:", data);
      return null;
    }

    // Retornar datos válidos
    return {
      conceptos: data.conceptos as string[],
      definiciones: data.definiciones as {
        concepto: string;
        definicion: string;
      }[],
    };
  } catch (error) {
    // Manejar errores de red
    console.log("Error al conectar con la API de extracción:", error);
    return null;
  }
}
