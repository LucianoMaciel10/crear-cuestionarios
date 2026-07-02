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

  useEffect(() => {
    const loadKnowledgeNodes = async () => {
      const nodes = await knowledgeNodeService.getKnowledgeNodesByMaterial(
        material.id,
      );
      setKnowledgeNodes(nodes);
    };
    loadKnowledgeNodes();
  }, [material.id]);

  const concepts = knowledgeNodes.filter((node) => node.type === "concept");
  const definitions = knowledgeNodes.filter(
    (node) => node.type === "definition",
  );

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="p-4" onClick={onClick}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 truncate">
            {material.nombre}
          </h3>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
            {material.tipo}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Conceptos:</strong> {concepts.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Definiciones:</strong> {definitions.length}
          </p>
        </div>

        {knowledgeNodes.length === 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Procesando...
            </p>
          </div>
        )}

        {showDebugInfo && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <strong>ID:</strong> {material.id}
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
