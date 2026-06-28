import type { IMaterial } from "../../data/models/material.model";
import Button from "../common/Button";

type MaterialCardProps = {
  material: IMaterial;
  onDelete: (id: string) => void | Promise<void>;
};

function MaterialCard({ material, onDelete }: MaterialCardProps) {
  const { conceptos, definiciones, relaciones } = material.contenidoProcesado;

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {material.nombre}
          </h3>
          <p className="text-sm text-gray-500">
            Tipo: <span className="uppercase">{material.tipo}</span> | Cargado:{" "}
            {new Date(material.fechaCarga).toLocaleDateString()}
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

      <details className="p-3 bg-gray-50 rounded-md text-sm border border-gray-200">
        <summary className="cursor-pointer font-medium text-gray-700">
          Ver datos procesados
        </summary>
        <div className="mt-3 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800">Conceptos</h4>
            {conceptos.length > 0 ? (
              <ul className="list-disc list-inside text-gray-500">
                {conceptos.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Sin datos procesados.</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Definiciones</h4>
            {definiciones.length > 0 ? (
              <ul className="list-disc list-inside text-gray-500">
                {definiciones.map((d) => (
                  <li key={d.concepto}>
                    {d.concepto}: {d.definicion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Sin datos procesados.</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Relaciones</h4>
            {relaciones.length > 0 ? (
              <ul className="list-disc list-inside text-gray-600">
                {relaciones.map((r) => (
                  <li key={r.id}>
                    {r.origen} - {r.destino} ({r.tipo})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Sin datos procesados.</p>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

export default MaterialCard;
