// src/pages/Statistics.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizAttemptsBySubject } from "../services/question.service";
import * as flashcardService from "../services/flashcard.service";
import * as adaptiveEngine from "../services/adaptive-learning/adaptive-engine";
import type { IQuizAttempt } from "../data/models/question.model";
import type { ISpacedRepetitionData } from "../data/models/spaced-repetition.model";
import TopicMasteryChart from "../components/domain/TopicMasteryChart";
import WeakPointsList from "../components/domain/WeakPointsList";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

const Statistics: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [attempts, setAttempts] = useState<IQuizAttempt[]>([]);
  const [flashcards, setFlashcards] = useState<ISpacedRepetitionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (subjectId) {
          const loadedAttempts = await getQuizAttemptsBySubject(subjectId);
          // Usar el nuevo método que combina ambos sistemas
          const loadedFlashcards =
            await flashcardService.getAllFlashcardsForSubject(subjectId);
          setAttempts(loadedAttempts);
          setFlashcards(loadedFlashcards);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subjectId]);

  if (!subjectId) {
    return <p>Materia no encontrada.</p>;
  }

  // Calcular dominio por tema
  const questionMastery = adaptiveEngine.calculateTopicMastery(attempts);
  const flashcardMastery = adaptiveEngine.calculateFlashcardMastery(flashcards);
  const combinedMastery = adaptiveEngine.combineMastery(
    questionMastery,
    flashcardMastery,
  );

  // Detectar puntos débiles
  const weakPoints = adaptiveEngine.detectWeakPoints(combinedMastery);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Cargando estadísticas...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Estadísticas de Aprendizaje
        </h1>
        <Button onClick={() => navigate("/")} variant="secondary">
          ← Volver a Materias
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TopicMasteryChart topicMastery={combinedMastery} />
        <WeakPointsList weakPoints={weakPoints} />
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-50">
          Resumen General
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-600 dark:text-primary-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Preguntas respondidas
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {attempts.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-600 dark:text-primary-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Flashcards repasadas
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {flashcards.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Temas dominados
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {combinedMastery.filter((t) => t.masteryLevel >= 0.7).length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-18 0 4 4 0 0118 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Puntos débiles
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {weakPoints.length}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
