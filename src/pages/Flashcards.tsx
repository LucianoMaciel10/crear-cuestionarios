// src/pages/Flashcards.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as knowledgeNodeService from "../services/knowledge-node.service";
import * as knowledgeNodeUpdater from "../services/spaced-repetition/knowledge-node-updater";
import type { IKnowledgeNode } from "../data/models/knowledge-node.model";
import FlashcardFlip from "../components/domain/FlashcardFlip";
import Button from "../components/common/Button";

const Flashcards: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [knowledgeNodes, setKnowledgeNodes] = useState<IKnowledgeNode[]>([]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadKnowledgeNodes = async () => {
      try {
        if (subjectId) {
          const nodes = await knowledgeNodeService.getAllKnowledgeNodes();
          // Filtrar solo conceptos y definiciones del subjectId
          const filteredNodes = nodes.filter(
            (node) =>
              node.subjectId === subjectId &&
              (node.type === "concept" || node.type === "definition"),
          );
          setKnowledgeNodes(filteredNodes);
        }
      } catch (error) {
        console.error("Failed to load knowledge nodes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeNodes();
  }, [subjectId]);

  if (!subjectId) {
    return <p>Materia no encontrada.</p>;
  }

  const handleQualityRating = async (quality: number) => {
    if (currentNodeIndex >= knowledgeNodes.length) return;

    const currentNode = knowledgeNodes[currentNodeIndex];
    const updatedNode = knowledgeNodeUpdater.updateKnowledgeNodeWithSM2Review(
      currentNode,
      quality,
    );

    await knowledgeNodeService.updateKnowledgeNode(updatedNode);

    // Actualizar el estado local
    const updatedNodes = [...knowledgeNodes];
    updatedNodes[currentNodeIndex] = updatedNode;
    setKnowledgeNodes(updatedNodes);

    // Pasar a la siguiente flashcard
    if (currentNodeIndex < knowledgeNodes.length - 1) {
      setCurrentNodeIndex(currentNodeIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Cargando flashcards...
        </p>
      </div>
    );
  }

  if (knowledgeNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No hay flashcards para esta materia. Cargá materiales con definiciones
          para generarlas automáticamente.
        </p>
      </div>
    );
  }

  const currentNode = knowledgeNodes[currentNodeIndex];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Flashcards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentNodeIndex + 1} de {knowledgeNodes.length}
        </p>
      </div>
      <FlashcardFlip
        knowledgeNode={currentNode}
        onQualityRating={handleQualityRating}
      />
      <div className="mt-6">
        <Button
          onClick={() => navigate("/")}
          variant="secondary"
          className="w-full"
        >
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};

export default Flashcards;
