// Modelos para Material y Relaciones según ARCHITECTURE.md

export interface IMaterial {
  id: string;
  nombre: string;
  tipo: "texto" | "pdf" | "docx" | "txt" | "md";
  contenidoOriginal?: string | ArrayBuffer;
  contenidoProcesado: IContenidoProcesado;
  fechaCarga: Date;
  idMateria?: string;
}

export interface IRelacion {
  id: string;
  tipo: string;
  origen: string;
  destino: string;
  descripcion?: string;
}

export interface IContenidoProcesado {
  conceptos: string[];
  definiciones: { concepto: string; definicion: string }[];
  relaciones: IRelacion[];
}
