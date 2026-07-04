import { useState, useRef } from "react";
import Button from "./common/Button";
import Modal from "./common/Modal";
import { useToast } from "../hooks/useToast";
import type { ProcessingStage } from "../types/shared-types";

type MaterialType = "texto" | "pdf" | "pptx" | "txt" | "md";

type AddMaterialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    nombre: string,
    tipo: MaterialType,
    contenidoOriginal?: string | ArrayBuffer,
  ) => Promise<string>;
  // Nueva prop para procesamiento por lotes
  onBatchAdd?: (
    files: File[],
    onProgress: (stages: ProcessingStage[]) => void,
  ) => Promise<{
    success: boolean;
    materials: {
      id: string;
      name: string;
      markdownContent: string;
      knowledgeNodeIds: string[];
      questionIds?: string[];
    }[];
    stats: {
      totalFiles: number;
      processedFiles: number;
      knowledgeNodesCreated: number;
      questionsGenerated: number;
    };
  }>;
  batchMode?: boolean;
};

function AddMaterialModal({
  isOpen,
  onClose,
  onAdd,
  onBatchAdd,
  batchMode = false,
}: AddMaterialModalProps) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<MaterialType>("texto");
  const [contenido, setContenido] = useState(""); // Para texto, TXT, MD
  const [file, setFile] = useState<File | null>(null); // Para PDF, DOCX
  const [files, setFiles] = useState<File[]>([]); // Para batch mode
  const [isLoading, setIsLoading] = useState(false);
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>(
    [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (batchMode) {
        setFiles(Array.from(e.target.files));
      } else {
        setFile(e.target.files[0]);
      }
    }
  };

  const handleGuardar = async () => {
    if (nombre.trim() === "" && !batchMode) return;
    if (batchMode && files.length === 0) {
      showToast("Por favor, selecciona al menos un archivo", "error");
      return;
    }

    setIsLoading(true);

    try {
      if (batchMode && onBatchAdd && files.length > 0) {
        // Procesamiento por lotes
        showToast(`Procesando ${files.length} archivos...`, "info");

        const result = await onBatchAdd(files, (stages) => {
          setProcessingStages(stages);
        });

        if (result.success) {
          showToast(
            `Procesados ${result.stats.processedFiles} de ${result.stats.totalFiles} archivos. ` +
              `${result.stats.knowledgeNodesCreated} KnowledgeNodes creados.`,
            "success",
          );
        } else {
          showToast("Error al procesar algunos archivos", "error");
        }
      } else if (!batchMode) {
        // Procesamiento individual (legacy)
        let contenidoParaEnviar: string | ArrayBuffer | undefined;

        if (tipo === "texto" || tipo === "txt" || tipo === "md") {
          contenidoParaEnviar = contenido.trim() || undefined;
        } else if (tipo === "pdf" || tipo === "pptx") {
          if (file) {
            contenidoParaEnviar = await file.arrayBuffer();
          } else {
            showToast("Por favor, selecciona un archivo", "error");
            return;
          }
        }

        showToast("Procesando material con IA...", "info");

        await onAdd(nombre, tipo, contenidoParaEnviar);
        showToast("Material creado exitosamente", "success");
      }

      // Limpiar estados
      setNombre("");
      setTipo("texto");
      setContenido("");
      setFile(null);
      setFiles([]);
      setProcessingStages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    } catch (error) {
      showToast("Error al crear el material", "error");
      console.error("Error al crear material:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    setNombre("");
    setTipo("texto");
    setContenido("");
    setFile(null);
    setFiles([]);
    setProcessingStages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  // Calcular progreso general
  const getOverallProgress = () => {
    if (processingStages.length === 0) return 0;

    // Sumar el progreso de cada etapa y dividir por el número total de etapas
    // Asumiendo que `stage.progress` es un valor entre 0 y 100
    const progress = processingStages.reduce(
      (sum, stage) => sum + (stage.progress || 0),
      0,
    );
    return Math.round(progress / processingStages.length);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={batchMode ? "Cargar Múltiples Archivos" : "Nuevo Material"}
      size="md"
    >
      <div className="space-y-4">
        {!batchMode && (
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
        )}

        {!batchMode && tipo !== "texto" && (
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
              <option value="pdf">PDF</option>
              <option value="pptx">PPTX</option>
              <option value="txt">TXT</option>
              <option value="md">Markdown</option>
            </select>
          </label>
        )}

        {batchMode ? (
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Archivos (PDF/PPTX)
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.pptx"
              multiple
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            />
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Archivos seleccionados ({files.length}):
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span>• {f.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const newFiles = [...files];
                          newFiles.splice(i, 1);
                          setFiles(newFiles);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Eliminar archivo"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </label>
        ) : tipo === "texto" ? (
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
              accept={tipo === "pdf" ? ".pdf" : ".pptx"}
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </label>
        )}

        {/* Barra de progreso para batch processing */}
        {processingStages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Progreso del procesamiento:
            </h4>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full"
                style={{ width: `${getOverallProgress()}%` }}
              ></div>
            </div>
            <div className="space-y-2 text-sm">
              {processingStages.map((stage, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span
                    className={`font-medium ${stage.status === "completed" ? "text-green-600 dark:text-green-400" : stage.status === "failed" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}
                  >
                    {stage.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {stage.status === "completed"
                      ? "✓ Completado"
                      : stage.status === "failed"
                        ? "✗ Fallido"
                        : `${stage.progress}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="secondary"
          onClick={handleCancelar}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => void handleGuardar()}
          disabled={
            (batchMode && files.length === 0) ||
            (!batchMode && nombre.trim() === "") ||
            isLoading
          }
          isLoading={isLoading}
        >
          {isLoading
            ? batchMode
              ? "Procesando..."
              : "Guardando..."
            : batchMode
              ? "Procesar Archivos"
              : "Guardar"}
        </Button>
      </div>
    </Modal>
  );
}

export default AddMaterialModal;
