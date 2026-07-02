# Estado del Proyecto: Generador Inteligente de Cuestionarios Académicos

## Arquitectura

SPA React + TypeScript + Vite + TailwindCSS. Persistencia local mediante Dexie.js (IndexedDB). Integración opcional con Mistral AI via función serverless (Vercel).

### Árbol Principal

```
src/
├── components/
│   ├── common/       Button, Card, Modal, Navbar, ThemeToggle, Toast, ToastProvider
│   ├── domain/       FlashcardFlip, GenerateQuestionsButton, MaterialCard,
│   │                 QualityButtons, QuestionCard, QuestionList, SubjectCard,
│   │                 TopicMasteryChart, WeakPointsList
│   └── layout/       MainLayout
├── contexts/         ThemeContext, theme-utils, ToastContext
├── hooks/            useMaterials, useSubjects, useQuizEngine, useTheme, useToast
├── pages/            Dashboard, Flashcards, MaterialsPage, NotFoundPage,
│                     QuizManagement, QuizPlayer, Statistics
├── routes/           index.tsx
├── services/
│   ├── ai/                        concept-extraction.service.ts (Mistral + mock)
│   ├── adaptive-learning/         adaptive-engine.ts
│   ├── batch-processing/          batch-processor.ts, batch-cache.ts
│   ├── corpus-processing/         corpus-builder.ts
│   ├── knowledge-extraction/      extraction-service.ts, providers/ai-provider.ts,
│   │                              providers/regex-provider.ts
│   ├── material-parser/           text-parser.ts, text-processor.ts, pdf-parser.ts,
│   │                              docx-parser.ts, markdown-converter.ts
│   ├── question-generator/        boolean-generator.ts, multiple-choice-generator.ts
│   ├── spaced-repetition/         sm2-engine.ts, sm2-algorithm.ts*, knowledge-node-updater.ts
│   ├── flashcard.service.ts*
│   ├── knowledge-node.service.ts
│   ├── material.service.ts
│   ├── question.service.ts
│   └── subject.service.ts
├── data/
│   ├── db/           dexie-db.ts (versión 8, tabla knowledgeNodes activa)
│   └── models/       index.ts, materia.model.ts, material.model.ts, question.model.ts,
│                     knowledge-node.model.ts, etiqueta.model.ts,
│                     spaced-repetition.model.ts*
├── mocks/            ai-mock.ts
└── api/              extract-concepts.ts (serverless Vercel)
```

`*` = archivos con código legado pendiente de eliminación (Fase 11).

### Modelos de datos activos

- `IMateria`, `IMaterial`, `IEtiqueta`, `IQuestion`, `IKnowledgeNode`

### Modelos legado (pendientes de eliminar en Fase 11)

- `ISpacedRepetitionData` (en `spaced-repetition.model.ts`) - Marcado como obsoleto pero mantenido para compatibilidad temporal

### Tablas Dexie activas

- `materiales`, `materias`, `etiquetas`, `questions`, `knowledgeNodes`, `quizAttempts`, `batchCache`

### Tablas Dexie legado (pendientes de eliminar en Fase 11)

- `flashcards` - Ya eliminada, KnowledgeNode es ahora la entidad principal

---

## Funcionalidades Terminadas

- Gestión de materias (CRUD).
- Sistema de rutas (Router).
- Carga, visualización y eliminación de materiales.
- Carga individual: texto manual, TXT, PDF, DOCX.
- Carga por lotes (batch): múltiples PDFs/DOCX con conversión a Markdown, caché por hash de contenido, barra de progreso por etapas.
- Extracción de conocimiento: IA (Mistral) con fallback automático a regex.
- KnowledgeNodes: entidad central del dominio, CRUD completo, generación automática al cargar material.
- Banco de preguntas: V/F y opción múltiple generadas desde KnowledgeNodes.
- Modo práctica: flujo completo responder → corrección inmediata → siguiente.
- Flashcards con repetición espaciada SM-2 (basado en KnowledgeNodes).
- Estadísticas y aprendizaje adaptativo (basado en KnowledgeNodes).
- UI: modo claro/oscuro funcional, diseño con Indigo como color primario, dark mode vía clase `.dark`, componentes reutilizables con estados completos.

