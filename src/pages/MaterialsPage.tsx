// src/pages/MaterialsPage.tsx
import { useState } from "react";
import { useMaterials } from "../hooks/useMaterials";
import MaterialCard from "../components/domain/MaterialCard";
import AddMaterialModal from "../components/AddMaterialModal";
import Button from "../components/common/Button";
import { useParams, useNavigate } from "react-router-dom";
import { processBatchMaterials } from "../services/material.service";
import type { ProcessingStage } from "../types/shared-types";
import * as knowledgeNodeService from "../services/knowledge-node.service";
import * as questionService from "../services/question.service";

function MaterialsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { materials, addMaterial, removeMaterial, loading } =
    useMaterials(subjectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

  if (!subjectId) {
    return <p>Materia no encontrada.</p>;
  }

  const handleAddMaterial = async (
    nombre: string,
    tipo: "texto" | "pdf" | "pptx" | "txt" | "md",
    contenidoOriginal?: string | ArrayBuffer,
  ): Promise<string> => {
    const id = await addMaterial(nombre, tipo, contenidoOriginal, subjectId);
    setIsModalOpen(false);
    return id;
  };

  const handleBatchAdd = async (
    files: File[],
    onProgress: (stages: ProcessingStage[]) => void,
  ) => {
    try {
      const result = await processBatchMaterials(files, subjectId, {
        preferAI: true,
        generateQuestions: true,
        onProgress,
      });

      return result;
    } catch (error) {
      console.error("Error en procesamiento por lotes:", error);
      throw error;
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      // Eliminar KnowledgeNodes asociados
      await knowledgeNodeService.deleteKnowledgeNodesByMaterial(materialId);

      // Eliminar preguntas asociadas (por tema, usando el nombre del material)
      const material = materials.find((m) => m.id === materialId);
      if (material) {
        await questionService.removeQuestionsByTopic(material.nombre);
      }

      // Eliminar el material
      await removeMaterial(materialId);
    } catch (error) {
      console.error("Error al eliminar material:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Cargando materiales...
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Mis Materiales
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona tus materiales de estudio
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate("/")}>
            ← Volver
          </Button>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => {
                setBatchMode(false);
                setIsModalOpen(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Añadir material
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setBatchMode(true);
                setIsModalOpen(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Subir archivos
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4">
        {materials.length > 0 ? (
          materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={() => navigate(`/materiales/${material.id}`)}
              onDelete={handleDeleteMaterial}
              showDebugInfo={false} // Ocultar info de desarrollo en producción
            />
          ))
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              Todavía no hay materiales. Crea el primero para comenzar.
            </p>
          </div>
        )}
      </section>

      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMaterial}
        onBatchAdd={handleBatchAdd}
        batchMode={batchMode}
      />
    </div>
  );
}

export default MaterialsPage;
