import { Dexie } from 'dexie';
import type { IMaterial, IMateria, IEtiqueta } from '../models';

class CuestionarioDB extends Dexie {
  materiales!: Dexie.Table<IMaterial, string>;
  materias!: Dexie.Table<IMateria, string>;
  etiquetas!: Dexie.Table<IEtiqueta, string>;

  constructor() {
    super('CuestionarioDB');
    
    this.version(1).stores({
      materiales: 'id, nombre, tipo, fechaCarga',
      materias: 'id, nombre',
      etiquetas: 'id, nombre'
    });
  }
}

export const db = new CuestionarioDB();

// Validación de conexión
db.open()
  .then(() => console.log('Database opened successfully'))
  .catch(err => console.error('Failed to open db:', err));