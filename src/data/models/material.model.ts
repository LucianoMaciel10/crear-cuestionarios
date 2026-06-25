// Modelos para Material y Relaciones según ARCHITECTURE.md

export interface IMaterial {
  id: string;
  nombre: string;
  tipo: 'texto' | 'pdf' | 'docx' | 'txt' | 'md';
  contenidoOriginal?: string | ArrayBuffer;
  contenidoProcesado: {
    conceptos: string[];
    definiciones: { concepto: string, definicion: string }[];
    relaciones: IRelacion[];
  };
  fechaCarga: Date;
}

export interface IRelacion {
  id: string;
  tipo: string;
  origen: string;
  destino: string;
  descripcion?: string;
}