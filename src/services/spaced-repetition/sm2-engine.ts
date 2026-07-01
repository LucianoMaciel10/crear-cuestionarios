// src/services/spaced-repetition/sm2-engine.ts

/**
 * Estado específico de SM-2
 * Representa el estado interno del algoritmo SM-2
 */
export interface SM2State {
  easeFactor: number; // Factor de facilidad (1.3 - 2.5+)
  interval: number; // Intervalo en días
  repetitionCount: number; // Número de repasos exitosos
}

/**
 * Algoritmo SM-2 puro
 * Implementación matemática del algoritmo sin dependencias de dominio
 */
export class SM2Algorithm {
  /**
   * Calcula el próximo estado usando el algoritmo SM-2
   * @param currentState - Estado actual
   * @param quality - Calidad de la respuesta (0-5)
   * @returns Nuevo estado calculado
   */
  static calculateNextState(currentState: SM2State, quality: number): SM2State {
    const clampedQuality = Math.max(0, Math.min(5, quality));

    // Calcular nuevo factor de facilidad (EF)
    const newEaseFactor =
      clampedQuality >= 3
        ? Math.max(
            1.3,
            currentState.easeFactor +
              0.1 -
              (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02),
          )
        : Math.max(1.3, currentState.easeFactor - 0.2);

    // Calcular nuevo intervalo de repetición
    const newInterval =
      currentState.repetitionCount === 0
        ? 1
        : currentState.repetitionCount === 1
          ? 6
          : Math.ceil(currentState.interval * newEaseFactor);

    // Actualizar contador de repasos
    const newRepetitionCount =
      clampedQuality >= 3 ? currentState.repetitionCount + 1 : 0;

    return {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitionCount: newRepetitionCount,
    };
  }

  /**
   * Crea el estado inicial para SM-2
   * @returns Estado inicial con valores por defecto
   */
  static createInitialState(): SM2State {
    return {
      easeFactor: 2.5, // Factor de facilidad inicial
      interval: 0, // Intervalo inicial (0 días)
      repetitionCount: 0, // No se ha repasado aún
    };
  }

  /**
   * Calcula la próxima fecha de repaso
   * @param baseDate - Fecha base (generalmente hoy)
   * @param interval - Intervalo en días
   * @returns Fecha del próximo repaso o null si intervalo es 0
   */
  static calculateNextReviewDate(
    baseDate: Date,
    interval: number,
  ): Date | null {
    if (interval <= 0) return null;

    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + interval);
    return nextDate;
  }
}
