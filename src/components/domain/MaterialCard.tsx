import type { IMaterial } from '../../data/models/material.model';
import Button from '../common/Button';

type MaterialCardProps = {
  material: IMaterial;
  onDelete: (id: string) => void | Promise<void>;
};

function MaterialCard({ material, onDelete }: MaterialCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{material.nombre}</h3>
        <p className="text-sm text-gray-500">
          Tipo: <span className="uppercase">{material.tipo}</span> | 
          Cargado: {material.fechaCarga.toLocaleDateString()}
        </p>
      </div>
      <Button 
        variant="secondary"
        onClick={() => void onDelete(material.id)}
        className="text-sm py-2 px-4"
      >
        Eliminar
      </Button>
    </div>
  );
}

export default MaterialCard;
