# Estado del Proyecto: Generador Inteligente de Cuestionarios Académicos

## Estado General

Proyecto en desarrollo activo. Pipeline de procesamiento de texto (carga + extracción con IA) funcional e infraestructura de navegación completa.

- **Fase actual:** Fase 11 (Consolidación del Knowledge Engine - Completada)
- **Avance aproximado:** 90% (Question Generator migrado a KnowledgeNodes)

## Arquitectura

SPA React + TypeScript + Vite + TailwindCSS. Persistencia local mediante Dexie.js (IndexedDB).

### Árbol Principal

- `src/components/`: common, domain, layout
- `src/contexts/`: ThemeContext, theme-utils, ToastContext
- `src/hooks/`: useMaterials, useSubjects, useQuizEngine, useTheme, useToast
- `src/pages/`: Dashboard, MaterialsPage, NotFoundPage, QuizManagement, QuizPlayer, Flashcards, Statistics
- `src/routes/`: index.tsx (Router configuración)
- `src/services/`: material.service, material-parser/, question.service, question-generator/, flashcard.service, spaced-repetition/, adaptive-learning/, ai/, knowledge-node.service
- `src/mocks/`: ai-mock.ts
- `api/`: extract-concepts.ts (función serverless para IA)

### Modelos de datos

- `IMaterial`, `IMateria`, `IEtiqueta`, `IQuestion`, `IRelacion`, `IFlashcard`, `ISpacedRepetitionData`, `ITopicMastery`, `IWeakPoint`, `IKnowledgeNode`

### Nuevos Componentes

- `Toast.tsx`: Sistema de notificaciones
- `ToastProvider.tsx`: Proveedor de contexto para toasts
- `ToastContext.ts`: Contexto para notificaciones
- `useToast.ts`: Hook para notificaciones

### Nuevos Servicios

- `concept-extraction.service.ts`: Servicio para extracción de conceptos con IA
- `ai-mock.ts`: Mock para desarrollo local sin dependencias externas
- `knowledge-node.service.ts`: Servicio para gestión de nodos de conocimiento

## Funcionalidades

- **Terminadas:**
  - Gestión de materias (CRUD).
  - Sistema de rutas (Router).
  - Visualización de materiales.
  - Carga de material de texto (Fase 2 del ROADMAP).
  - Procesamiento/extracción básica de conceptos (Fase 3 del ROADMAP - MVP).
  - Banco de preguntas y generación automática V/F (Fase 4 del ROADMAP - COMPLETADA).
  - Modo de Estudio: Práctica (Fase 5 del ROADMAP - COMPLETADA).
  - Flashcards y Repetición Espaciada (Fase 6 del ROADMAP - COMPLETADA).
  - Estadísticas y Aprendizaje Adaptativo (Fase 7 del ROADMAP - COMPLETADA).
  - Soporte PDF y DOCX (Fase 8 del ROADMAP - COMPLETADA).
  - Pulido de UI, Modo Oscuro y Optimización (Fase 9 del ROADMAP - COMPLETADA).
  - **Integración con IA para extracción de conceptos (NUEVO):**
    - Extracción avanzada con Mistral AI
    - Detección automática de entorno (mock en desarrollo, API real en producción)
    - Manejo de relaciones semánticas entre conceptos
    - Fallback automático a expresiones regulares
  - **Knowledge Engine - Fase 1 (NUEVO):**
    - Implementación de IKnowledgeNode como entidad base
    - Servicio knowledge-node.service.ts con CRUD completo
    - Integración con material.service.ts para generación automática
    - Migración de base de datos a versión 8 con nueva tabla knowledgeNodes
    - Coexistencia con arquitectura actual
  - **Knowledge Engine - Fase 2 (NUEVO):**
    - Migración completa del Question Generator a KnowledgeNodes
    - Generadores de preguntas actualizados para aceptar ambos formatos
    - QuizManagement usa KnowledgeNodes como fuente principal
    - Estrategia de transición limpia con fallback al formato antiguo
    - Consolidación del Knowledge Engine como nueva fuente de verdad

- **Parcialmente terminadas / pendientes:**
  - Generación de cuestionarios (pendiente).

