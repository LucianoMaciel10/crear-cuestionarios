// src/pages/Flashcards.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as flashcardService from "../services/flashcard.service";
import * as sm2Algorithm from "../services/spaced-repetition/sm2-algorithm";
import type { ISpacedRepetitionData } from "../data/models/spaced-repetition.model";
import FlashcardFlip from "../components/domain/FlashcardFlip";
import Button from "../components/common/Button";

const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<ISpacedRepetitionData[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const cards = await flashcardService.getAllFlashcards();
        if (cards.length === 0) {
          // Si no hay flashcards, crear algunas de ejemplo
          const exampleCards = [
            sm2Algorithm.createNewFlashcard(
              "Fotosíntesis",
              "Proceso mediante el cual las plantas convierten la luz solar en energía química.",
              "Ocurre en los cloroplastos de las células vegetales.",
            ),
            sm2Algorithm.createNewFlashcard(
              "Mitosis",
              "Proceso de división celular que resulta en dos células hijas genéticamente idénticas.",
              "Ocurre en cuatro fases: profase, metafase, anafase y telofase.",
            ),
          ];
          for (const card of exampleCards) {
            await flashcardService.saveFlashcard(card);
          }
          setFlashcards(exampleCards);
        } else {
          setFlashcards(cards);
        }
      } catch (error) {
        console.error("Failed to load flashcards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, []);

  const handleQualityRating = async (quality: number) => {
    if (currentFlashcardIndex >= flashcards.length) return;

    const currentFlashcard = flashcards[currentFlashcardIndex];
    const updatedFlashcard = sm2Algorithm.calculateNextReview(
      currentFlashcard,
      quality,
    );

    await flashcardService.updateFlashcard(updatedFlashcard);

    // Actualizar el estado local
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentFlashcardIndex] = updatedFlashcard;
    setFlashcards(updatedFlashcards);

    // Pasar a la siguiente flashcard
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
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

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No hay flashcards disponibles.
        </p>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentFlashcardIndex];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Flashcards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentFlashcardIndex + 1} de {flashcards.length}
        </p>
      </div>
      <FlashcardFlip
        flashcard={currentFlashcard}
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
