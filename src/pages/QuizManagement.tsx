import React, { useState, useEffect } from "react";
import { useMaterials } from "../hooks/useMaterials";
import { generateBooleanQuestions } from "../services/question-generator/boolean-generator";
import { generateMultipleChoiceQuestions } from "../services/question-generator/multiple-choice-generator";
import * as questionService from "../services/question.service";
import * as knowledgeNodeService from "../services/knowledge-node.service";
import type { IQuestion } from "../data/models";
import type { IKnowledgeNode } from "../data/models/knowledge-node.model";
import QuestionList from "../components/domain/QuestionList";
import GenerateQuestionsButton from "../components/domain/GenerateQuestionsButton";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { useParams, useNavigate } from "react-router-dom";

const QuizManagement: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { materials } = useMaterials(subjectId);
  const [questions, setQuestions] = useState<IQuestion[]>([]);

  useEffect(() => {
    // Load existing questions from the database
    const loadQuestions = async () => {
      if (subjectId) {
        const existingQuestions =
          await questionService.getQuestionsBySubject(subjectId);
        setQuestions(existingQuestions);
      }
    };
    loadQuestions();
  }, [subjectId]);

  if (!subjectId) {
    return <p>Materia no encontrada.</p>;
  }

  const handleGenerateQuestions = async () => {
    if (materials.length > 0) {
      const existingTopics =
        await questionService.getExistingTopicsBySubject(subjectId);

      // Obtener nodos de conocimiento asociados a los materiales
      const materialIds = materials.map((m) => m.id);
      const knowledgeNodes: IKnowledgeNode[] = [];

      for (const materialId of materialIds) {
        const nodes =
          await knowledgeNodeService.getKnowledgeNodesByMaterial(materialId);
        knowledgeNodes.push(...nodes);
      }

      // Si hay KnowledgeNodes, usarlos como fuente principal
      // Si no, caer al formato antiguo para compatibilidad
      const concepts =
        knowledgeNodes.length > 0
          ? knowledgeNodes
              .filter(
                (node) => node.type === "definition" || node.type === "concept",
              )
              .map((node) => {
                if (node.type === "definition") {
                  const [concept, definition] = node.content.split(": ");
                  return { concept, definition };
                }
                return { concept: node.content, definition: "" };
              })
              .filter(
                (c) =>
                  c.concept && !existingTopics.has(c.concept.toLowerCase()),
              )
          : materials
              .flatMap(
                (material) =>
                  material.contenidoProcesado?.conceptos.map((concept) => ({
                    concept,
                    definition:
                      material.contenidoProcesado?.definiciones.find(
                        (def) => def.concepto === concept,
                      )?.definicion || "",
                  })) || [],
              )
              .filter(
                (c) =>
                  c.definition !== "" &&
                  !existingTopics.has(c.concept.toLowerCase()),
              );

      const booleanQuestions = generateBooleanQuestions(concepts, subjectId);
      const multipleChoiceQuestions = generateMultipleChoiceQuestions(
        concepts,
        subjectId,
      );
      const allNewQuestions = [...booleanQuestions, ...multipleChoiceQuestions];

      if (allNewQuestions.length > 0) {
        await questionService.saveQuestions(allNewQuestions);
        setQuestions((prev) => [...prev, ...allNewQuestions]);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Gestión de Cuestionarios
        </h1>
        <GenerateQuestionsButton onClick={handleGenerateQuestions} />
      </div>

      {questions.length > 0 ? (
        <QuestionList questions={questions} />
      ) : (
        <Card className="p-6 text-center">
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No hay preguntas generadas aún.
          </p>
          <Button onClick={handleGenerateQuestions} variant="primary">
            Generar Preguntas
          </Button>
        </Card>
      )}
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={() => navigate("/")}>
          ← Volver a Materias
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/cuestionario/${subjectId}`)}
          disabled={questions.length === 0}
        >
          Iniciar práctica
        </Button>
      </div>
    </div>
  );
};

export default QuizManagement;