## Mejoras Recientes

### Knowledge Engine - Fase 2: Migración del Question Generator

1. **Generadores de Preguntas Actualizados**:
   - `boolean-generator.ts`: Soporte para KnowledgeNodes y formato antiguo
   - `multiple-choice-generator.ts`: Normalización de entrada para ambos formatos
   - Funciones ahora detectan automáticamente el tipo de entrada

2. **QuizManagement Migrado**:
   - Obtiene KnowledgeNodes asociados a materiales
   - Prioriza KnowledgeNodes como fuente principal de conocimiento
   - Fallback automático al formato antiguo si no hay KnowledgeNodes
   - Compatibilidad total con materiales existentes

3. **Estrategia de Transición**:
   - Ambos sistemas coexisten sin conflictos
   - Migración incremental sin breaking changes
   - Preparación para eliminación definitiva del modelo antiguo

### Sistema de Notificaciones

- **Toast.tsx**: Componente visual con variantes (info, success, warning, error)
- **ToastProvider.tsx**: Proveedor de contexto
- **useToast.ts**: Hook para uso fácil
- Integración en creación de materiales y otros flujos

### Mejoras de Experiencia de Usuario

- **MaterialCard.tsx**:
  - Opción para ocultar datos técnicos (`showDebugInfo`)
  - Visualización correcta de relaciones
  - Keys únicas para todos los elementos

- **AddMaterialModal.tsx**:
  - Estado de carga durante procesamiento
  - Botón deshabilitado para prevenir múltiples clics
  - Notificaciones de progreso

- **MaterialsPage.tsx**:
  - Datos técnicos ocultos por defecto
  - Experiencia limpia para usuarios finales

## Problemas conocidos

_(El dominio por tema ahora refleja el desempeño real del usuario en quizzes. El dominio por flashcards sigue siendo una aproximación basada en repeticiones.)_

## Decisiones técnicas

- Uso de `crypto.randomUUID()` para generación de IDs nativos.
- Implementación de un pipeline secuencial centralizado en `material.service`.
- Sistema de diseño coherente con TailwindCSS y componentes reutilizables.
- Detección automática de entorno para desarrollo vs producción.
- Mock local para desarrollo sin dependencias externas.
- Introducción gradual de Knowledge Engine sin romper funcionalidad existente.
- Estrategia de transición limpia con soporte para ambos formatos.

## Diseño Visual (Rediseño Fase 9)

### Sistema de Diseño Implementado

**Paleta de Colores:**

- Primaria: Indigo (600-500 para dark mode)
- Secundaria: Grises (200-800 para dark mode)
- Éxito: Verde (600-500 para dark mode)
- Peligro: Rojo (600-500 para dark mode)
- Advertencia: Amarillo (600-500 para dark mode)

**Tipografía:**

- Títulos: 3xl (1.875rem), 2xl (1.5rem), lg (1.125rem) - Font bold
- Texto principal: base (1rem) - Font medium
- Texto secundario: sm (0.875rem) - Font normal
- Jerarquía clara con colores adaptados para dark mode

**Espaciado:**

- Sistema basado en 4px (1rem = 16px)
- Padding consistente: p-4, p-6 para cards
- Margenes: mb-4, mb-6, mb-8 para separación de secciones
- Gaps: gap-2, gap-3, gap-4 para elementos internos

**Componentes Rediseñados:**

1. **Button.tsx**:
   - Variantes: primary, secondary, danger, success, warning
   - Tamaños: sm, md, lg
   - Estados: hover, focus, disabled, loading
   - Soporte completo para dark mode

2. **Card.tsx** (Nuevo):
   - Componentes base reutilizable
   - Variantes: default, elevated
   - Sombras consistentes
   - Dark mode integrado

3. **Modal.tsx** (Nuevo):
   - Estructura estándar con header, body, footer
   - Tamaños: sm, md, lg
   - Animaciones suaves
   - Accesibilidad mejorada

4. **Navbar.tsx**:
   - Enlaces con estados activos/hover
   - Dark mode completo
   - Espaciado consistente

5. **ThemeToggle.tsx**:
   - Iconos mejorados
   - Estados de focus visibles
   - Transiciones suaves

