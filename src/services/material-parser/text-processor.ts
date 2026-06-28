// src/services/material-parser/text-processor.ts
import type { IRelacion } from '../../data/models/material.model';

type ContenidoProcesado = {
  conceptos: string[];
  definiciones: { concepto: string; definicion: string }[];
  relaciones: IRelacion[];
};

export async function processText(text: string): Promise<ContenidoProcesado> {
  const conceptosMap = new Map<string, string>(); // clave: lowercase, valor: original
  const definiciones: { concepto: string; definicion: string }[] = [];
  const relaciones: IRelacion[] = [];

  const oraciones = text.split(/[.!?\n;]+/).filter((o) => o.trim().length > 0);
  const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'es', 'son', 'que', 'y', 'o', 'en', 'de', 'para']);

  for (const oracion of oraciones) {
    const tokens = oracion.trim().split(/\s+/);
    
    // Extracción de conceptos
    for (const token of tokens) {
      const original = token.replace(/[.,!?;:]/g, '');
      const normalizado = original.toLowerCase();
      
      if (normalizado.length > 0 && !stopWords.has(normalizado)) {
        if (!conceptosMap.has(normalizado)) {
          conceptosMap.set(normalizado, original);
        }
      }
    }

    // Extracción de definiciones
    const delimitadores = [' es ', ' se define como ', ' significa que '];
    for (const del of delimitadores) {
      if (oracion.toLowerCase().includes(del)) {
        const index = oracion.toLowerCase().indexOf(del);
        const concepto = oracion.substring(0, index).trim();
        const definicion = oracion.substring(index + del.length).trim();
        
        if (concepto && definicion) {
          definiciones.push({ concepto, definicion });
        }
        break;
      }
    }
  }

  return {
    conceptos: Array.from(conceptosMap.values()),
    definiciones,
    relaciones,
  };
}
