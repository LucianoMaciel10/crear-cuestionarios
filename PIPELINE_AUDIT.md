# Auditoría Técnica del Pipeline de Procesamiento de Materiales

Este documento contiene un análisis completo del pipeline de procesamiento de materiales, incluyendo el código relevante y las interacciones entre componentes.

## Tabla de Contenidos

1. [Visión General del Pipeline](#visión-general-del-pipeline)
2. [Componentes Principales](#componentes-principales)
3. [Flujo de Procesamiento](#flujo-de-procesamiento)
4. [Problemas Identificados](#problemas-identificados)
5. [Código Relevante](#código-relevante)

## Visión General del Pipeline

El pipeline de procesamiento de materiales permite a los usuarios cargar archivos (PDF, PPTX, TXT) y convertirlos en materiales estructurados con KnowledgeNodes asociados. El proceso incluye:

- Lectura y parsing de archivos
- Conversión a Markdown
- Extracción de conocimiento (conceptos y definiciones)
- Creación de KnowledgeNodes
- Generación de preguntas (opcional)
- Almacenamiento en IndexedDB

## Componentes Principales

### 1. AddMaterialModal.tsx

Componente de UI que permite a los usuarios seleccionar archivos y iniciar el procesamiento.

```typescript
// src/components/AddMaterialModal.tsx
function AddMaterialModal({
  isOpen,
  onClose,
  onAdd,
  onBatchAdd,
  batchMode = false,
}: AddMaterialModalProps) {
  // ... estado y handlers ...

  const handleGuardar = async () => {
    if (batchMode && onBatchAdd && files.length > 0) {
      showToast(`Procesando ${files.length} archivos...`, "info");

      const result = await onBatchAdd(files, (stages) => {
        setProcessingStages(stages);
      });

      if (result.success) {
        showToast(
          `Procesados ${result.stats.processedFiles} de ${result.stats.totalFiles} archivos. ` +
            `${result.stats.knowledgeNodesCreated} KnowledgeNodes creados.`,
          "success",
        );
      }
    }
  };

  // ... render ...
}
```

**Llamadas a:**
- `onBatchAdd` (implementado en MaterialsPage.tsx, no mostrado)

### 2. material.service.ts

Servicio que coordina el procesamiento de materiales.

```typescript
// src/services/material.service.ts
export async function processBatchMaterials(
  files: File[],
  subjectId: string,
  options: {
    preferAI?: boolean;
    generateQuestions?: boolean;
    onProgress?: (stages: ProcessingStage[]) => void;
  } = {},
) {
  // Inicializar caché
  await batchCache.initialize();

  // Crear procesador por lotes
  const processor = new BatchProcessor({
    subjectId,
    preferAI: options.preferAI ?? true,
    generateQuestions: options.generateQuestions ?? true,
  });

  // Procesar archivos
  return processor.processFiles(files);
}
```

**Llamadas a:**
- `BatchProcessor.processFiles()`

### 3. batch-processor.ts

Clase principal que coordina todo el pipeline de procesamiento por lotes.

```typescript
// src/services/batch-processing/batch-processor.ts
export class BatchProcessor {
  async processFiles(files: File[]): Promise<BatchProcessingResult> {
    // Etapa 1: Lectura de archivos
    const fileContents = await this.readFiles(files);

    // Etapa 2: Conversión a Markdown
    const markdownContents = await this.convertToMarkdownBatch(fileContents);

    // Etapa 3: Construcción de Corpus
    await this.buildSubjectCorpus(markdownContents);

    // Etapa 4: Extracción de conocimiento
    const extractionResults = await this.extractKnowledgeFromCorpus();

    // Etapa 5: Generación de KnowledgeNodes
    await this.generateKnowledgeNodesBatch(extractionResults);

    // Etapa 6: Generación de preguntas
    if (this.options.generateQuestions) {
      await this.generateQuestionsFromCorpus();
    }

    // Etapa 7: Finalización
    this.results.success = true;
    return this.results;
  }

  private async generateKnowledgeNodesBatch(
    extractionResults: {
      file: File;
      text: string;
      extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>>;
    }[],
  ): Promise<void> {
    const { addMaterial } = await import("../material.service");

    for (let i = 0; i < extractionResults.length; i++) {
      const { extractionResult, file, text } = extractionResults[i];
      const materialId = crypto.randomUUID();

      // Crear material
      await addMaterial(
        file.name,  // PROBLEMA: Nombre del chunk, no del archivo original
        text,
        file.type.includes("pdf")
          ? "pdf"
          : file.type.includes("presentation")
            ? "pptx"
            : "txt",  // PROBLEMA: Default a txt
        this.options.subjectId,
      );

      this.results.materials.push({
        id: materialId,
        name: file.name,
        markdownContent: text,
        knowledgeNodeIds: extractionResult.knowledgeNodeIds,
        questionIds: [],
      });
    }
  }
}
```

**Llamadas a:**
- `readFiles()` → `parsePDF()` o `parsePPTX()`
- `convertToMarkdownBatch()` → `createStructuredMarkdown()`
- `buildSubjectCorpus()` → `CorpusBuilder`
- `extractKnowledgeFromCorpus()` → `extractKnowledgeFromText()`
- `generateKnowledgeNodesBatch()` → `addMaterial()` y `createKnowledgeNodesFromConcepts()`

### 4. pdf-parser.ts

Parser para archivos PDF.

```typescript
// src/services/material-parser/pdf-parser.ts
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.js`;  // PROBLEMA: URL inválida

export async function parsePDF(file: ArrayBuffer): Promise<string> {
  try {
    const pdf: PDFDocumentProxy = await getDocument({ data: file }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: unknown) => (hasStr(item) ? item.str : ""))
        .join(" ");
      text += pageText + "\n";
    }

    return text;
  } catch (error) {
    throw new Error("Failed to parse PDF file");
  }
}
```

### 5. pptx-parser.ts

Parser para archivos PPTX.

```typescript
// src/services/material-parser/pptx-parser.ts
export async function parsePPTX(file: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(file);
    let text = "";

    const slideFiles = Object.keys(zip.files).filter((fileName) =>
      fileName.startsWith("ppt/slides/") && fileName.endsWith(".xml")
    );

    for (const slideFile of slideFiles) {
      const slideContent = await zip.file(slideFile)?.async("text");
      if (slideContent) {
        const slideText = extractTextFromSlide(slideContent);
        text += slideText + "\n\n";
      }
    }

    return text.trim();
  } catch (error) {
    throw new Error("Failed to parse PPTX file");
  }
}
```

### 6. markdown-converter.ts

Conversor de texto a Markdown estructurado.

```typescript
// src/services/material-parser/markdown-converter.ts
export function createStructuredMarkdown(
  text: string,
  fileName: string,
): string {
  const markdownContent = convertToMarkdown(text);

  return `---
title: ${fileName}
source: ${new Date().toISOString()}
type: processed
---

${markdownContent}`;
}
```

### 7. corpus-builder.ts

Construye un corpus unificado a partir de múltiples archivos.

```typescript
// src/services/corpus-processing/corpus-builder.ts
export class CorpusBuilder {
  async buildCorpus(): Promise<SubjectCorpus> {
    // Dividir en chunks
    this.corpus.chunks = this.splitIntoChunks(this.corpus.normalizedMarkdown);
    
    // Extraer conceptos
    this.corpus.concepts = await this.extractGlobalConcepts();
    
    // Extraer definiciones
    this.corpus.definitions = await this.extractGlobalDefinitions();
    
    return this.corpus;
  }

  private splitIntoChunks(markdown: string): CorpusChunk[] {
    // ... divide el contenido en chunks ...
    
    // PROBLEMA: Crea chunks con títulos "Untitled" cuando no hay estructura clara
    chunks.push({
      id: `chunk-${chunkIdCounter}`,
      title: currentChunk.title || "Untitled",  // PROBLEMA: Título por defecto
      content: currentChunk.content.trim(),
      // ...
    });
  }
}
```

### 8. extraction-service.ts

Servicio de extracción de conocimiento.

```typescript
// src/services/knowledge-extraction/extraction-service.ts
export async function extractKnowledgeFromText(
  text: string,
  options?: ExtractionOptions,
): Promise<ExtractionResult> {
  // Extraer conceptos usando IA o regex
  const extractionResult = await extractConceptsWithAI(text) || await processText(text);

  // Crear KnowledgeNodes
  const knowledgeNodeIds = await createKnowledgeNodesFromConcepts(
    extractionResult.conceptos,
    extractionResult.definiciones,
    options?.sourceMaterialId,
    source,
  );

  return {
    knowledgeNodeIds,
    legacyContent: {
      conceptos: extractionResult.conceptos,
      definiciones: extractionResult.definiciones,
    },
    stats: {
      source,
      conceptCount: extractionResult.conceptos.length,
      definitionCount: extractionResult.definiciones.length,
    },
  };
}
```

**Llamadas a:**
- `createKnowledgeNodesFromConcepts()` en `knowledge-node.service.ts`

### 9. knowledge-node.service.ts

Servicio para gestionar KnowledgeNodes en IndexedDB.

```typescript
// src/services/knowledge-node.service.ts
export async function createKnowledgeNodesFromConcepts(
  concepts: string[],
  definitions: { concepto: string; definicion: string }[],
  sourceMaterialId?: string,
  sourceType: "ai" | "regex" | "manual" = "ai",
): Promise<string[]> {
  const createdIds: string[] = [];

  // Crear nodos para conceptos
  for (const concept of concepts) {
    const conceptId = await createKnowledgeNode({
      type: "concept",
      content: concept,
      sourceMaterialId,  // PROBLEMA: Se usa el ID del chunk
      // ... metadata ...
    });
    createdIds.push(conceptId);
  }

  // Crear nodos para definiciones
  for (const definition of definitions) {
    const definitionId = await createKnowledgeNode({
      type: "definition",
      content: `${definition.concepto}: ${definition.definicion}`,
      sourceMaterialId,  // PROBLEMA: Se usa el ID del chunk
      // ... metadata ...
    });
    createdIds.push(definitionId);
  }

  return createdIds;
}
```

### 10. material.model.ts

Modelo de datos para Materiales.

```typescript
// src/data/models/material.model.ts
export interface IMaterial {
  id: string;
  nombre: string;
  tipo: "texto" | "pdf" | "pptx" | "txt" | "md";
  contenidoOriginal?: string | ArrayBuffer;
  fechaCarga: Date;
  idMateria?: string;
  markdownContent?: string;  // Campo no utilizado correctamente
  contentHash?: string;  // Campo no utilizado
}
```

### 11. knowledge-node.model.ts

Modelo de datos para KnowledgeNodes.

```typescript
// src/data/models/knowledge-node.model.ts
export interface IKnowledgeNode {
  id: string;
  type: "concept" | "definition" | "relationship" | "example";
  content: string;
  sourceMaterialId?: string;  // PROBLEMA: Se usa ID de chunk en lugar de ID de material
  // ... otros campos ...
}
```

### 12. dexie-db.ts

Configuración de la base de datos IndexedDB.

```typescript
// src/data/db/dexie-db.ts
class CuestionarioDB extends Dexie {
  materiales!: Dexie.Table<IMaterial, string>;
  knowledgeNodes!: Dexie.Table<IKnowledgeNode, string>;

  constructor() {
    super("CuestionarioDB");
    
    this.version(9).stores({
      materiales: "id, nombre, tipo, fechaCarga, idMateria",
      knowledgeNodes: "id, type, content, sourceMaterialId, createdAt, subjectId",
    });
  }
}
```

### 13. MaterialCard.tsx

Componente que muestra la información de un material.

```typescript
// src/components/domain/MaterialCard.tsx
const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onClick,
  showDebugInfo = false,
}: MaterialCardProps) => {
  const [knowledgeNodes, setKnowledgeNodes] = useState<IKnowledgeNode[]>([]);

  useEffect(() => {
    const loadKnowledgeNodes = async () => {
      const nodes = await knowledgeNodeService.getKnowledgeNodesByMaterial(
        material.id,  // PROBLEMA: Busca por ID de material, pero KnowledgeNodes usan ID de chunk
      );
      setKnowledgeNodes(nodes);
    };
    loadKnowledgeNodes();
  }, [material.id]);

  return (
    <Card>
      <h3>{material.nombre}</h3>
      <span>{material.tipo}</span>
      
      {knowledgeNodes.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Procesando...  // PROBLEMA: Nunca desaparece
        </p>
      )}
    </Card>
  );
}
```

## Flujo de Procesamiento

1. **Usuario selecciona archivos** en `AddMaterialModal`
2. **`onBatchAdd`** llama a `processBatchMaterials` en `material.service`
3. **`BatchProcessor.processFiles()`** coordina el procesamiento:
   - Lee archivos con `parsePDF()` o `parsePPTX()`
   - Convierte a Markdown con `createStructuredMarkdown()`
   - Construye corpus con `CorpusBuilder`
   - Divide en chunks (PROBLEMA: nombres como "chunk-0-Untitled.md")
   - Extrae conocimiento con `extractKnowledgeFromText()`
   - Crea materiales con `addMaterial()` (PROBLEMA: usa nombres de chunks)
   - Crea KnowledgeNodes con `createKnowledgeNodesFromConcepts()` (PROBLEMA: asocia con ID de chunk)
4. **Resultado** se muestra en Toast, pero:
   - Materiales tienen nombres incorrectos
   - KnowledgeNodes no están asociados con materiales reales
   - UI muestra "Procesando..." permanentemente

## Problemas Identificados

### 1. Nombres Incorrectos
- **Causa**: `CorpusBuilder` crea chunks con nombres como "chunk-0-Untitled.md"
- **Efecto**: Materiales se crean con estos nombres en lugar de los nombres originales de los archivos

### 2. Tipos Incorrectos
- **Causa**: El tipo se determina del MIME type del archivo virtual
- **Efecto**: Archivos Markdown se marcan como "txt" porque no hay caso para "text/markdown"

### 3. Asociación Incorrecta KnowledgeNodes-Material
- **Causa**: KnowledgeNodes se crean con `sourceMaterialId` igual al ID del chunk
- **Efecto**: `MaterialCard` busca KnowledgeNodes por `material.id` pero no encuentra ninguno

### 4. "Procesando..." Permanente
- **Causa**: `knowledgeNodes.length === 0` porque la búsqueda falla
- **Efecto**: La UI nunca muestra que el procesamiento ha terminado

### 5. PDF.js Worker URL Inválida
- **Causa**: URL `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.js` no existe
- **Efecto**: PDF.js no puede cargar el worker y falla silenciosamente

## Archivos que Requieren Modificación

1. **batch-processor.ts**: Corregir asociación KnowledgeNodes-Material
2. **material.service.ts**: Actualizar materiales después del procesamiento
3. **pdf-parser.ts**: Corregir URL del worker
4. **MaterialCard.tsx**: Mejorar lógica de visualización
5. **knowledge-node.service.ts**: Asegurar correcta asociación
6. **CorpusBuilder**: Mejorar generación de nombres de chunks

## Conclusión

El pipeline tiene problemas fundamentales en la asociación entre materiales y KnowledgeNodes. Los KnowledgeNodes se crean correctamente en IndexedDB, pero están asociados con IDs de chunks temporales en lugar de los IDs reales de los materiales. Esto causa que la UI no pueda encontrar los KnowledgeNodes asociados y muestre "Procesando..." permanentemente.

Además, los nombres de los materiales se generan a partir de los chunks en lugar de usar los nombres originales de los archivos, y el tipo se determina incorrectamente del MIME type.

La solución requiere:
1. Asociar KnowledgeNodes con los IDs correctos de materiales
2. Usar nombres originales de archivos para los materiales
3. Determinar correctamente el tipo de material
4. Corregir la URL del worker de PDF.js