// src/components/domain/MaterialCard.tsx
import React, { useEffect, useState } from "react";
import type { IMaterial } from "../../data/models/material.model";
import type { IKnowledgeNode } from "../../data/models/knowledge-node.model";
import * as knowledgeNodeService from "../../services/knowledge-node.service";
import Card from "../common/Card";

interface MaterialCardProps {
  material: IMaterial;
  onClick?: () => void;
  showDebugInfo?: boolean;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onClick,
  showDebugInfo = false,
}: MaterialCardProps) => {
  const [knowledgeNodes, setKnowledgeNodes] = useState<IKnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKnowledgeNodes = async () => {
      try {
        setLoading(true);
        const nodes = await knowledgeNodeService.getKnowledgeNodesByMaterial(
          material.id,
        );
        setKnowledgeNodes(nodes);
      } catch (error) {
        console.error("Error loading knowledge nodes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadKnowledgeNodes();
  }, [material.id]);

  const concepts = knowledgeNodes.filter((node) => node.type === "concept");
  const definitions = knowledgeNodes.filter(
    (node) => node.type === "definition",
  );

  // Determinar estado de visualización
  const getStatusDisplay = () => {
    switch (material.processingStatus) {
      case "processing":
        return (
          <div className="mb-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 italic">
              Procesando...
            </p>
          </div>
        );
      case "failed":
        return (
          <div className="mb-4">
            <p className="text-sm text-red-600 dark:text-red-400 italic">
              Error: {material.processingError || "Error desconocido"}
            </p>
          </div>
        );
      case "completed":
        return (
          <div className="mb-4">
            <p className="text-sm text-green-600 dark:text-green-400 italic">
              Procesado correctamente
            </p>
          </div>
        );
      default:
        return (
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Pendiente de procesamiento
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="p-4" onClick={onClick}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 truncate">
            {material.originalFilename || material.nombre}
          </h3>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
            {material.fileType || material.tipo}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Conceptos:</strong>{" "}
            {loading ? "Cargando..." : concepts.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Definiciones:</strong>{" "}
            {loading ? "Cargando..." : definitions.length}
          </p>
        </div>

        {getStatusDisplay()}

        {showDebugInfo && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <strong>ID:</strong> {material.id}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <strong>Estado:</strong> {material.processingStatus}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Cargado:</strong>{" "}
              {material.fechaCarga.toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MaterialCard;
