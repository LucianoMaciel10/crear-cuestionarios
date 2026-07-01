// src/data/models/material.model.ts

export interface IMaterial {
  id: string;
  nombre: string;
  tipo: "texto" | "pdf" | "docx" | "txt" | "md";
  contenidoOriginal?: string | ArrayBuffer;
  contenidoProcesado: IContenidoProcesado;
  fechaCarga: Date;
  idMateria?: string;
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
