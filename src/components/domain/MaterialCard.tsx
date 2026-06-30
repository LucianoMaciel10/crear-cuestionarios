import type { IMaterial } from "../../data/models/material.model";
import Button from "../common/Button";
import Card from "../common/Card";

type MaterialCardProps = {
  material: IMaterial;
  onDelete: (id: string) => void | Promise<void>;
  showDebugInfo?: boolean; // Solo para desarrollo
};

function MaterialCard({
  material,
  onDelete,
  showDebugInfo = false,
}: MaterialCardProps) {
  const { conceptos, definiciones, relaciones } = material.contenidoProcesado;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">
              {material.nombre}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tipo: <span className="uppercase">{material.tipo}</span> |
              Cargado:{new Date(material.fechaCarga).toLocaleDateString()}
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

        {/* Solo mostrar datos procesados en modo desarrollo */}
        {showDebugInfo && (
          <details className="p-3 bg-gray-50 rounded-md text-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
              Ver datos procesados (solo desarrollo)
            </summary>
            <div className="mt-3 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Conceptos
                </h4>
                {conceptos.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                    {conceptos.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Sin datos procesados.
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Definiciones
                </h4>
                {definiciones.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                    {definiciones.map((d) => (
                      <li key={d.concepto}>
                        {d.concepto}: {d.definicion}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Sin datos procesados.
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Relaciones
                </h4>
                {relaciones.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                    {relaciones.map((r, index) => (
                      <li key={index}>
                        {r.origen} - {r.destino} ({r.tipo}): {r.descripcion}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Sin datos procesados.
                  </p>
                )}
              </div>
            </div>
          </details>
        )}
      </div>
    </Card>
  );
}

export default MaterialCard;
