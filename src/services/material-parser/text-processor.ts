// src/services/material-parser/text-processor.ts
import type { IRelacion } from "../../data/models/material.model";
import { getOCRTextCleaner } from "../ocr/ocr-text-cleaner.service";

type ContenidoProcesado = {
  conceptos: string[];
  definiciones: { concepto: string; definicion: string }[];
  relaciones: IRelacion[];
};

export async function processText(text: string): Promise<ContenidoProcesado> {
  const conceptosMap = new Map<string, string>(); // clave: lowercase, valor: original
  const definiciones: { concepto: string; definicion: string }[] = [];
  const relaciones: IRelacion[] = [];

  // Usar OCR text cleaner para limpieza inicial
  const ocrTextCleaner = getOCRTextCleaner();
  const cleanedText = ocrTextCleaner.clean(text);

  const oraciones = cleanedText
    .split(/[.!?\n;]+/)
    .filter((o) => o.trim().length > 0);
  const stopWords = new Set([
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "es",
    "son",
    "que",
    "y",
    "o",
    "en",
    "de",
    "para",
  ]);

  for (const oracion of oraciones) {
    const tokens = oracion.trim().split(/\s+/);

    // Extracción de conceptos con validación mejorada
    for (const token of tokens) {
      const original = token.replace(/[.,!?;:]/g, "");
      const normalizado = original.toLowerCase();

      // Validación mejorada de conceptos
      if (
        normalizado.length > 0 &&
        !stopWords.has(normalizado) &&
        ocrTextCleaner.isValidConcept(normalizado)
      ) {
        if (!conceptosMap.has(normalizado)) {
          conceptosMap.set(normalizado, original);
        }
      }
    }

    // Extracción de definiciones con validación
    const delimitadores = [" es ", " se define como ", " significa que "];
    for (const del of delimitadores) {
      if (oracion.toLowerCase().includes(del)) {
        const index = oracion.toLowerCase().indexOf(del);
        const concepto = oracion.substring(0, index).trim();
        const definicion = oracion.substring(index + del.length).trim();

        // Validar concepto y definición
        const conceptoNormalizado = concepto
          .toLowerCase()
          .replace(/[.,!?;:]/g, "");
        if (
          concepto &&
          definicion &&
          ocrTextCleaner.isValidConcept(conceptoNormalizado) &&
          definicion.length > 10
        ) {
          definiciones.push({ concepto, definicion });
        }
        break;
      }
    }
  }

  // Filtrar conceptos válidos y limitar cantidad
  const validConcepts = Array.from(conceptosMap.values()).filter((concept) =>
    ocrTextCleaner.isValidConcept(concept.toLowerCase()),
  );

  return {
    conceptos: validConcepts.slice(0, 100), // Máximo 100 conceptos
    definiciones,
    relaciones,
  };
}
