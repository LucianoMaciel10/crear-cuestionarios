# Estado del Proyecto: Generador Inteligente de Cuestionarios Académicos

## Estado General

Proyecto en desarrollo activo. Pipeline de procesamiento de texto (carga + extracción con IA) funcional e infraestructura de navegación completa.

- **Fase actual:** Fase 9 (Pulido de UI, Modo Oscuro y Optimización) - COMPLETADA
- **Avance aproximado:** 85% (rediseño de UI completado, integración con IA funcional)

## Arquitectura

SPA React + TypeScript + Vite + TailwindCSS. Persistencia local mediante Dexie.js (IndexedDB).

### Árbol Principal

- `src/components/`: common, domain, layout
- `src/contexts/`: ThemeContext, theme-utils, ToastContext (nuevo)
- `src/hooks/`: useMaterials, useSubjects, useQuizEngine, useTheme, useToast (nuevo)
- `src/pages/`: Dashboard, MaterialsPage, NotFoundPage, QuizManagement, QuizPlayer, Flashcards, Statistics
- `src/routes/`: index.tsx (Router configuración)
- `src/services/`: material.service, material-parser/, question.service, question-generator/, flashcard.service, spaced-repetition/, adaptive-learning/, ai/ (nuevo)
- `src/mocks/`: ai-mock.ts (nuevo para desarrollo)
- `api/`: extract-concepts.ts (función serverless para IA)

### Modelos de datos

- `IMaterial`, `IMateria`, `IEtiqueta`, `IQuestion`, `IRelacion`, `IFlashcard`, `ISpacedRepetitionData`, `ITopicMastery`, `IWeakPoint`

### Nuevos Componentes

- `Toast.tsx`: Sistema de notificaciones
- `ToastProvider.tsx`: Proveedor de contexto para toasts
- `ToastContext.ts`: Contexto para notificaciones
- `useToast.ts`: Hook para notificaciones

### Nuevos Servicios

- `concept-extraction.service.ts`: Servicio para extracción de conceptos con IA
- `ai-mock.ts`: Mock para desarrollo local sin dependencias externas

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

- **Parcialmente terminadas / pendientes:**
  - Generación de cuestionarios (pendiente).

## Mejoras Recientes

### Integración con IA (Mistral Devstral Medium)

1. **Función Serverless** (`api/extract-concepts.ts`):
   - Proxy seguro para Mistral API
   - Validación de API key desde variables de entorno
   - Manejo de errores robusto
   - Extracción de conceptos, definiciones y relaciones

2. **Servicio Cliente** (`src/services/ai/concept-extraction.service.ts`):
   - Detección automática de entorno (dev/prod)
   - Mock local para desarrollo sin API keys
   - Validación estricta de tipos
   - Fallback automático

3. **Integración con Material Service**:
   - Mapeo de relaciones de Mistral API al modelo local
   - Logging mejorado
   - Manejo de estados de carga

4. **Experiencia de Usuario**:
   - Notificaciones visuales (Toast)
   - Estados de carga en botones
   - Prevención de múltiples clics
   - Feedback claro durante procesamiento

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
12. \*\*WeakPointsList.tsx`: Diseño consistente
13. **QuestionList.tsx**: Tarjetas con etiquetas

### Páginas Actualizadas:

1. **Dashboard.tsx**: Empty states y diseño mejorado
2. **MaterialsPage.tsx**: Tarjetas consistentes
3. **QuizPlayer.tsx**: Visualización de resultados
4. **Flashcards.tsx**: Diseño de tarjetas
5. **Statistics.tsx**: Visualización de datos
6. **QuizManagement.tsx**: Empty state mejorado

### Decisiones de Diseño:

- Paleta de colores basada en Indigo con soporte completo para dark mode
- Tipografía con jerarquía clara (títulos, texto, secundario)
- Espaciado consistente basado en 4px
- Estados interactivos visibles (hover, focus, active, disabled)
- Accesibilidad mejorada en todos los componentes

## Próxima tarea

- **Pruebas y Documentación Final:**
  - Escribir pruebas unitarias para los nuevos componentes y servicios.
  - Actualizar la documentación del proyecto (README, diagramas).
  - **Criterio de finalización:** Cobertura de pruebas razonable y documentación actualizada.

## Próximos Pasos (orden según ROADMAP.md)

1. Completar **Pruebas y Documentación Final**.

> Nota: el detalle completo de cada fase (archivos a crear, componentes involucrados, criterios de finalización, riesgos) vive únicamente en `ROADMAP.md`. Este documento no debe repetir ni reinterpretar ese contenido — solo debe indicar en qué fase está el proyecto y qué falta de la fase actual.

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

## ⚠️ Funcionalidades Pendientes

- Escritura de pruebas unitarias adicionales para componentes críticos.
- Documentación final del proyecto (README, diagramas).

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
- `QuizManagement.tsx`: Empty state mejorado

### Decisiones de Diseño:

- Paleta de colores basada en Indigo con soporte completo para dark mode
- Tipografía con jerarquía clara (títulos, texto, secundario)
- Espaciado consistente basado en 4px
- Estados interactivos visibles (hover, focus, active, disabled)
- Accesibilidad mejorada en todos los componentes
