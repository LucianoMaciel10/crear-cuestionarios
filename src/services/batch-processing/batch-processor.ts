// src/services/batch-processing/batch-processor.ts
import { parsePDF } from "../material-parser/pdf-parser";
import { parseDOCX } from "../material-parser/docx-parser";
import {
  convertToMarkdown,
  createStructuredMarkdown,
} from "../material-parser/markdown-converter";
import { extractKnowledgeFromText } from "../knowledge-extraction/extraction-service";
import {
  generateBooleanQuestions,
  generateMultipleChoiceQuestions,
} from "../question-generator/boolean-generator";
import { saveQuestions } from "../question.service";
import {
  CorpusBuilder,
  type SubjectCorpus,
  type CorpusConcept,
} from "../corpus-processing/corpus-builder";

export interface BatchProcessingOptions {
  subjectId: string;
  preferAI?: boolean;
  generateQuestions?: boolean;
}

export interface ProcessingStage {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}

export interface BatchProcessingResult {
  success: boolean;
  materials: {
    id: string;
    name: string;
    markdownContent: string;
    knowledgeNodeIds: string[];
    questionIds?: string[];
  }[];
  stats: {
    totalFiles: number;
    processedFiles: number;
    knowledgeNodesCreated: number;
    questionsGenerated: number;
  };
}

export class BatchProcessor {
  private options: BatchProcessingOptions;
  private stages: ProcessingStage[];
  private results: BatchProcessingResult;
  private cache: Map<string, string>;
  private corpusBuilder: CorpusBuilder | null;

  constructor(options: BatchProcessingOptions) {
    this.options = options;
    this.stages = [
      { name: "Lectura de archivos", status: "pending", progress: 0 },
      { name: "Conversión a Markdown", status: "pending", progress: 0 },
      { name: "Construcción de Corpus", status: "pending", progress: 0 },
      { name: "Extracción de Conocimiento", status: "pending", progress: 0 },
      { name: "Generación de KnowledgeNodes", status: "pending", progress: 0 },
      { name: "Generación de Preguntas", status: "pending", progress: 0 },
      { name: "Finalización", status: "pending", progress: 0 },
    ];
    this.results = {
      success: false,
      materials: [],
      stats: {
        totalFiles: 0,
        processedFiles: 0,
        knowledgeNodesCreated: 0,
        questionsGenerated: 0,
      },
    };
    this.cache = new Map();
    this.corpusBuilder = null;
  }

  getStages(): ProcessingStage[] {
    return this.stages;
  }

  getResults(): BatchProcessingResult {
    return this.results;
  }

  private updateStage(
    name: string,
    status: ProcessingStage["status"],
    progress: number,
    error?: string,
  ) {
    const stage = this.stages.find((s) => s.name === name);
    if (stage) {
      stage.status = status;
      stage.progress = progress;
      if (error) {
        stage.error = error;
      }
    }
  }

  async processFiles(files: File[]): Promise<BatchProcessingResult> {
    this.results.stats.totalFiles = files.length;

    try {
      // Etapa 1: Lectura de archivos
      this.updateStage("Lectura de archivos", "processing", 0);
      const fileContents = await this.readFiles(files);
      this.updateStage("Lectura de archivos", "completed", 100);

      // Etapa 2: Conversión a Markdown
      this.updateStage("Conversión a Markdown", "processing", 0);
      const markdownContents = await this.convertToMarkdownBatch(fileContents);
      this.updateStage("Conversión a Markdown", "completed", 100);

      // Etapa 3: Construcción de Corpus Unificado
      this.updateStage("Construcción de Corpus", "processing", 0);
      await this.buildSubjectCorpus(markdownContents);
      this.updateStage("Construcción de Corpus", "completed", 100);

      // Etapa 4: Extracción de conocimiento desde corpus
      this.updateStage("Extracción de Conocimiento", "processing", 0);
      const extractionResults = await this.extractKnowledgeFromCorpus();
      this.updateStage("Extracción de Conocimiento", "completed", 100);

      // Etapa 5: Generación de KnowledgeNodes
      this.updateStage("Generación de KnowledgeNodes", "processing", 0);
      await this.generateKnowledgeNodesBatch(extractionResults);
      this.updateStage("Generación de KnowledgeNodes", "completed", 100);

      // Etapa 6: Generación de preguntas (opcional)
      if (this.options.generateQuestions) {
        this.updateStage("Generación de Preguntas", "processing", 0);
        await this.generateQuestionsFromCorpus();
        this.updateStage("Generación de Preguntas", "completed", 100);
      } else {
        this.updateStage("Generación de Preguntas", "completed", 100);
      }

      // Etapa 7: Finalización
      this.updateStage("Finalización", "processing", 0);
      this.results.success = true;
      this.updateStage("Finalización", "completed", 100);

      return this.results;
    } catch (error) {
      console.error("Error en procesamiento por lotes:", error);
      this.updateStage(
        "Finalización",
        "failed",
        0,
        error instanceof Error ? error.message : "Error desconocido",
      );
      this.results.success = false;
      throw error;
    }
  }

