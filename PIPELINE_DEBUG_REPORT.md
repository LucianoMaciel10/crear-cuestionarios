# PIPELINE_DEBUG_REPORT.md

## 1. PIPELINE REAL

```
AddMaterialModal.handleGuardar()
↓
MaterialsPage.handleBatchAdd()
↓
material.service.processBatchMaterials()
↓
BatchProcessor.processFiles()
↓
BatchProcessor.createMaterials()
↓
BatchProcessor.readFiles()
↓
BatchProcessor.convertToMarkdownBatch()
↓
BatchProcessor.buildSubjectCorpus()
↓
BatchProcessor.extractKnowledgeFromCorpus()
↓
BatchProcessor.generateKnowledgeNodesBatch()
↓
BatchProcessor.generateQuestionsFromCorpus()
↓
BatchProcessor.finalizeProcessing()
↓
MaterialCard
```

## 2. CREACIÓN DEL MATERIAL

**¿Dónde se crea?**
- En `src/services/material.service.ts`, función `createMaterial`.

**¿Quién lo crea?**
- La función `createMaterial` es llamada por `BatchProcessor.createMaterials()`.

**¿En qué función?**
- `createMaterial` en `src/services/material.service.ts`, línea 30.

**¿En qué línea aproximada?**
- Línea 30 en `src/services/material.service.ts`.

**¿Qué datos tiene cuando se crea?**
```typescript
const material: IMaterial = {
  id: crypto.randomUUID(),
  nombre: nombre,
  tipo: tipo,
  contenidoOriginal: contenidoOriginal,
  fechaCarga: new Date(),
  idMateria: idMateria,
  processingStatus: "pending",
  processingStartedAt: new Date(),
  originalFilename: originalFilename,
  fileType: fileType,
};
```

## 3. ACTUALIZACIÓN DEL MATERIAL

**¿Quién actualiza `processingStatus`?**
- `updateMaterialProcessingStatus` en `src/services/material.service.ts`.

**¿Quién actualiza `conceptCount`?**
- `updateMaterialProcessingStatus` en `src/services/material.service.ts`.

**¿Quién actualiza `definitionCount`?**
- `updateMaterialProcessingStatus` en `src/services/material.service.ts`.

**¿Quién actualiza `questionCount`?**
- `updateMaterialProcessingStatus` en `src/services/material.service.ts`.

**¿Quién actualiza `processingFinishedAt`?**
- `updateMaterialProcessingStatus` en `src/services/material.service.ts`.

**¿Quién actualiza `processingError`?**
- `updateMaterialProcessingStatus` en `src/services/material.service.ts`.

## 4. PROCESSING STATUS

**`pending`:**
- Se asigna al crear el material en `createMaterial`.

**`processing`:**
- No se asigna explícitamente en el código actual. El estado pasa directamente de `pending` a `completed` o `failed`.

**`completed`:**
- Se asigna en `updateMaterialProcessingStatus` cuando el procesamiento finaliza con éxito.

**`failed`:**
- Se asigna en `updateMaterialProcessingStatus` cuando ocurre un error durante el procesamiento.

## 5. PPTX

**Archivo → Parser:**
- `parsePPTX` en `src/services/material-parser/pptx-parser.ts`.

**Parser → Texto:**
- `parsePPTX` extrae el texto del archivo PPTX.

**Texto → Markdown:**
- `createStructuredMarkdown` en `src/services/material-parser/markdown-converter.ts`.

**Markdown → Corpus:**
- `CorpusBuilder.buildCorpus()` en `src/services/corpus-processing/corpus-builder.ts`.

**Corpus → Chunks:**
- `CorpusBuilder.splitIntoChunks()` en `src/services/corpus-processing/corpus-builder.ts`.

**Chunks → Knowledge Extraction:**
- `extractKnowledgeFromCorpus` en `src/services/knowledge-extraction/extraction-service.ts`.

**Knowledge Extraction → Knowledge Nodes:**
- `createKnowledgeNodesFromConcepts` en `src/services/knowledge-node.service.ts`.

**Knowledge Nodes → Questions:**
- `generateQuestionsFromCorpus` en `src/services/batch-processing/batch-processor.ts`.

**Questions → Material:**
- `updateMaterialProcessingStatus` en `src/services/material.service.ts`.

**Donde termina el flujo:**
- El flujo termina en `MaterialCard`, donde se muestra la información del material procesado.

## 6. PDF

**¿Qué versión de `pdfjs-dist` está instalada?**
- No se especifica en el código, pero se importa desde `pdfjs-dist`.

**¿Qué worker intenta cargar?**
- `pdfjs-dist/build/pdf.worker.min.js`.

**¿Qué archivo configura `workerSrc`?**
- `src/services/material-parser/pdf-parser.ts`.

**¿Qué valor tiene?**
```typescript
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();
```

**¿Por qué sigue intentando usar fake worker?**
- No se intenta usar un fake worker. Se configura correctamente el worker local.

**¿Por qué sigue intentando descargar el worker desde internet?**
- No intenta descargar el worker desde internet. Se configura correctamente el worker local.

