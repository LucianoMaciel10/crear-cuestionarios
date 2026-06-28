import { useState } from "react";
import Button from "./common/Button";

type MaterialType = "texto" | "pdf" | "docx" | "txt" | "md";

type AddMaterialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    nombre: string,
    tipo: MaterialType,
    contenidoOriginal?: string | ArrayBuffer,
  ) => Promise<string>;
};

function AddMaterialModal({ isOpen, onClose, onAdd }: AddMaterialModalProps) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<MaterialType>("texto");
  const [contenido, setContenido] = useState(""); // Nuevo estado para el contenido

  if (!isOpen) return null;

  const handleGuardar = async () => {
    if (nombre.trim() === "") return;

    const contenidoParaEnviar =
      tipo === "texto" || tipo === "txt" || tipo === "md"
        ? contenido.trim() || undefined // Usar undefined si está vacío
        : undefined; // Pasar undefined para tipos no soportados en el MVP

    await onAdd(nombre, tipo, contenidoParaEnviar);

    setNombre("");
    setTipo("texto");
    setContenido(""); // Limpiar el estado del contenido
    onClose();
  };

  const handleCancelar = () => {
    setNombre("");
    setTipo("texto");
    setContenido(""); // Limpiar el estado del contenido
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Nuevo Material</h2>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">Nombre</span>
          <input
            autoFocus
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium text-gray-700">Tipo</span>
          <select
            value={tipo}
            onChange={(e) => {
              const newTipo = e.target.value as MaterialType;
              setTipo(newTipo);
              // El contenido ya se limpia en Guardar/Cancelar, no es necesario aquí.
            }}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="texto">Texto</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="md">Markdown</option>
          </select>
        </label>

        {(tipo === "texto" || tipo === "txt" || tipo === "md") && (
          <label className="block mb-6">
            <span className="text-sm font-medium text-gray-700">Contenido</span>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={4}
              placeholder="Introduce el contenido del material aquí..."
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </label>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCancelar}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleGuardar()}
            disabled={nombre.trim() === ""}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddMaterialModal;
