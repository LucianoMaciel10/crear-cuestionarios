# Estado del Proyecto: Generador Inteligente de Cuestionarios Académicos

## Estado General

Proyecto en desarrollo activo con pipeline de procesamiento por lotes implementado. La aplicación ahora soporta carga múltiple de PDFs/DOCX con conversión a Markdown, caché de archivos y procesamiento por etapas con barra de progreso.

- **Fase actual:** Implementación de Batch Processing (Completada)
- **Avance aproximado:** 92% (Pipeline de procesamiento por lotes funcional)

## Arquitectura

SPA React + TypeScript + Vite + TailwindCSS. Persistencia local mediante Dexie.js (IndexedDB).

### Árbol Principal

- `src/components/`: common, domain, layout
- `src/contexts/`: ThemeContext, theme-utils, ToastContext
- `src/hooks/`: useMaterials, useSubjects, useQuizEngine, useTheme, useToast
- `src/pages/`: Dashboard, MaterialsPage, NotFoundPage, QuizManagement, QuizPlayer, Flashcards, Statistics
- `src/routes/`: index.tsx (Router configuración)
- `src/services/`:
  - material.service.ts (actualizado con batch processing)
  - material-parser/ (pdf-parser, docx-parser, markdown-converter)
  - batch-processing/ (batch-processor, batch-cache)
  - question.service.ts
  - question-generator/ (boolean-generator, multiple-choice-generator)
  - flashcard.service.ts
  - spaced-repetition/ (sm2-engine, sm2-algorithm, knowledge-node-updater)
  - adaptive-learning/ (adaptive-engine)
  - ai/ (concept-extraction.service)
  - knowledge-node.service.ts
  - knowledge-extraction/ (extraction-service)
- `src/mocks/`: ai-mock.ts
- `api/`: extract-concepts.ts (función serverless para IA)

### Modelos de datos

- `IMaterial`, `IMateria`, `IEtiqueta`, `IQuestion`, `IRelacion`, `IFlashcard`, `ISpacedRepetitionData`, `ITopicMastery`, `IWeakPoint`, `IKnowledgeNode`

### Nuevos Componentes

- `markdown-converter.ts`: Conversión de texto a Markdown estructurado
- `batch-processor.ts`: Procesamiento por lotes con progreso por etapas
- `batch-cache.ts`: Sistema de caché para evitar reprocesamientos

### Nuevos Servicios

- `processBatchMaterials()`: Procesamiento múltiple de archivos
- `BatchProcessor`: Clase para manejo de procesamiento por lotes
- `BatchCache`: Sistema de caché con IndexedDB

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
  - **Batch Processing - Fase 1 (NUEVO):**
    - Procesamiento por lotes de múltiples archivos
    - Conversión a Markdown estructurado
    - Barra de progreso por etapas
    - Sistema de caché para evitar reprocesamientos
    - Generación de KnowledgeNodes y preguntas en batch

- **Parcialmente terminadas / pendientes:**
  - Eliminación final de código legado (ISpacedRepetitionData, tabla flashcards)
  - Implementación de Knowledge Graph
  - Soporte para algoritmo FSRS

## Mejoras Recientes

### Batch Processing - Pipeline de Procesamiento por Lotes

1. **Nuevo Flujo de Procesamiento:**
   - Carga múltiple de PDFs/DOCX
   - Conversión unificada a Markdown
   - Almacenamiento en caché con hash de contenido
   - Procesamiento por etapas con progreso visible
   - Generación de KnowledgeNodes y preguntas

2. **Componentes Actualizados:**
   - `AddMaterialModal.tsx`: Soporte para batch mode
   - `MaterialsPage.tsx`: Botón para carga múltiple
   - `material.service.ts`: Nueva función `processBatchMaterials()`

3. **Nuevos Servicios:**
   - `BatchProcessor`: Manejo de procesamiento por lotes
   - `BatchCache`: Sistema de caché con IndexedDB
   - `MarkdownConverter`: Conversión a Markdown estructurado

4. **Experiencia de Usuario Mejorada:**
   - Barra de progreso por etapas

