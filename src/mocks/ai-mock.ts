// src/mocks/ai-mock.ts
import type { IContenidoProcesado } from "../data/models/material.model";

/**
 * Mock para la extracción de conceptos con IA durante desarrollo.
 * Este mock simula el comportamiento de la API real pero sin requerir conexión.
 */
export function mockExtractConcepts(text: string): IContenidoProcesado {
  // Extraer conceptos simples basados en patrones comunes
  const conceptos: string[] = [];
  const definiciones = [];

  // Buscar patrones como "concepto: definición" o "término - definición"
  const conceptPattern = /\b(\w+(?:\s+\w+){1,3})\s*[:-]\s*(.+?(?=\n\n|\.|$))/g;
  let match;

  while ((match = conceptPattern.exec(text)) !== null) {
    const concepto = match[1].trim();
    const definicion = match[2].trim();

    if (concepto && definicion && !conceptos.includes(concepto)) {
      conceptos.push(concepto);
      definiciones.push({
        concepto,
        definicion,
      });
    }
  }

  // Si no se encontraron patrones, extraer palabras clave
  if (conceptos.length === 0) {
    const keywords = text
      .split(/\s+/)
      .filter((word) => word.length > 5 && /^[A-Z][a-z]+/.test(word))
      .slice(0, 5);

    conceptos.push(...keywords);

    // Crear definiciones genéricas para el mock
    conceptos.forEach((concepto) => {
      definiciones.push({
        concepto,
        definicion: `Definición de ${concepto} (generada por mock)`,
      });
    });
  }

  return {
    conceptos,
    definiciones,
  };
}