  private async readFiles(
    files: File[],
  ): Promise<{ file: File; content: string }[]> {
    const results: { file: File; content: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = Math.round(((i + 1) / files.length) * 100);
      this.updateStage("Lectura de archivos", "processing", progress);

      try {
        let content = "";

        if (file.type === "application/pdf") {
          const arrayBuffer = await file.arrayBuffer();
          content = await parsePDF(arrayBuffer);
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const arrayBuffer = await file.arrayBuffer();
          content = await parseDOCX(arrayBuffer);
        } else {
          content = await file.text();
        }
        results.push({ file, content });
      } catch (error) {
        console.error(`Error leyendo archivo ${file.name}:`, error);
        throw new Error(`Failed to read file ${file.name}`);
      }
    }

    return results;
  }

  private async convertToMarkdownBatch(
    fileContents: { file: File; content: string }[],
  ): Promise<{ file: File; markdown: string }[]> {
    const results: { file: File; markdown: string }[] = [];
    for (let i = 0; i < fileContents.length; i++) {
      const { file, content } = fileContents[i];
      const progress = Math.round(((i + 1) / fileContents.length) * 100);
      this.updateStage("Conversión a Markdown", "processing", progress);

      try {
        const markdown = createStructuredMarkdown(content, file.name);
        this.cache.set(file.name, markdown);
        results.push({ file, markdown });
      } catch (error) {
        console.error(`Error convirtiendo ${file.name} a Markdown:`, error);
        throw new Error(`Failed to convert ${file.name} to Markdown`);
      }
    }

    return results;
  }

  private async buildSubjectCorpus(
    markdownContents: { file: File; markdown: string }[],
  ): Promise<void> {
    // Crear builder de corpus
    this.corpusBuilder = new CorpusBuilder(this.options.subjectId);

    // Agregar todos los archivos al corpus
    for (let i = 0; i < markdownContents.length; i++) {
      const { file, markdown } = markdownContents[i];
      const progress = Math.round(((i + 1) / markdownContents.length) * 100);
      this.updateStage("Construcción de Corpus", "processing", progress);

      try {
        await this.corpusBuilder.addFileContent(file.name, markdown);
      } catch (error) {
        console.error(`Error agregando ${file.name} al corpus:`, error);
        throw new Error(`Failed to add ${file.name} to corpus`);
      }
    }

    // Construir el corpus unificado
    await this.corpusBuilder.buildCorpus();
  }

  private async extractKnowledgeFromCorpus(): Promise<
    {
      file: File;
      text: string;
      extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>>;
    }[]
  > {
    if (!this.corpusBuilder) {
      throw new Error("Corpus not built");
    }

    const corpus = this.corpusBuilder.getCorpus();
    const results: {
      file: File;
      text: string;
      extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>>;
    }[] = [];

    // Procesar cada chunk del corpus como un documento separado
    for (let i = 0; i < corpus.chunks.length; i++) {
      const chunk = corpus.chunks[i];
      const progress = Math.round(((i + 1) / corpus.chunks.length) * 100);
      this.updateStage("Extracción de Conocimiento", "processing", progress);

      try {
        // Crear un nombre virtual para el chunk
        const virtualFileName = `chunk-${i}-${chunk.title.substring(0, 20)}.md`;
        const file = new File([chunk.content], virtualFileName, {
          type: "text/markdown",
        });

        const extractionResult = await extractKnowledgeFromText(chunk.content, {
          preferAI: this.options.preferAI,
          sourceType: "ai",
          sourceMaterialId: crypto.randomUUID(),
        });

        results.push({
          file,
          text: chunk.content,
          extractionResult,
        });
      } catch (error) {
        console.error(`Error extrayendo conocimiento del chunk ${i}:`, error);
        throw new Error(`Failed to extract knowledge from chunk ${i}`);
      }
    }

    return results;
  }

