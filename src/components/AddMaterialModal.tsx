import { useState, useRef } from "react";
import Button from "./common/Button";
import Modal from "./common/Modal";

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
  const [contenido, setContenido] = useState(""); // Para texto, TXT, MD
  const [file, setFile] = useState<File | null>(null); // Para PDF, DOCX
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleGuardar = async () => {
    if (nombre.trim() === "") return;

    let contenidoParaEnviar: string | ArrayBuffer | undefined;

    if (tipo === "texto" || tipo === "txt" || tipo === "md") {
      contenidoParaEnviar = contenido.trim() || undefined;
    } else if (tipo === "pdf" || tipo === "docx") {
      if (file) {
        contenidoParaEnviar = await file.arrayBuffer();
      } else {
        alert("Por favor, selecciona un archivo.");
        return;
      }
    }

    await onAdd(nombre, tipo, contenidoParaEnviar);

    // Limpiar estados
    setNombre("");
    setTipo("texto");
    setContenido("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleCancelar = () => {
    setNombre("");
    setTipo("texto");
    setContenido("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Material" size="md">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre
          </span>
          <input
            autoFocus
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo
          </span>
          <select
            value={tipo}
            onChange={(e) => {
              const newTipo = e.target.value as MaterialType;
              setTipo(newTipo);
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          >
            <option value="texto">Texto</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="md">Markdown</option>
          </select>
        </label>

        {tipo === "texto" || tipo === "txt" || tipo === "md" ? (
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contenido
            </span>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={4}
              placeholder="Introduce el contenido del material aquí..."
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-y"
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Archivo
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={tipo === "pdf" ? ".pdf" : ".docx"}
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </label>
        )}
      </div>
      <div className="flex justify-end gap-3 mt-6">
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
    </Modal>
  );
}

export default AddMaterialModal;
