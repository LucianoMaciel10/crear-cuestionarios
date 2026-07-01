// src/services/knowledge-extraction/providers/ai-provider.ts
/**
 * Proveedor de extracción de conocimiento basado en IA
 * Encapsula la lógica específica de extracción con Mistral AI
 */

import type { IContenidoProcesado } from "../../../data/models/material.model";
import { extractConceptsWithAI } from "../../ai/concept-extraction.service";

/**
 * Opciones específicas del proveedor de IA
 */
export interface AIProviderOptions {
  /**
   * Modelo de Mistral a utilizar
   */
  model?: string;
  /**
   * Timeout para la llamada a la API
   */
  timeout?: number;
}

/**
 * Extrae conocimiento utilizando IA
 * @param text - Texto a analizar
 * @returns Promesa con conocimiento extraído o null si falla
 */
export async function extractWithAI(
  text: string,
): Promise<IContenidoProcesado | null> {
  try {
    // Llamar al servicio de extracción con IA existente
    return await extractConceptsWithAI(text);
  } catch (error) {
    console.error("AI Provider failed:", error);
    return null;
  }
}

/**
 * Verifica si el proveedor de IA está disponible
 * @returns Promesa que resuelve a boolean
 */
export async function isAIAvailable(): Promise<boolean> {
  // Verificar conexión a internet
  if (!navigator.onLine) {
    return false;
  }

  // En desarrollo, verificar si la API está configurada
  if (import.meta.env.DEV) {
    return true; // Asumir disponible en desarrollo para testing
  }

  // En producción, intentar una llamada de prueba
  try {
    const response = await fetch("/api/health");
    return response.ok;
  } catch {
    return false;
  }
}
