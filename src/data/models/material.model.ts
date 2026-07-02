// src/data/models/material.model.ts

export interface IMaterial {
  id: string;
  nombre: string;
  tipo: "texto" | "pdf" | "pptx" | "txt" | "md";
  contenidoOriginal?: string | ArrayBuffer;
  fechaCarga: Date;
  idMateria?: string;
  // Nuevo campo para almacenar el Markdown procesado
  markdownContent?: string;
  // Nuevo campo para almacenar el hash del contenido (para caché)
  contentHash?: string;
}

export interface IEtiqueta {
  id: string;
  nombre: string;
}

export interface IRelacion {
  concepto1: string;
  tipo: string;
  concepto2: string;
}

export interface IContenidoProcesado {
  conceptos: string[];
  definiciones: { concepto: string; definicion: string }[];
}