6. **SubjectCard.tsx**: Diseño consistente con Card base
7. **MaterialCard.tsx**: Jerarquía visual mejorada
8. **QuestionCard.tsx**: Feedback visual y estados
9. **FlashcardFlip.tsx**: Animaciones y dark mode
10. **QualityButtons.tsx**: Colores semánticos
11. **TopicMasteryChart.tsx**: Visualización mejorada
12. **WeakPointsList.tsx**: Diseño consistente
13. **QuestionList.tsx**: Tarjetas con etiquetas

### Páginas Actualizadas:

1. **Dashboard.tsx**: Empty states y diseño mejorado
2. **MaterialsPage.tsx**: Tarjetas consistentes
3. **QuizPlayer.tsx**: Visualización de resultados
4. **Flashcards.tsx**: Diseño de tarjetas
5. **Statistics.tsx**: Visualización de datos
6. **QuizManagement.tsx**: Migración a KnowledgeNodes y empty state mejorado

### Decisiones de Diseño:

- Paleta de colores basada en Indigo con soporte completo para dark mode
- Tipografía con jerarquía clara (títulos, texto, secundario)
- Espaciado consistente basado en 4px
- Estados interactivos visibles (hover, focus, active, disabled)
- Accesibilidad mejorada en todos los componentes

## Próxima tarea

- **Fase 3 del Knowledge Engine:** Migrar componentes restantes para eliminar dependencias de contenidoProcesado

## Próximos Pasos (orden según KNOWLEDGE_ENGINE_ROADMAP.md)

1. Completar **Fase 3 del Knowledge Engine** (Consolidación).

   > Nota: el detalle completo de cada fase (archivos a crear, componentes involucrados, criterios de finalización, riesgos) vive únicamente en `KNOWLEDGE_ENGINE_ROADMAP.md`. Este documento no debe repetir ni reinterpretar ese contenido — solo debe indicar en qué fase está el proyecto y qué falta de la fase actual.

## Pendiente de decisión

_(Sin items pendientes al momento de esta actualización. Usar esta sección para registrar cualquier ambigüedad o conflicto entre documentos que surja durante el desarrollo, hasta que se resuelva explícitamente.)_

## Historial de Cambios

