# ROADMAP de Implementación

Este documento detalla el plan de ejecución dividido en fases pequeñas y manejables para la construcción del Generador Inteligente de Cuestionarios Académicos.

---

## Fase 0: Configuración del Proyecto y Estructura Base
**Objetivo:** Establecer el entorno de desarrollo, la estructura de carpetas y las dependencias iniciales.

*   **Archivos a crear:**
    *   `src/styles/globals.css` (Tailwind config).
    *   `src/data/db/dexie-db.ts` (Configuración de Dexie.js).
    *   `src/data/models/index.ts` (Definición de interfaces base).
*   **Componentes involucrados:** `App.tsx`, `main.tsx`.
*   **Dependencias:** `dexie`, `dexie-react-hook`, `lucide-react`, `clsx`, `tailwind-merge`.
*   **Criterios de finalización:** Proyecto corriendo en local con Tailwind operativo y base de datos IndexedDB inicializada.
*   **Riesgos:** Errores de configuración de TypeScript con librerías externas.

---

## Fase 1: Gestión de Materias y Navegación
**Objetivo:** Permitir al usuario crear y organizar sus áreas de estudio.

*   **Archivos a crear:**
    *   `src/components/common/Button.tsx`, `Card.tsx`, `Modal.tsx`.
    *   `src/pages/Dashboard.tsx`.
    *   `src/hooks/useSubjects.ts`.
*   **Componentes involucrados:** `Dashboard`, `SubjectCard`, `AddSubjectModal`.
*   **Criterios de finalización:** El usuario puede crear, ver y eliminar materias (Persistido en IndexedDB).

---

## Fase 2: Carga y Almacenamiento de Material (Texto/TXT)
**Objetivo:** Implementar la carga de material simple y su persistencia.

*   **Archivos a crear:**
    *   `src/services/material-parser/text-parser.ts`.
    *   `src/pages/AddMaterial.tsx`.
    *   `src/hooks/useMaterials.ts`.
*   **Componentes involucrados:** `FileUploadZone`, `TextInputForm`.
*   **Criterios de finalización:** Guardado exitoso de contenido de texto vinculado a una materia.

---

## Fase 3: Procesamiento de Material y Extracción Básica
**Objetivo:** Identificar conceptos y definiciones mediante heurísticas simples.

*   **Archivos a crear:**
    *   `src/services/material-parser/text-processor.ts` (Lógica de extracción).
    *   `src/web-workers/parser.worker.ts`.
*   **Componentes involucrados:** `ProcessingIndicator`.
*   **Criterios de finalización:** Al cargar un texto, se genera automáticamente una lista de pares concepto-definición en `contenidoProcesado`.
*   **Riesgos:** Baja precisión inicial en la detección de conceptos.

---

## Fase 4: Banco de Preguntas y Generación Automática (V/F)
**Objetivo:** Generar las primeras preguntas a partir del material procesado.

*   **Archivos a crear:**
    *   `src/services/question-generator/boolean-generator.ts`.
    *   `src/pages/QuizManagement.tsx`.
*   **Componentes involucrados:** `QuestionList`, `GenerateQuestionsButton`.
*   **Criterios de finalización:** Generación de preguntas Verdadero/Falso persistidas en el banco de preguntas.

---

## Fase 5: Modo de Estudio: Práctica
**Objetivo:** Permitir al usuario responder preguntas con feedback inmediato.

*   **Archivos a crear:**
    *   `src/pages/QuizPlayer.tsx`.
    *   `src/components/domain/QuestionCard.tsx`.
    *   `src/hooks/useQuizEngine.ts`.
*   **Componentes involucrados:** `QuizPlayer`, `FeedbackAlert`.
*   **Criterios de finalización:** Flujo completo de responder pregunta -> ver corrección -> pasar a la siguiente.

---

## Fase 6: Flashcards y Repetición Espaciada (Básico)
**Objetivo:** Implementar la visualización de flashcards y el algoritmo SM-2 inicial.

*   **Archivos a crear:**
    *   `src/services/spaced-repetition/sm2-algorithm.ts`.
    *   `src/pages/Flashcards.tsx`.
*   **Componentes involucrados:** `FlashcardFlip`, `QualityButtons` (0-5 rating).
*   **Criterios de finalización:** Las flashcards muestran fechas de próximo repaso calculadas según la respuesta del usuario.

---

## Fase 7: Estadísticas y Aprendizaje Adaptativo
**Objetivo:** Visualizar el progreso y detectar temas débiles.

*   **Archivos a crear:**
    *   `src/services/adaptive-learning/adaptive-engine.ts`.
    *   `src/pages/Statistics.tsx`.
*   **Componentes involucrados:** `TopicMasteryChart`, `WeakPointsList`.
*   **Criterios de finalización:** Gráficos que muestran el dominio por tema basado en el historial de aciertos.

---

## Fase 8: Soporte PDF y DOCX
**Objetivo:** Expandir la capacidad de carga de documentos complejos.

*   **Archivos a crear:**
    *   `src/services/material-parser/pdf-parser.ts`.
    *   `src/services/material-parser/docx-parser.ts`.
*   **Dependencias:** `pdfjs-dist`, `mammoth`.
*   **Criterios de finalización:** El sistema procesa archivos PDF/DOCX extrayendo el texto correctamente.
*   **Riesgos:** Alto consumo de memoria y complejidad en el parseo de estructuras (tablas, columnas).

---

## Fase 9: Pulido de UI, Modo Oscuro y Optimización
**Objetivo:** Mejorar la experiencia de usuario y el rendimiento final.

*   **Archivos a crear:** `src/contexts/ThemeContext.tsx`.
*   **Criterios de finalización:** Interfaz profesional, responsiva, con soporte de modo oscuro y tiempos de carga optimizados.
