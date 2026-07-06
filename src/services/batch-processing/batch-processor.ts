// src/services/batch-processing/batch-processor.ts
import { parsePDF } from "../material-parser/pdf-parser";
import { parsePPTX } from "../material-parser/pptx-parser";
import { createStructuredMarkdown } from "../material-parser/markdown-converter";
import { extractKnowledgeFromText } from "../knowledge-extraction/extraction-service";
import { generateBooleanQuestions } from "../question-generator/boolean-generator";
import { generateMultipleChoiceQuestions } from "../question-generator/multiple-choice-generator";
import { saveQuestions } from "../question.service";
import { CorpusBuilder } from "../corpus-processing/corpus-builder";
import {
  createMaterial,
  updateMaterialProcessingStatus,
} from "../material.service";
import { db } from "../../data/db/dexie-db";

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
  private materials: { file: File; materialId: string }[];

  constructor(options: BatchProcessingOptions) {
    this.options = options;
    this.stages = [
      { name: "Lectura de archivos", status: "pending", progress: 0 },
      { name: "OCR en progreso", status: "pending", progress: 0 },
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
    this.materials = [];
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
      // Etapa 1: Crear materiales primero
      await this.createMaterials(files);

      // Etapa 2: Lectura de archivos
      this.updateStage("Lectura de archivos", "processing", 0);
      const fileContents = await this.readFiles(files);
      this.updateStage("Lectura de archivos", "completed", 100);

      // Check if OCR was used and update OCR stage
      const ocrStage = this.stages.find((s) => s.name === "OCR en progreso");
      if (ocrStage && ocrStage.status === "pending") {
        // OCR was not used, mark as completed
        ocrStage.status = "completed";
        ocrStage.progress = 100;
      }

      // Etapa 3: Conversión a Markdown
      this.updateStage("Conversión a Markdown", "processing", 0);
      const markdownContents = await this.convertToMarkdownBatch(fileContents);
      this.updateStage("Conversión a Markdown", "completed", 100);

      // Etapa 4: Construcción de Corpus Unificado
      this.updateStage("Construcción de Corpus", "processing", 0);
      await this.buildSubjectCorpus(markdownContents);
      this.updateStage("Construcción de Corpus", "completed", 100);

      // Etapa 5: Extracción de conocimiento desde corpus
      this.updateStage("Extracción de Conocimiento", "processing", 0);
      const extractionResults = await this.extractKnowledgeFromCorpus();
      this.updateStage("Extracción de Conocimiento", "completed", 100);

      // Etapa 6: Generación de KnowledgeNodes
      this.updateStage("Generación de KnowledgeNodes", "processing", 0);
      await this.generateKnowledgeNodesBatch(extractionResults);
      this.updateStage("Generación de KnowledgeNodes", "completed", 100);

      // Etapa 7: Generación de preguntas (opcional)
      if (this.options.generateQuestions) {
        this.updateStage("Generación de Preguntas", "processing", 0);
        await this.generateQuestionsFromCorpus();
        this.updateStage("Generación de Preguntas", "completed", 100);
      } else {
        this.updateStage("Generación de Preguntas", "completed", 100);
      }

      // Etapa 8: Finalización
      this.updateStage("Finalización", "processing", 0);
      await this.finalizeProcessing();
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

  private async createMaterials(files: File[]): Promise<void> {
    for (const file of files) {
      const material = await createMaterial(
        file.name,
        file.type.includes("pdf")
          ? "pdf"
          : file.type.includes("presentation")
            ? "pptx"
            : file.type.includes("text")
              ? "txt"
              : "md",
        undefined,
        this.options.subjectId,
        file.name,
        file.type,
      );
      this.materials.push({ file, materialId: material.id });
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
          // Add OCR progress tracking for PDF
          let ocrUsed = false;
          content = await parsePDF(arrayBuffer, (currentPage, totalPages) => {
            if (!ocrUsed) {
              // Add OCR stage when first OCR progress is received
              this.stages.splice(2, 0, {
                name: "OCR en progreso",
                status: "processing",
                progress: Math.round((currentPage / totalPages) * 100),
              });
              ocrUsed = true;
            }

            // Update OCR progress
            const ocrStage = this.stages.find(
              (s) => s.name === "OCR en progreso",
            );
            if (ocrStage) {
              ocrStage.progress = Math.round((currentPage / totalPages) * 100);
              ocrStage.status =
                currentPage === totalPages ? "completed" : "processing";
            }
          });
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ) {
          const arrayBuffer = await file.arrayBuffer();
          // Add OCR progress tracking for PPTX
          let ocrUsed = false;
          content = await parsePPTX(
            arrayBuffer,
            (currentSlide, totalSlides) => {
              if (!ocrUsed) {
                // Add OCR stage when first OCR progress is received
                this.stages.splice(2, 0, {
                  name: "OCR en progreso",
                  status: "processing",
                  progress: Math.round((currentSlide / totalSlides) * 100),
                });
                ocrUsed = true;
              }

              // Update OCR progress
              const ocrStage = this.stages.find(
                (s) => s.name === "OCR en progreso",
              );
              if (ocrStage) {
                ocrStage.progress = Math.round(
                  (currentSlide / totalSlides) * 100,
                );
                ocrStage.status =
                  currentSlide === totalSlides ? "completed" : "processing";
              }
            },
          );
        } else {
          content = await file.text();
        }
        results.push({ file, content });
      } catch (error) {
        console.error(`Error leyendo archivo ${file.name}:`, error);
        throw new Error(`Failed to read file ${file.name}`, { cause: error });
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
        throw new Error(`Failed to convert ${file.name} to Markdown`, {
          cause: error,
        });
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
        throw new Error(`Failed to add ${file.name} to corpus`, {
          cause: error,
        });
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
      materialId: string;
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
      materialId: string;
    }[] = [];

    // Procesar cada chunk del corpus como un documento separado
    for (let i = 0; i < corpus.chunks.length; i++) {
      const chunk = corpus.chunks[i];
      const progress = Math.round(((i + 1) / corpus.chunks.length) * 100);
      this.updateStage("Extracción de Conocimiento", "processing", progress);

      try {
        // Encontrar el material asociado con este chunk
        const sourceFiles = chunk.sourceFiles;
        const materialEntry = this.materials.find((m) =>
          sourceFiles.includes(m.file.name),
        );

        if (!materialEntry) {
          console.warn(
            `No se encontró material para chunk ${chunk.id}, usando ID temporal`,
          );
          // Esto no debería ocurrir en la nueva arquitectura
        }

        const materialId = materialEntry?.materialId || crypto.randomUUID();

        const extractionResult = await extractKnowledgeFromText(chunk.content, {
          preferAI: this.options.preferAI,
          sourceType: "ai",
          sourceMaterialId: materialId,
        });

        results.push({
          file:
            materialEntry?.file || new File([chunk.content], `chunk-${i}.md`),
          text: chunk.content,
          extractionResult,
          materialId,
        });
      } catch (error) {
        console.error(`Error extrayendo conocimiento del chunk ${i}:`, error);
        throw new Error(`Failed to extract knowledge from chunk ${i}`, {
          cause: error,
        });
      }
    }

    return results;
  }

  private async generateKnowledgeNodesBatch(
    extractionResults: {
      file: File;
      text: string;
      extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>>;
      materialId: string;
    }[],
  ): Promise<void> {
    for (let i = 0; i < extractionResults.length; i++) {
      const { extractionResult, file, text, materialId } = extractionResults[i];
      const progress = Math.round(((i + 1) / extractionResults.length) * 100);
      this.updateStage("Generación de KnowledgeNodes", "processing", progress);

      try {
        // Actualizar material con contenido markdown
        await db.materiales.update(materialId, {
          markdownContent: text,
        });

        this.results.materials.push({
          id: materialId,
          name: file.name,
          markdownContent: text,
          knowledgeNodeIds: extractionResult.knowledgeNodeIds,
          questionIds: [],
        });

        this.results.stats.knowledgeNodesCreated +=
          extractionResult.stats.conceptCount +
          extractionResult.stats.definitionCount;

        this.results.stats.processedFiles++;
      } catch (error) {
        console.error(`Error generando KnowledgeNodes para chunk ${i}:`, error);
        throw new Error(`Failed to generate KnowledgeNodes for chunk ${i}`, {
          cause: error,
        });
      }
    }
  }

  private async generateQuestionsFromCorpus(): Promise<void> {
    // Generar preguntas basadas en los KnowledgeNodes extraídos
    // Usar los conceptos de los materiales procesados
    const allConcepts: {
      concept: string;
      definition: string;
      materialId: string;
      knowledgeNodeId: string;
    }[] = [];

    for (const material of this.results.materials) {
      // Obtener KnowledgeNodes para este material
      const knowledgeNodes = await import("../knowledge-node.service").then(
        (service) => service.getKnowledgeNodesByMaterial(material.id),
      );

      // Extraer conceptos y definiciones de los KnowledgeNodes
      for (const node of knowledgeNodes) {
        if (node.type === "definition") {
          const [concept, definition] = node.content.split(": ");
          if (concept && definition) {
            allConcepts.push({
              concept,
              definition,
              materialId: material.id,
              knowledgeNodeId: node.id,
            });
          }
        } else if (node.type === "concept") {
          allConcepts.push({
            concept: node.content,
            definition: "",
            materialId: material.id,
            knowledgeNodeId: node.id,
          });
        }
      }
    }

    // Generar preguntas para cada concepto
    for (let i = 0; i < allConcepts.length; i++) {
      const concept = allConcepts[i];
      const progress = Math.round(((i + 1) / allConcepts.length) * 100);
      this.updateStage("Generación de Preguntas", "processing", progress);

      try {
        // Crear conjunto de conceptos para generación
        const conceptsForQuestions = [concept];

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

        // Agregar información de origen a las preguntas
        allQuestions.forEach((question) => {
          question.sourceMaterialId = concept.materialId;
          question.sourceKnowledgeNodeId = concept.knowledgeNodeId;
        });

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
          `Error generando preguntas para concepto ${concept.concept}:`,
          error,
        );
        throw new Error(
          `Failed to generate questions for concept ${concept.concept}`,
          { cause: error },
        );
      }
    }
  }

  private async finalizeProcessing(): Promise<void> {
    // Actualizar estado de todos los materiales a completado
    for (const material of this.materials) {
      await updateMaterialProcessingStatus(
        material.materialId,
        "completed",
        undefined,
        {
          conceptCount: this.results.stats.knowledgeNodesCreated,
          definitionCount: this.results.stats.knowledgeNodesCreated,
          questionCount: this.results.stats.questionsGenerated,
        },
      );
    }

    this.results.success = true;
  }
}