  private async generateKnowledgeNodesBatch(
    extractionResults: {
      file: File;
      text: string;
      extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>>;
    }[],
  ): Promise<void> {
    for (let i = 0; i < extractionResults.length; i++) {
      const { extractionResult } = extractionResults[i];
      const progress = Math.round(((i + 1) / extractionResults.length) * 100);
      this.updateStage("Generación de KnowledgeNodes", "processing", progress);

      try {
        const materialId = crypto.randomUUID();

        this.results.materials.push({
          id: materialId,
          name: extractionResults[i].file.name,
          markdownContent: extractionResults[i].text,
          knowledgeNodeIds: extractionResult.knowledgeNodeIds,
          questionIds: [],
        });

        this.results.stats.knowledgeNodesCreated +=
          extractionResult.stats.conceptCount +
          extractionResult.stats.definitionCount;
      } catch (error) {
        console.error(`Error generando KnowledgeNodes para chunk ${i}:`, error);
        throw new Error(`Failed to generate KnowledgeNodes for chunk ${i}`);
      }
    }
  }

  private async generateQuestionsFromCorpus(): Promise<void> {
    if (!this.corpusBuilder) {
      throw new Error("Corpus not built");
    }

    const corpus = this.corpusBuilder.getCorpus();

    // Generar preguntas basadas en conceptos importantes
    const importantConcepts = corpus.concepts
      .filter((c) => c.importanceScore >= 5) // Conceptos importantes
      .sort((a, b) => b.importanceScore - a.importanceScore);

    // Generar preguntas para cada concepto importante
    for (let i = 0; i < importantConcepts.length; i++) {
      const concept = importantConcepts[i];
      const progress = Math.round(((i + 1) / importantConcepts.length) * 100);
      this.updateStage("Generación de Preguntas", "processing", progress);

      try {
        // Buscar definición
        const definition = corpus.definitions.find(
          (d) => d.conceptId === concept.id,
        );

        // Buscar ejemplos
        const examples = corpus.examples.filter(
          (e) => e.conceptId === concept.id,
        );

        // Buscar conceptos relacionados
        const relatedConcepts = corpus.relationships
          .filter(
            (r) =>
              r.sourceConceptId === concept.id ||
              r.targetConceptId === concept.id,
          )
          .map((r) => {
            const relatedId =
              r.sourceConceptId === concept.id
                ? r.targetConceptId
                : r.sourceConceptId;
            return corpus.concepts.find((c) => c.id === relatedId);
          })
          .filter((c): c is CorpusConcept => !!c);

        // Crear conjunto de conceptos para generación
        const conceptsForQuestions = [
          { concept: concept.name, definition: definition?.definition || "" },
          ...relatedConcepts.map((c) => ({ concept: c.name, definition: "" })),
        ];

        // Generar preguntas
        const booleanQuestions = generateBooleanQuestions(
          conceptsForQuestions,
          this.options.subjectId,
        );
        const multipleChoiceQuestions = generateMultipleChoiceQuestions(
          conceptsForQuestions,
          this.options.subjectId,
        );
        const allQuestions = [...booleanQuestions, ...multipleChoiceQuestions];

        if (allQuestions.length > 0) {
          await saveQuestions(allQuestions);

          // Asociar preguntas con el material principal
          if (this.results.materials.length > 0) {
            this.results.materials[0].questionIds = (
              this.results.materials[0].questionIds || []
            ).concat(allQuestions.map((q) => q.id));
          }

          this.results.stats.questionsGenerated += allQuestions.length;
        }
      } catch (error) {
        console.error(
          `Error generando preguntas para concepto ${concept.name}:`,
          error,
        );
        throw new Error(
          `Failed to generate questions for concept ${concept.name}`,
        );
      }
    }
  }
}