- Notificaciones de progreso
- Manejo de errores mejorado
- Feedback visual en cada etapa

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
- Implementación de batch processing con caché para mejorar performance.

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
13. \*\*QuestionList.tsx`: Tarjetas con etiquetas
14. **AddMaterialModal.tsx**: Soporte para batch processing

### Páginas Actualizadas:

1. **Dashboard.tsx**: Empty states y diseño mejorado
2. **MaterialsPage.tsx**: Tarjetas consistentes + botón de batch processing
3. **QuizPlayer.tsx**: Visualización de resultados
4. \*\*Flashcards.tsx`: Diseño de tarjetas
5. \*\*Statistics.tsx`: Visualización de datos
6. \*\*QuizManagement.tsx`: Migración a KnowledgeNodes y empty state mejorado

### Decisiones de Diseño:

- Paleta de colores basada en Indigo con soporte completo para dark mode
- Tipografía con jerarquía clara (títulos, texto, secundario)
- Espaciado consistente basado en 4px
- Estados interactivos visibles (hover, focus, active, disabled)
- Accesibilidad mejorada en todos los componentes

## Próxima tarea

- **Fase de Estabilización**: Validar batch processing en producción
- **Fase 8 del Knowledge Engine**: Eliminación final de sistema antiguo

## Próximos Pasos (orden según KNOWLEDGE_ENGINE_ROADMAP.md)

1. **Estabilizar Batch Processing** (Prioridad Alta):
   - [ ] Validar en múltiples navegadores
   - [ ] Optimizar rendimiento con archivos grandes
   - [ ] Mejorar manejo de errores
   - [ ] Añadir pruebas unitarias
2. **Completar Fase 8 del Knowledge Engine** (Eliminación Final):
   - [ ] Deprecar ISpacedRepetitionData
   - [ ] Eliminar tabla flashcards de Dexie
   - [ ] Eliminar contenidoProcesado completamente
   - [ ] Validar KnowledgeNode como único Source of Truth
   - [ ] Eliminar adaptadores obsoletos
   - [ ] Eliminar funciones marcadas como @deprecated

3. **Implementar Knowledge Graph** (Prioridad Media):
   - [ ] Implementar relaciones entre nodos
   - [ ] Crear visualización de grafo de conocimiento
   - [ ] Implementar navegación por relaciones semánticas

## Estado del Knowledge Engine

### Componentes ya migrados a Knowledge Engine:

- ✅ Question Generator (generación de preguntas)
- ✅ QuizManagement (gestión de cuestionarios)
- ✅ Knowledge Extraction Service (extracción de conocimiento)
- ✅ KnowledgeNode Service (gestión de nodos)
- ✅ Flashcard System (migrado a KnowledgeNode)
- ✅ SM-2 Algorithm (desacoplado y puro)
- ✅ KnowledgeNode Updater (actualización de nodos)
- ✅ Adaptive Engine (adaptado a KnowledgeNode)
- ✅ Batch Processing (procesamiento por lotes)

### Consumidores migrados:

- ✅ Flashcards.tsx → KnowledgeNode
- ✅ Statistics.tsx → KnowledgeNode
- ✅ FlashcardFlip.tsx → KnowledgeNode
- ✅ flashcard.service.ts → Métodos basados en KnowledgeNode
- ✅ MaterialsPage.tsx → Soporte para batch processing
- ✅ AddMaterialModal.tsx → Batch mode

### Código legado pendiente:

- ❌ `ISpacedRepetitionData` (modelo obsoleto)
- ❌ `sm2-algorithm.ts` (funciones antiguas)
- ❌ `adaptive-engine.ts` (funciones antiguas)
- ❌ `subject.service.ts` (eliminación en cascada)
- ❌ Tabla `flashcards` en Dexie

### Consolidación del Dominio: ✅ COMPLETADA

**Nuevo modelo de KnowledgeNode:**

- Soporte para múltiples algoritmos (SM-2, FSRS, custom)
- Historial completo de reviews
- Metadata estructurada
- Relaciones entre nodos

### Batch Processing: ✅ IMPLEMENTADO

**Nuevo pipeline de procesamiento:**

- Carga múltiple de archivos
- Conversión a Markdown
- Caché de archivos
- Procesamiento por etapas
- Barra de progreso
- Generación de KnowledgeNodes y preguntas

## Porcentaje de Avance

**Global: 92%**

- Backend / Lógica: 95%
- Knowledge Engine: 95%
- Batch Processing: 90% (nuevo)
- UI/UX: 95%
- Testing: 50%
- Documentación: 85%

**El proyecto está listo para pruebas de usuario con el nuevo pipeline de batch processing.**
