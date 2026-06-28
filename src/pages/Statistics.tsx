// src/pages/Statistics.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as questionService from '../services/question.service';
import * as flashcardService from '../services/flashcard.service';
import * as adaptiveEngine from '../services/adaptive-learning/adaptive-engine';
import type { IQuestion } from '../data/models/question.model';
import type { ISpacedRepetitionData } from '../data/models/spaced-repetition.model';
import TopicMasteryChart from '../components/domain/TopicMasteryChart';
import WeakPointsList from '../components/domain/WeakPointsList';

const Statistics: React.FC = () => {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<ISpacedRepetitionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedQuestions = await questionService.getAllQuestions();
        const loadedFlashcards = await flashcardService.getAllFlashcards();
        setQuestions(loadedQuestions);
        setFlashcards(loadedFlashcards);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  // Calcular dominio por tema
  const questionMastery = adaptiveEngine.calculateTopicMastery(questions);
  const flashcardMastery = adaptiveEngine.calculateFlashcardMastery(flashcards);
  const combinedMastery = adaptiveEngine.combineMastery(questionMastery, flashcardMastery);

  // Detectar puntos débiles
  const weakPoints = adaptiveEngine.detectWeakPoints(combinedMastery);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estadísticas de Aprendizaje</h1>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => navigate('/')}
        >
          Volver al Inicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopicMasteryChart topicMastery={combinedMastery} />
        <WeakPointsList weakPoints={weakPoints} />
      </div>

      <div className="mt-6 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-2">Resumen General</h2>
        <p className="text-gray-600">
          <span className="font-medium">Total de preguntas respondidas:</span> {questions.length}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Total de flashcards repasadas:</span> {flashcards.length}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Temas dominados:</span> {combinedMastery.filter((t) => t.masteryLevel >= 0.7).length}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Puntos débiles detectados:</span> {weakPoints.length}
        </p>
      </div>
    </div>
  );
};

export default Statistics;