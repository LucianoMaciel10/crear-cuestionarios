// src/services/batch-processing/batch-processor.ts
import { parsePDF } from '../material-parser/pdf-parser';
import { parseDOCX } from '../material-parser/docx-parser';
import { convertToMarkdown, createStructuredMarkdown } from '../material-parser/markdown-converter';
import { extractKnowledgeFromText } from '../knowledge-extraction/extraction-service';
import { generateBooleanQuestions, generateMultipleChoiceQuestions } from '../question-generator/boolean-generator';
import { saveQuestions } from '../question.service';

export interface BatchProcessingOptions {
  subjectId: string;
  preferAI?: boolean;
  generateQuestions?: boolean;
}

export interface ProcessingStage {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
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
  
  constructor(options: BatchProcessingOptions) {
    this.options = options;
    this.stages = [
      { name: 'Lectura de archivos', status: 'pending', progress: 0 },
      { name: 'Conversión a Markdown', status: 'pending', progress: 0 },
      { name: 'Extracción de conocimiento', status: 'pending', progress: 0 },
      { name: 'Generación de KnowledgeNodes', status: 'pending', progress: 0 },
      { name: 'Generación de preguntas', status: 'pending', progress: 0 },
      { name: 'Finalización', status: 'pending', progress: 0 }
    ];
    this.results = {
      success: false,
      materials: [],
      stats: {
        totalFiles: 0,
        processedFiles: 0,
        knowledgeNodesCreated: 0,
        questionsGenerated: 0
      }
    };
    this.cache = new Map();
  }
  
  getStages(): ProcessingStage[] {
    return this.stages;
  }
  
  getResults(): BatchProcessingResult {
    return this.results;
  }
  
