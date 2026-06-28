import React, { useState, useEffect } from "react";
import { useMaterials } from "../hooks/useMaterials";
import { generateBooleanQuestions } from "../services/question-generator/boolean-generator";
import * as questionService from "../services/question.service";
import type { IQuestion } from "../data/models";
import QuestionList from "../components/domain/QuestionList";
import GenerateQuestionsButton from "../components/domain/GenerateQuestionsButton";

interface QuizManagementProps {
  subjectId: string;
}

const QuizManagement: React.FC<QuizManagementProps> = ({ subjectId }) => {
  const { materials } = useMaterials(subjectId);
  const [questions, setQuestions] = useState<IQuestion[]>([]);

  const handleGenerateQuestions = async () => {
    if (materials.length > 0) {
      const concepts = materials.flatMap(
        (material) =>
          material.contenidoProcesado?.conceptos.map((concept) => ({
            concept,
            definition:
              material.contenidoProcesado?.definiciones.find(
                (def) => def.concepto === concept,
              )?.definicion || "",
          })) || [],
      );
      const generatedQuestions = generateBooleanQuestions(concepts);
      setQuestions(generatedQuestions);

      // Save questions to the database
      await questionService.saveQuestions(generatedQuestions);
    }
  };

  useEffect(() => {
    // Load existing questions from the database
    const loadQuestions = async () => {
      const existingQuestions = await questionService.getAllQuestions();
      setQuestions(existingQuestions);
    };
    loadQuestions();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Cuestionarios</h1>
      <div className="mb-4">
        <GenerateQuestionsButton onClick={handleGenerateQuestions} />
      </div>
      <QuestionList questions={questions} />
    </div>
  );
};

export default QuizManagement;