- 2025-02-23: Configuración de scripts de test (Vitest) en `package.json` completada.
- 2023-11-20: Instalación de dependencias completada.
- 2023-11-20: Verificación de compilación y type-check exitosos.
- 2023-11-20: Completados modelos de datos y configuración DB.
- 2023-11-19: Aprobación final de arquitectura.
- 2025-02-23: Completada la generación y persistencia de preguntas Verdadero/Falso (Fase 4).
- 2025-02-23: Completado el Modo de Estudio: Práctica (Fase 5).
- 2025-02-23: Completada la implementación de Flashcards y Repetición Espaciada (Fase 6).
- 2025-02-23: Completada la implementación de Estadísticas y Aprendizaje Adaptativo (Fase 7).
- 2025-02-23: Completada la implementación de Soporte PDF y DOCX (Fase 8).
- 2025-02-23: Completada la implementación de Pulido de UI, Modo Oscuro y Optimización (Fase 9).
- 2025-02-23: Rediseño completo de UI con sistema de diseño coherente, mejoras de accesibilidad y dark mode completo.
- 2025-02-23: Persistencia real de intentos de quiz (IQuizAttempt), corrección del cálculo de dominio por tema en adaptive-engine para usar datos reales en lugar de asumir siempre respuesta correcta, y scopeo de Estadísticas por materia.
- 2025-02-23: Prevención de preguntas duplicadas al regenerar contenido, y agregado del generador de preguntas de opción múltiple junto al booleano existente.
- 2025-06-30: Incorporación de extracción de conceptos y definiciones asistida por IA (Mistral, Devstral Medium) mediante función serverless de Vercel como proxy seguro de la API key, con fallback automático al motor regex existente cuando no hay conexión a internet o la IA falla. Incluye sistema de notificaciones (Toast), manejo de estados de carga, y visualización de relaciones semánticas entre conceptos.
- 2025-07-01: Corrección de cinco problemas críticos: (1) Implementación de eliminación en cascada en subject.service.ts para evitar datos huérfanos en IndexedDB al borrar materias; (2) Corrección del modelo de Mistral en api/extract-concepts.ts de "mistral-medium" a "devstral-medium-2505"; (3) Simplificación de la detección de entorno en concept-extraction.service.ts eliminando la heurística frágil basada en puerto y usando siempre el endpoint /api/extract-concepts con fallback a regex cuando no hay conexión; (4) Corrección del bug en useQuizEngine.ts donde nextQuestion() marcaba el quiz como completo sin guardar intentos, ahora solo submitQuiz() persiste los intentos; (5) Configuración de SPA routing en vercel.json para evitar 404 en producción al refrescar o navegar directamente a rutas como /materiales/:id.
- 2025-07-15: **Implementación de Knowledge Engine - Fase 1**: (1) Creación del modelo IKnowledgeNode para representar unidades atómicas de conocimiento con tipos (concept, definition, relationship, example) y metadata para repetición espaciada; (2) Implementación de knowledge-node.service.ts con CRUD completo y funciones para crear nodos desde conceptos/definiciones; (3) Integración con material.service.ts para generación automática de KnowledgeNodes al procesar materiales; (4) Migración de base de datos a versión 8 con nueva tabla knowledgeNodes; (5) Coexistencia con arquitectura actual manteniendo compatibilidad con flashcards y materiales existentes.
- 2025-07-16: **Implementación de Knowledge Engine - Fase 2**: (1) Migración completa del Question Generator para usar KnowledgeNodes como fuente principal; (2) Actualización de boolean-generator.ts y multiple-choice-generator.ts para aceptar ambos formatos (KnowledgeNodes y formato antiguo); (3) Modificación de QuizManagement.tsx para obtener KnowledgeNodes asociados a materiales y usarlos preferentemente; (4) Implementación de estrategia de transición limpia con fallback automático al formato antiguo cuando no hay KnowledgeNodes; (5) Consolidación del Knowledge Engine como nueva fuente de verdad para la generación de preguntas.

## ⚠️ Funcionalidades Pendientes

- Escritura de pruebas unitarias adicionales para componentes críticos.
- Documentación final del proyecto (README, diagramas).
- Fase 3 del Knowledge Engine: Migrar componentes restantes para eliminar dependencias de contenidoProcesado.

## ❗ Problemas Conocidos

_(Sin problemas conocidos activos.)_

## 🎨 Mejoras de Diseño (Fase 9 - Rediseño)

### Componentes Rediseñados:

- `Button.tsx`: Variantes, tamaños, estados completos
- `Card.tsx`: Nuevo componente base reutilizable
- `Modal.tsx`: Nuevo componente con estructura estándar
- `Navbar.tsx`: Enlaces con estados mejorados
- `ThemeToggle.tsx`: Iconos y transiciones mejoradas
- `SubjectCard.tsx`: Diseño consistente con Card base
- `MaterialCard.tsx`: Jerarquía visual mejorada
- `QuestionCard.tsx`: Feedback visual y estados
- `FlashcardFlip.tsx`: Animaciones y dark mode
- `QualityButtons.tsx`: Colores semánticos
- `TopicMasteryChart.tsx`: Visualización mejorada
- `WeakPointsList.tsx`: Diseño consistente
- `QuestionList.tsx`: Tarjetas con etiquetas

### Páginas Actualizadas:

- `Dashboard.tsx`: Empty states y diseño mejorado
- `MaterialsPage.tsx`: Tarjetas consistentes
- `QuizPlayer.tsx`: Visualización de resultados
- `Flashcards.tsx`: Diseño de tarjetas
- `Statistics.tsx`: Visualización de datos
- `QuizManagement.tsx`: Migración a KnowledgeNodes y empty state mejorado

### Decisiones de Diseño:

- Paleta de colores basada en Indigo con soporte completo para dark mode
- Tipografía con jerarquía clara (títulos, texto, secundario)
- Espaciado consistente basado en 4px
- Estados interactivos visibles (hover, focus, active, disabled)
- Accesibilidad mejorada en todos los componentes
