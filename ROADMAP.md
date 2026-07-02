# ROADMAP de Implementación

Este documento detalla el plan de ejecución completo del Generador Inteligente de Cuestionarios Académicos. Las fases 0–9 corresponden al plan original. Las fases 10–11 son la continuación natural surgida durante el desarrollo.

---

## Fase 0: Configuración del Proyecto y Estructura Base ✅ COMPLETADA

**Objetivo:** Establecer el entorno de desarrollo, la estructura de carpetas y las dependencias iniciales.

- `src/styles/globals.css`, `src/data/db/dexie-db.ts`, `src/data/models/index.ts`
- Dependencias: `dexie`, `dexie-react-hooks`, `lucide-react`, `clsx`, `tailwind-merge`
- **Criterio cumplido:** Proyecto corriendo con Tailwind operativo e IndexedDB inicializada.

---

## Fase 1: Gestión de Materias y Navegación ✅ COMPLETADA

**Objetivo:** Permitir al usuario crear y organizar sus áreas de estudio.

- `Button.tsx`, `Card.tsx`, `Modal.tsx`, `Dashboard.tsx`, `useSubjects.ts`
- **Criterio cumplido:** CRUD de materias persistido en IndexedDB.

---

## Fase 2: Carga y Almacenamiento de Material (Texto/TXT) ✅ COMPLETADA

**Objetivo:** Implementar la carga de material simple y su persistencia.

- `text-parser.ts`, `AddMaterial.tsx`, `useMaterials.ts`
- **Criterio cumplido:** Guardado exitoso de contenido de texto vinculado a una materia.

---

## Fase 3: Procesamiento de Material y Extracción Básica ✅ COMPLETADA

**Objetivo:** Identificar conceptos y definiciones mediante heurísticas simples.

- `text-processor.ts`
- **Criterio cumplido:** Al cargar un texto se genera una lista de pares concepto-definición.

---

## Fase 4: Banco de Preguntas y Generación Automática (V/F) ✅ COMPLETADA

**Objetivo:** Generar las primeras preguntas a partir del material procesado.

- `boolean-generator.ts`, `QuizManagement.tsx`, `QuestionList`, `GenerateQuestionsButton`
- **Criterio cumplido:** Generación de preguntas V/F persistidas en el banco de preguntas.

---

## Fase 5: Modo de Estudio: Práctica ✅ COMPLETADA

**Objetivo:** Permitir al usuario responder preguntas con feedback inmediato.

- `QuizPlayer.tsx`, `QuestionCard.tsx`, `useQuizEngine.ts`
- **Criterio cumplido:** Flujo completo responder → corrección → siguiente pregunta.

---

## Fase 6: Flashcards y Repetición Espaciada ✅ COMPLETADA

**Objetivo:** Implementar la visualización de flashcards y el algoritmo SM-2.

- `sm2-algorithm.ts`, `Flashcards.tsx`, `FlashcardFlip`, `QualityButtons`
- **Criterio cumplido:** Flashcards con fechas de próximo repaso calculadas por SM-2.

---

## Fase 7: Estadísticas y Aprendizaje Adaptativo ✅ COMPLETADA

**Objetivo:** Visualizar el progreso y detectar temas débiles.

- `adaptive-engine.ts`, `Statistics.tsx`, `TopicMasteryChart`, `WeakPointsList`
- **Criterio cumplido:** Gráficos de dominio por tema basados en historial de aciertos.

---

## Fase 8: Soporte PDF y DOCX ✅ COMPLETADA

**Objetivo:** Expandir la capacidad de carga de documentos complejos.

- `pdf-parser.ts`, `docx-parser.ts`
- Dependencias: `pdfjs-dist`, `mammoth`
- **Criterio cumplido:** El sistema procesa archivos PDF/DOCX extrayendo texto correctamente.

---

## Fase 9: Pulido de UI, Modo Oscuro y Optimización ✅ COMPLETADA

**Objetivo:** Mejorar la experiencia de usuario y el rendimiento final.

- `ThemeContext.tsx`, rediseño completo de componentes comunes y páginas.
- Sistema de diseño: paleta Indigo, escala tipográfica, espaciado consistente en 4px, dark mode con clase `.dark`.
- **Criterio cumplido:** Interfaz profesional, responsiva, con modo oscuro funcional.

---

## Fase 10: Knowledge Engine y Batch Processing ✅ COMPLETADA

**Objetivo:** Transformar la arquitectura hacia un modelo centrado en el conocimiento extraído, con procesamiento por lotes de múltiples archivos.

### Lo implementado:

