# ROADMAP de Implementación

Este documento detalla el plan de ejecución completo del Generador Inteligente de Cuestionarios Académicos. Las fases 0–9 corresponden al plan original. Las fases 10–12 son la continuación natural surgida durante el desarrollo.

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

## Fase 12: Material Processing Pipeline Stabilization ✅ COMPLETADA

**Objetivo:** Reconstruir completamente el pipeline de procesamiento de materiales para resolver problemas arquitectónicos y garantizar estabilidad.

### Lo implementado:

1. **Nueva Arquitectura Obligatoria:**
   - ARCHIVO ORIGINAL → CREAR MATERIAL → GUARDAR material.id → EXTRAER TEXTO → MARKDOWN → CORPUS → CHUNKS → EXTRACCIÓN DE CONOCIMIENTO → CREACIÓN DE KNOWLEDGENODES → GENERACIÓN DE PREGUNTAS → ACTUALIZACIÓN DEL MATERIAL → COMPLETED

2. **Refactor del Modelo Material:**
   - Añadidos campos de estado: `processingStatus`, `processingStartedAt`, `processingFinishedAt`, `processingError`
   - Añadidas estadísticas: `conceptCount`, `definitionCount`, `questionCount`
   - Añadidos campos originales: `originalFilename`, `fileType`

3. **Refactor del Batch Processor:**
   - Eliminada creación de materiales desde chunks
   - Materiales creados inmediatamente al inicio
   - `materialId` mantenido durante todo el pipeline
   - KnowledgeNodes asociados correctamente con `sourceMaterialId`
   - Eliminados nombres de chunks visibles

4. **Refactor de MaterialCard:**
   - Eliminada dependencia de `knowledgeNodes.length === 0`
   - Display basado en `processingStatus` real
   - Mostrar nombre original y tipo correcto
   - Estados claros: Pendiente, Procesando, Completado, Error

5. **Refactor de PDF.js:**
   - Eliminada dependencia de CDN externo
   - Worker local configurado correctamente
   - Eliminados errores 404

6. **Refactor de AddMaterialModal:**
   - Reset completo al cerrar
   - Eliminado selector de tipo para texto manual
   - Mejorada UX

7. **Refactor de Dexie DB:**
   - Versión 10 con índice para `processingStatus`

8. **Refactor de Material Service:**
   - Funciones `createMaterial` y `updateMaterialProcessingStatus`
   - Eliminados IDs temporales
   - Actualización con resultados reales

### Problemas Resueltos:

- ✅ Eliminados nombres `chunk-0-Untitled.md`
- ✅ Tipos de archivo correctos (PDF, PPTX, TXT, MD)
- ✅ KnowledgeNodes asociados correctamente
- ✅ MaterialCard muestra datos reales
- ✅ Progreso real en todas las etapas
- ✅ Eliminados estados visuales falsos
- ✅ Chunks como implementación interna
- ✅ PDF.js funciona correctamente
- ✅ PPTX extrae texto correctamente
- ✅ Eliminada duplicación de llamadas a Mistral
- ✅ Barra de progreso refleja estado real
- ✅ Modal se resetea completamente
- ✅ Texto manual siempre es tipo "texto"

### Archivos Modificados:

- `src/data/models/material.model.ts` → Campos de estado y estadísticas
- `src/services/material.service.ts` → Nuevas funciones de creación y actualización
- `src/services/batch-processing/batch-processor.ts` → Nueva arquitectura
- `src/services/material-parser/pdf-parser.ts` → Worker local
- `src/components/domain/MaterialCard.tsx` → Display basado en estado real
- `src/components/AddMaterialModal.tsx` → Reset completo y mejoras UX
- `src/data/db/dexie-db.ts` → Versión 10 con nuevo índice

### Criterio de Finalización:

- ✅ Build: `npm run build` - exitoso
- ✅ Lint: `npm run lint` - exitoso
- ✅ TypeScript: `npx tsc --noEmit` - exitoso
- ✅ Validación con PDF real
- ✅ Validación con PPTX real
- ✅ Validación con TXT real
- ✅ Estados de procesamiento correctos
- ✅ KnowledgeNodes asociados correctamente
- ✅ MaterialCard muestra información real

---

## Fase 13: Knowledge Graph ⏳ PENDIENTE

**Objetivo:** Implementar relaciones semánticas entre nodos de conocimiento y su visualización.

### Archivos a crear:

- `src/services/knowledge-graph/graph-service.ts`
- `src/pages/KnowledgeGraph.tsx`
- `src/components/domain/GraphVisualization.tsx`

### Criterio de finalización:

- Los KnowledgeNodes pueden tener relaciones entre sí (ya tiene `relatedNodes?: string[]` en el modelo).
- El usuario puede navegar visualmente el grafo de conocimiento de una materia.
- **Dependencia:** Fase 12 debe estar completa antes de iniciar esta.

---

## Decisiones Arquitectónicas Clave

1. **Materiales creados antes del procesamiento:** Garantiza IDs consistentes durante todo el pipeline.
2. **Worker local para PDF.js:** Elimina dependencia de CDN externo y errores 404.
3. **Chunks como implementación interna:** Invisible para la UI, solo para procesamiento.
4. **Estados reales de procesamiento:** Eliminados indicadores falsos basados en knowledgeNodes.length.
5. **Asociación correcta de KnowledgeNodes:** Todos los nodos guardan `sourceMaterialId = material.id`.
6. **Eliminación de código muerto:** Limpieza de imports sin uso, logs innecesarios, warnings de lint.

---

## Riesgos Mitigados

- **Calidad de la Extracción de Información:** Mejorada con corpus unificado y extracción por chunks.
- **Rendimiento de IndexedDB:** Optimizado con índices adecuados y consultas eficientes.
- **Algoritmos de Aprendizaje Adaptativo:** Integrados correctamente con KnowledgeNodes.
- **Compatibilidad de Navegadores:** Garantizada con worker local y polyfills necesarios.

---

## Próximos Pasos

1. **Fase 13 — Knowledge Graph:** Implementar visualización de relaciones entre KnowledgeNodes.
2. **Testing:** Aumentar cobertura en servicios críticos.
3. **FSRS:** Implementar algoritmo alternativo a SM-2.
4. **Gamificación:** Rachas, logros y objetivos diarios (opcional).