  private updateStage(name: string, status: ProcessingStage['status'], progress: number, error?: string) {
    const stage = this.stages.find(s => s.name === name);
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
      this.updateStage('Lectura de archivos', 'processing', 0);
      const fileContents = await this.readFiles(files);
      this.updateStage('Lectura de archivos', 'completed', 100);
      
      // Etapa 2: Conversión a Markdown
      this.updateStage('Conversión a Markdown', 'processing', 0);
      const markdownContents = await this.convertToMarkdownBatch(fileContents);
      this.updateStage('Conversión a Markdown', 'completed', 100);
      
      // Etapa 3: Extracción de conocimiento
      this.updateStage('Extracción de conocimiento', 'processing', 0);
      const extractionResults = await this.extractKnowledgeBatch(markdownContents);
      this.updateStage('Extracción de conocimiento', 'completed', 100);
      
      // Etapa 4: Generación de KnowledgeNodes
      this.updateStage('Generación de KnowledgeNodes', 'processing', 0);
      await this.generateKnowledgeNodesBatch(extractionResults);
      this.updateStage('Generación de KnowledgeNodes', 'completed', 100);
      
      // Etapa 5: Generación de preguntas (opcional)
      if (this.options.generateQuestions) {
        this.updateStage('Generación de preguntas', 'processing', 0);
        await this.generateQuestionsBatch(extractionResults);
        this.updateStage('Generación de preguntas', 'completed', 100);
      } else {
        this.updateStage('Generación de preguntas', 'completed', 100);
      }
      
      // Etapa 6: Finalización
      this.updateStage('Finalización', 'processing', 0);
      this.results.success = true;
      this.updateStage('Finalización', 'completed', 100);
      
      return this.results;
    } catch (error) {
      console.error('Error en procesamiento por lotes:', error);
      this.updateStage('Finalización', 'failed', 0, error instanceof Error ? error.message : 'Error desconocido');
      this.results.success = false;
      throw error;
    }
  }
  
  private async readFiles(files: File[]): Promise<{ file: File; content: string }[]> {
    const results: { file: File; content: string }[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = Math.round(((i + 1) / files.length) * 100);
      this.updateStage('Lectura de archivos', 'processing', progress);
      
      try {
        let content = '';
        
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          content = await parsePDF(arrayBuffer);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
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
  
  private async convertToMarkdownBatch(fileContents: { file: File; content: string }[]): Promise<{ file: File; markdown: string }[]> {
    const results: { file: File; markdown: string }[] = [];
    
    for (let i = 0; i < fileContents.length; i++) {
      const { file, content } = fileContents[i];
      const progress = Math.round(((i + 1) / fileContents.length) * 100);
      this.updateStage('Conversión a Markdown', 'processing', progress);
      
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
  
  private async extractKnowledgeBatch(markdownContents: { file: File; markdown: string }[]): Promise<{ file: File; text: string; extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>> }[]> {
    const results: { file: File; text: string; extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>> }[] = [];
    
    for (let i = 0; i < markdownContents.length; i++) {
      const { file, markdown } = markdownContents[i];
      const progress = Math.round(((i + 1) / markdownContents.length) * 100);
      this.updateStage('Extracción de conocimiento', 'processing', progress);
      
      try {
        const extractionResult = await extractKnowledgeFromText(markdown, {
          preferAI: this.options.preferAI,
          sourceType: 'ai',
          sourceMaterialId: crypto.randomUUID()
        });
        
        results.push({ file, text: markdown, extractionResult });
      } catch (error) {
        console.error(`Error extrayendo conocimiento de ${file.name}:`, error);
        throw new Error(`Failed to extract knowledge from ${file.name}`);
      }
    }
    
    return results;
  }
  
  private async generateKnowledgeNodesBatch(extractionResults: { file: File; text: string; extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>> }[]) {
    for (let i = 0; i < extractionResults.length; i++) {
      const { file, extractionResult } = extractionResults[i];
      const progress = Math.round(((i + 1) / extractionResults.length) * 100);
      this.updateStage('Generación de KnowledgeNodes', 'processing', progress);
      
      try {
        const materialId = crypto.randomUUID();
        
        this.results.materials.push({
          id: materialId,
          name: file.name,
          markdownContent: this.cache.get(file.name) || '',
          knowledgeNodeIds: extractionResult.knowledgeNodeIds,
          questionIds: []
        });
        
        this.results.stats.knowledgeNodesCreated += extractionResult.stats.conceptCount +
          extractionResult.stats.definitionCount;
      } catch (error) {
        console.error(`Error generando KnowledgeNodes para ${file.name}:`, error);
        throw new Error(`Failed to generate KnowledgeNodes for ${file.name}`);
      }
    }
  }
  
  private async generateQuestionsBatch(extractionResults: { file: File; text: string; extractionResult: Awaited<ReturnType<typeof extractKnowledgeFromText>> }[]) {
    for (let i = 0; i < extractionResults.length; i++) {
      const { extractionResult } = extractionResults[i];
      const progress = Math.round(((i + 1) / extractionResults.length) * 100);
      this.updateStage('Generación de preguntas', 'processing', progress);
      
      try {
        const concepts = extractionResult.legacyContent?.conceptos.map(concept => ({
          concept,
          definition: extractionResult.legacyContent?.definiciones.find(d => d.concepto === concept)?.definicion || ''
        })) || [];
        
        const booleanQuestions = generateBooleanQuestions(concepts, this.options.subjectId);
        const multipleChoiceQuestions = generateMultipleChoiceQuestions(concepts, this.options.subjectId);
        const allQuestions = [...booleanQuestions, ...multipleChoiceQuestions];
        
        if (allQuestions.length > 0) {
          await saveQuestions(allQuestions);
          this.results.materials[i].questionIds = allQuestions.map(q => q.id);
          this.results.stats.questionsGenerated += allQuestions.length;
        }
      } catch (error) {
        console.error(`Error generando preguntas para ${extractionResults[i].file.name}:`, error);
        throw new Error(`Failed to generate questions for ${extractionResults[i].file.name}`);
      }
    }
  }
}