## 7. KNOWLEDGENODES

**¿Quién los crea?**
- `createKnowledgeNodesFromConcepts` en `src/services/knowledge-node.service.ts`.

**¿Quién los guarda?**
- `createKnowledgeNode` en `src/services/knowledge-node.service.ts`.

**¿Qué `sourceMaterialId` reciben?**
- El `sourceMaterialId` se pasa desde `extractKnowledgeFromMaterial` o `extractKnowledgeFromText`.

**Ejemplo REAL:**
```typescript
// Material
const material: IMaterial = {
  id: "material-123",
  nombre: "Ejemplo.pdf",
  tipo: "pdf",
  // ... otros campos
};

// KnowledgeNode
const knowledgeNode: IKnowledgeNode = {
  id: "node-456",
  type: "concept",
  content: "Concepto Ejemplo",
  sourceMaterialId: "material-123", // Coincide con material.id
  // ... otros campos
};
```

**Comparación:**
- `material.id` = `material-123`
- `knowledgeNode.sourceMaterialId` = `material-123`

**¿Coinciden?**
- Sí, coinciden.

## 8. MATERIALCARD

**¿Por qué sigue mostrando "Procesando..."?**
- La condición que provoca que siga apareciendo "Procesando..." es cuando `material.processingStatus` es igual a `"processing"`.

**Flujo real:**
1. `MaterialCard` verifica el estado de `material.processingStatus`.
2. Si el estado es `"processing"`, muestra "Procesando...".
3. El estado `"processing"` no se actualiza correctamente en el pipeline, lo que causa que el mensaje persista.

**Condición exacta:**
```typescript
case "processing":
  return (
    <div className="mb-4">
      <p className="text-sm text-blue-600 dark:text-blue-400 italic">
        Procesando...
      </p>
    </div>
  );
```

## 9. CONCEPTOS Y DEFINICIONES

**¿Cómo calcula MaterialCard los conceptos y definiciones?**
- `MaterialCard` carga los `KnowledgeNodes` asociados al material usando `getKnowledgeNodesByMaterial`.
- Filtra los nodos por tipo: `concept` y `definition`.

**¿Qué consulta realiza?**
- `knowledgeNodeService.getKnowledgeNodesByMaterial(material.id)`.

**¿Qué servicio usa?**
- `knowledge-node.service.ts`.

**¿Qué datos obtiene?**
- Array de `IKnowledgeNode` filtrados por `sourceMaterialId`.

## 10. TOAST

**Cuando dice "22 KnowledgeNodes creados", ¿de dónde sale ese número?**
- El número proviene de `result.stats.knowledgeNodesCreated` en `AddMaterialModal.handleGuardar()`.

**¿Es una cantidad realmente persistida?**
- No, es una estadística temporal calculada durante el procesamiento por lotes.

**¿O solamente una estadística temporal?**
- Es una estadística temporal.

**Código:**
```typescript
showToast(
  `Procesados ${result.stats.processedFiles} de ${result.stats.totalFiles} archivos. `
    + `${result.stats.knowledgeNodesCreated} KnowledgeNodes creados.`,
  "success",
);
```

## 11. DOBLE LLAMADA A MISTRAL

**¿Quién hace la primera llamada?**
- `extractConceptsWithAI` en `src/services/ai/concept-extraction.service.ts`.

**¿Quién hace la segunda llamada?**
- No hay evidencia de una segunda llamada a Mistral en el código actual.

**¿Es intencional, un bug o una duplicación?**
- No hay duplicación en el código actual. Solo se realiza una llamada a Mistral.

**Recorrido completo:**
1. `extractKnowledgeFromText` en `src/services/knowledge-extraction/extraction-service.ts`.
2. `extractConceptsWithAI` en `src/services/ai/concept-extraction.service.ts`.

## 12. ELIMINACIÓN DE MATERIALES

**¿Existe eliminar material?**
- Sí, existe.

**¿Qué elimina?**
- `Material`: Sí, mediante `removeMaterial` en `src/services/material.service.ts`.
- `KnowledgeNodes`: Sí, mediante `deleteKnowledgeNodesByMaterial` en `src/services/knowledge-node.service.ts`.
- `Flashcards`: No aplica, ya que `Flashcards` son una vista de `KnowledgeNodes`.
- `Questions`: No se eliminan automáticamente.
- `Corpus`: No se elimina automáticamente.
- `Archivos`: No se eliminan automáticamente.

**¿Qué falta?**
- Eliminación en cascada de `Questions` y `Corpus`.

## 13. ESTADO DEL MODAL

**¿Por qué después de cerrar el modal recuerda el progreso anterior?**
- El estado `processingStages` no se reinicia correctamente al cerrar el modal.

**¿Qué estado React queda vivo?**
- `processingStages` en `AddMaterialModal`.

**Código:**
```typescript
const [processingStages, setProcessingStages] = useState<ProcessingStage[]>([]);
```

## 14. LOGS