---

## Funcionalidades Pendientes

- **Fase 11** — Eliminación de código legado (ver detalle en ROADMAP.md).
- **Fase 12** — Knowledge Graph (visualización de relaciones entre KnowledgeNodes).
- Testing: cobertura actual ~50%, pendiente aumentar en servicios críticos.
- Soporte para algoritmo FSRS (alternativa a SM-2).
- Gamificación (rachas, logros, objetivos diarios) — opcional según PROJECT_SPEC.md.

---

## Próxima Tarea

**Fase 12 — Knowledge Graph.**

Orden recomendado de ejecución:

1. Implementar relaciones semánticas entre nodos de conocimiento
2. Crear visualización de grafo de conocimiento
3. Permitir navegación visual del grafo por materia

---

## Próximos Pasos

1. Completar **Fase 11** (deuda técnica — prioridad alta).
2. Iniciar **Fase 12** — Knowledge Graph (prioridad media, requiere Fase 11 completa).

> El detalle de criterios, archivos y riesgos de cada fase vive en `ROADMAP.md`. Este documento solo registra el estado actual y la próxima tarea.

---

## Decisiones Técnicas

- `crypto.randomUUID()` para generación de IDs nativos.
- Pipeline de extracción centralizado en `knowledge-extraction/` (no en `material.service`).
- Detección automática de entorno: mock local en desarrollo, API Mistral en producción.
- Transición incremental: KnowledgeNode coexistió con sistema antiguo hasta migración completa de consumidores.
- Batch processing con caché por hash de contenido para evitar reprocesamientos.
- `darkMode: 'class'` en Tailwind — la clase `.dark` en `<html>` es la única fuente de verdad del tema.

---

## Problemas Conocidos

_(Sin problemas conocidos activos.)_

---

## Pendiente de Decisión

_(Sin items pendientes. Usar esta sección si surge alguna ambigüedad entre documentos durante el desarrollo.)_

---

## Historial de Cambios

- 2026-07-03: Implementación completa de funcionalidades pendientes:
  - Soporte PPTX (reemplazo de DOCX)
  - Configuración de PDF.js worker
  - Corrección de errores regex .matchAll()
  - Rediseño de interfaz de carga de materiales
  - Edición de materias con soporte de teclas
  - Confirmación de eliminación con modal
  - Selección acumulativa de archivos
  - Indicadores de banco de preguntas
  - Flujo completo de quiz player
  - Mensajes claros para flashcards
  - Progreso real en procesamiento por lotes
- 2026-07-02: Consolidación de documentación. Se eliminan 11 archivos `.md` de la raíz. ROADMAP.md actualizado con Fases 10-12. MASTER_PROJECT_STATE.md reescrito como única fuente de verdad del estado.
- 2025-xx-xx: Batch Processing implementado (Fase 10 completada).
- 2025-xx-xx: Knowledge Engine completo — KnowledgeNode como entidad central, consumidores migrados (Fase 10).
- 2025-xx-xx: Pulido de UI y modo oscuro (Fase 9 completada).
- 2025-xx-xx: Soporte PDF/DOCX (Fase 8 completada).
- 2025-xx-xx: Estadísticas y aprendizaje adaptativo (Fase 7 completada).
- 2025-xx-xx: Flashcards y repetición espaciada SM-2 (Fase 6 completada).
- 2025-xx-xx: Modo práctica (Fase 5 completada).
- 2025-xx-xx: Banco de preguntas V/F (Fase 4 completada).
- 2025-xx-xx: Procesamiento y extracción básica (Fase 3 completada).
- 2025-xx-xx: Carga de material de texto (Fase 2 completada).
- 2025-xx-xx: Gestión de materias y navegación (Fase 1 completada).
- 2025-02-23: Configuración de Vitest completada.
- 2023-11-20: Instalación de dependencias, compilación y type-check exitosos.
- 2023-11-19: Aprobación final de arquitectura.
