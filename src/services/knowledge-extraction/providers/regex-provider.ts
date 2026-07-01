// src/services/knowledge-extraction/providers/regex-provider.ts
/**
 * Proveedor de extracción de conocimiento basado en expresiones regulares
 * Encapsula la lógica específica de extracción con patrones regex
 */

import type { IContenidoProcesado } from "../../../data/models/material.model";
import { processText } from "../../material-parser/text-processor";

/**
 * Opciones específicas del proveedor de regex
 */
export interface RegexProviderOptions {
  /**
   * Patrones personalizados para extracción
   */
  customPatterns?: {
    conceptPattern?: RegExp;
    definitionPattern?: RegExp;
  };
}

/**
 * Extrae conocimiento utilizando expresiones regulares
 * @param text - Texto a analizar
 * @returns Promesa con conocimiento extraído
 */
export async function extractWithRegex(
  text: string,
): Promise<IContenidoProcesado> {
  // Usar el procesador de texto existente
  return processText(text);
}

/**
 * Verifica si el proveedor de regex está disponible
 * @returns Siempre true (regex siempre está disponible)
 */
export function isRegexAvailable(): boolean {
  return true;
}