**Listado de `console.log`:**
1. `src/services/ai/concept-extraction.service.ts`:
   - `console.log("Sin conexión a internet, usando fallback")`
   - `console.log("Usando API real de Mistral")`
   - `console.log("Estructura de respuesta inválida:", data)`
   - `console.log("Tipos de datos inválidos en la respuesta:", data)`
   - `console.log("Error al conectar con la API de extracción:", error)`

2. `src/data/db/dexie-db.ts`:
   - `console.log("Database opened successfully")`

**Listado de `console.warn`:**
- No hay `console.warn` en el pipeline.

**Listado de `console.error`:**
1. `src/services/material-parser/pptx-parser.ts`:
   - `console.error("Error parsing PPTX:", { error })`

2. `src/services/material-parser/pdf-parser.ts`:
   - `console.error("Error parsing PDF:", { error })`

3. `src/services/material-parser/docx-parser.ts`:
   - `console.error("Error parsing DOCX:", { error })`

4. `src/services/knowledge-extraction/providers/ai-provider.ts`:
   - `console.error("AI Provider failed:", error)`

5. `src/services/ai/concept-extraction.service.ts`:
   - `console.error("Error detallado de la API:", { status: response.status, error: errorData.error })`
   - `console.error("Error al parsear respuesta de error:", parseError)`

6. `src/services/batch-processing/batch-cache.ts`:
   - `console.error("Error al persistir en caché:", error)`

7. `src/services/batch-processing/batch-processor.ts`:
   - `console.error("Error en procesamiento por lotes:", error)`
   - `console.error("Error leyendo archivo ${file.name}:", error)`
   - `console.error("Error convirtiendo ${file.name} a Markdown:", error)`
   - `console.error("Error agregando ${file.name} al corpus:", error)`
   - `console.error("Error extrayendo conocimiento del chunk ${i}:", error)`
   - `console.error("Error generando KnowledgeNodes para chunk ${i}:", error)`
   - `console.error("Error generando preguntas para concepto ${concept.concept}:", error)`

8. `src/pages/MaterialsPage.tsx`:
   - `console.error("Error en procesamiento por lotes:", error)`

9. `src/pages/Statistics.tsx`:
   - `console.error("Failed to load data:", error)`

10. `src/pages/Flashcards.tsx`:
    - `console.error("Failed to load knowledge nodes:", error)`

11. `src/data/db/dexie-db.ts`:
    - `console.error("Failed to open db:", err)`

12. `src/hooks/useQuizEngine.ts`:
    - `console.error("Failed to load questions:", error)`

13. `src/components/AddMaterialModal.tsx`:
    - `console.error("Error al crear material:", error)`

14. `src/components/domain/MaterialCard.tsx`:
    - `console.error("Error loading knowledge nodes:", error)`

15. `api/extract-concepts.ts`:
    - `console.error("MISTRAL_API_KEY no configurada")`
    - `console.error("Error de Mistral API:", response.status, errorText)`
    - `console.error("Respuesta inválida de Mistral - Estructura:", data)`
    - `console.error("Error al parsear JSON de Mistral:", parseError)`
    - `console.error("Estructura de respuesta inválida:", result)`
    - `console.error("Tipos de datos inválidos:", { conceptos, definiciones, relaciones })`
    - `console.error("Error inesperado en extract-concepts:", error)`

## 15. ERRORES DETECTADOS

1. **Título:** Estado de procesamiento no actualizado
   - **Archivo:** `src/services/batch-processing/batch-processor.ts`
   - **Función:** `processFiles`
   - **Causa exacta:** El estado `processing` no se asigna correctamente durante el procesamiento.
   - **Consecuencia:** `MaterialCard` muestra "Procesando..." indefinidamente.
   - **Nivel de gravedad:** ALTO

2. **Título:** Estadísticas temporales en Toast
   - **Archivo:** `src/components/AddMaterialModal.tsx`
   - **Función:** `handleGuardar`
   - **Causa exacta:** El Toast muestra estadísticas temporales en lugar de datos persistidos.
   - **Consecuencia:** Información engañosa para el usuario.
   - **Nivel de gravedad:** MEDIO

3. **Título:** Eliminación incompleta de materiales
   - **Archivo:** `src/services/material.service.ts`
   - **Función:** `removeMaterial`
   - **Causa exacta:** No se eliminan en cascada las preguntas y el corpus asociados.
   - **Consecuencia:** Datos huérfanos en la base de datos.
   - **Nivel de gravedad:** MEDIO

4. **Título:** Estado del modal no reiniciado
   - **Archivo:** `src/components/AddMaterialModal.tsx`
   - **Función:** `handleCancelar`
   - **Causa exacta:** El estado `processingStages` no se reinicia correctamente al cerrar el modal.
   - **Consecuencia:** El modal recuerda el progreso anterior.
   - **Nivel de gravedad:** BAJO

## 16. PLAN DE REPARACIÓN

1. **Actualizar el estado de procesamiento correctamente en `BatchProcessor`.**
2. **Mostrar datos persistidos en el Toast en lugar de estadísticas temporales.**
3. **Implementar eliminación en cascada de preguntas y corpus al eliminar un material.**
4. **Reiniciar el estado `processingStages` al cerrar el modal.**