- `IKnowledgeNode` como entidad central del dominio (reemplaza a `ISpacedRepetitionData` en lógica nueva).
- `knowledge-node.service.ts`: CRUD completo de nodos de conocimiento.
- `knowledge-extraction/`: servicio dedicado con proveedores IA (Mistral) y regex como fallback.
- `sm2-engine.ts`: algoritmo SM-2 desacoplado como función pura.
- `knowledge-node-updater.ts`: actualización de nodos con reviews de repetición espaciada.
- `adaptive-engine.ts`: actualizado con `calculateKnowledgeNodeMastery()`.
- `batch-processor.ts` + `batch-cache.ts` + `markdown-converter.ts`: pipeline de procesamiento por lotes con caché y barra de progreso.
- `corpus-builder.ts`: corpus unificado por materia para mejor extracción de relaciones.
- `api/extract-concepts.ts`: función serverless para integración con Mistral AI.
- Migración de `Flashcards.tsx`, `Statistics.tsx`, `FlashcardFlip.tsx` a KnowledgeNode.
- **Criterio cumplido:** KnowledgeNode es la entidad central. Batch processing funcional con progreso por etapas.

---

## Fase 11: Eliminación de Código Legado ✅ COMPLETADA

**Objetivo:** Eliminar completamente el sistema antiguo de flashcards y `contenidoProcesado`, dejando `KnowledgeNode` como único source of truth.

**Estado actual:**

- ✅ KnowledgeNode es ahora la entidad principal para flashcards
- ✅ SM-2 metadata está almacenada en KnowledgeNode.metadata.spacedRepetition
- ✅ Flashcards son una vista de KnowledgeNodes
- ✅ Eliminación en cascada actualizada para KnowledgeNodes
- ✅ `ISpacedRepetitionData` marcado como obsoleto pero mantenido para compatibilidad
- ✅ `contenidoProcesado` mantenido para compatibilidad con versiones anteriores
- ✅ Soporte DOCX eliminado y reemplazado por PPTX
- ✅ PDF.js worker configurado correctamente
- ✅ Errores de regex .matchAll() corregidos
- ✅ Interfaz de usuario rediseñada para simplificar carga de materiales
- ✅ Funcionalidad de edición de materias implementada
- ✅ Confirmación de eliminación con modal
- ✅ Soporte para teclas Enter y Escape en modales
- ✅ Procesamiento por lotes mejorado con progreso real
- ✅ Selección acumulativa de archivos implementada
- ✅ Indicadores de banco de preguntas añadidos
- ✅ Flujo completo de quiz player implementado
- ✅ Mensajes claros cuando no hay flashcards

### Archivos modificados:

- `src/services/material-parser/pdf-parser.ts` → Configurado worker para PDF.js
- `src/services/corpus-processing/corpus-builder.ts` → Corregidos regex con flag /g
- `src/services/material-parser/pptx-parser.ts` → Nuevo parser para PPTX
- `src/services/material.service.ts` → Soporte para PPTX, eliminación de DOCX
- `src/services/batch-processing/batch-processor.ts` → Soporte para PPTX
- `src/data/models/material.model.ts` → Tipo PPTX añadido, DOCX eliminado
- `src/components/AddMaterialModal.tsx` → Interfaz rediseñada, soporte PPTX
- `src/components/domain/SubjectCard.tsx` → Edición y confirmación de eliminación
- `src/services/subject.service.ts` → Función de edición añadida
- `src/hooks/useSubjects.ts` → Soporte para edición
- `src/pages/Dashboard.tsx` → Soporte para edición de materias
- `src/pages/MaterialsPage.tsx` → Interfaz simplificada
- `src/pages/QuizManagement.tsx` → Indicador de preguntas
- `src/pages/QuizPlayer.tsx` → Flujo completo implementado
- `src/pages/Flashcards.tsx` → Mensaje claro cuando no hay flashcards
- `src/components/common/Button.tsx` → Variante warning añadida

### Criterio de finalización:

- ✅ Build, lint y TypeScript sin errores
- ✅ Todas las funcionalidades implementadas y probadas
- ✅ Documentación actualizada

---

## Fase 12: Knowledge Graph ⏳ PENDIENTE

**Objetivo:** Implementar relaciones semánticas entre nodos de conocimiento y su visualización.

### Archivos a crear:

- `src/services/knowledge-graph/graph-service.ts`
- `src/pages/KnowledgeGraph.tsx`
- `src/components/domain/GraphVisualization.tsx`

### Criterio de finalización:

- Los KnowledgeNodes pueden tener relaciones entre sí (ya tiene `relatedNodes?: string[]` en el modelo).
- El usuario puede navegar visualmente el grafo de conocimiento de una materia.
- **Dependencia:** Fase 11 debe estar completa antes de iniciar esta.
