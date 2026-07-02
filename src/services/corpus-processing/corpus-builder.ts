// src/services/corpus-processing/corpus-builder.ts

/**
 * Representa un corpus unificado de una materia
 */
export interface SubjectCorpus {
  subjectId: string;
  rawMarkdown: string;
  normalizedMarkdown: string;
  chunks: CorpusChunk[];
  concepts: CorpusConcept[];
  definitions: CorpusDefinition[];
  examples: CorpusExample[];
  relationships: CorpusRelationship[];
  metadata: {
    fileCount: number;
    totalWords: number;
    processingDate: Date;
  };
}

/**
 * Representa un chunk de contenido del corpus
 */
export interface CorpusChunk {
  id: string;
  title: string;
  content: string;
  sectionLevel: number;
  sourceFiles: string[];
  wordCount: number;
  position: number;
}

/**
 * Representa un concepto en el corpus
 */
export interface CorpusConcept {
  id: string;
  name: string;
  normalizedName: string;
  occurrences: number;
  chunks: string[]; // IDs de chunks donde aparece
  sourceFiles: string[];
  importanceScore: number;
}

/**
 * Representa una definición en el corpus
 */
export interface CorpusDefinition {
  id: string;
  conceptId: string;
  definition: string;
  chunks: string[]; // IDs de chunks donde aparece
  sourceFiles: string[];
  qualityScore: number;
}

/**
 * Representa un ejemplo en el corpus
 */
export interface CorpusExample {
  id: string;
  conceptId: string;
  example: string;
  chunks: string[]; // IDs de chunks donde aparece
  sourceFiles: string[];
}

/**
 * Representa una relación entre conceptos
 */
export interface CorpusRelationship {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationshipType:
    | "is-a"
    | "part-of"
    | "related-to"
    | "requires"
    | "example-of";
  evidence: string;
  chunks: string[]; // IDs de chunks donde aparece
  sourceFiles: string[];
  confidence: number;
}

/**
 * Clase para construir y analizar un corpus unificado de materia
 */
export class CorpusBuilder {
  private subjectId: string;
  private fileContents: Map<string, string>;
  private corpus: SubjectCorpus;

  constructor(subjectId: string) {
    this.subjectId = subjectId;
    this.fileContents = new Map();
    this.corpus = {
      subjectId,
      rawMarkdown: "",
      normalizedMarkdown: "",
      chunks: [],
      concepts: [],
      definitions: [],
      examples: [],
      relationships: [],
      metadata: {
        fileCount: 0,
        totalWords: 0,
        processingDate: new Date(),
      },
    };
  }

  /**
   * Agrega contenido de un archivo al corpus
   */
  async addFileContent(
    fileName: string,
    markdownContent: string,
  ): Promise<void> {
    this.fileContents.set(fileName, markdownContent);
    this.corpus.metadata.fileCount = this.fileContents.size;
  }

  /**
   * Construye el corpus unificado
   */
  async buildCorpus(): Promise<SubjectCorpus> {
    // Etapa 1: Concatenar todo el Markdown
    this.corpus.rawMarkdown = this.concatenateMarkdown();

    // Etapa 2: Normalizar y limpiar
    this.corpus.normalizedMarkdown = this.normalizeMarkdown(
      this.corpus.rawMarkdown,
    );

    // Etapa 3: Dividir en chunks
    this.corpus.chunks = this.splitIntoChunks(this.corpus.normalizedMarkdown);

    // Etapa 4: Extraer conceptos globales
    this.corpus.concepts = await this.extractGlobalConcepts();

    // Etapa 5: Extraer definiciones globales
    this.corpus.definitions = await this.extractGlobalDefinitions();

    // Etapa 6: Extraer ejemplos globales
    this.corpus.examples = await this.extractGlobalExamples();

    // Etapa 7: Detectar relaciones entre conceptos
    this.corpus.relationships = await this.detectConceptRelationships();

    // Etapa 8: Calcular métricas
    this.calculateMetrics();

    return this.corpus;
  }

  /**
   * Concatenar todo el Markdown de los archivos
   */
  private concatenateMarkdown(): string {
    let combined = "";

    // Agregar metadata de cada archivo
    this.fileContents.forEach((content, fileName) => {
      combined += `---
file: ${fileName}
source: ${new Date().toISOString()}
---\n\n`;
      combined += content + "\n\n";
    });

    return combined;
  }

  /**
   * Normalizar y limpiar el Markdown
   */
  private normalizeMarkdown(markdown: string): string {
    let normalized = markdown;

    // Normalizar saltos de línea
    normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Limpiar múltiples líneas vacías
    normalized = normalized.replace(/\n{3,}/g, "\n\n");

    // Normalizar títulos
    normalized = normalized.replace(/^#{1,6}\s*/gm, (match) => {
      const level = match.length;
      return "#".repeat(Math.min(level, 3)) + " "; // Limitar a 3 niveles
    });

    // Limpiar metadata duplicada
    normalized = normalized.replace(/---\n[\s\S]*?\n---/g, (match, offset) => {
      return offset === 0 ? match : "";
    });

    return normalized.trim();
  }

  /**
   * Dividir el corpus en chunks respetando estructura
   */
  private splitIntoChunks(markdown: string): CorpusChunk[] {
    const lines = markdown.split("\n");
    const chunks: CorpusChunk[] = [];
    let currentChunk: Partial<CorpusChunk> = {
      content: "",
      sourceFiles: [],
      wordCount: 0,
    };

    let currentSectionLevel = 0;
    let chunkIdCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detectar títulos
      const titleMatch = line.match(/^(#{1,3})\s*(.+?)\s*$/);
      if (titleMatch) {
        // Guardar chunk anterior si existe
        if (currentChunk.content) {
          chunks.push({
            id: `chunk-${chunkIdCounter++}`,
            title: currentChunk.title || "Untitled",
            content: currentChunk.content.trim(),
            sectionLevel: currentSectionLevel,
            sourceFiles: [...new Set(currentChunk.sourceFiles)],
            wordCount: currentChunk.wordCount || 0,
            position: chunks.length,
          });
          currentChunk = {
            content: "",
            sourceFiles: [],
            wordCount: 0,
          };
        }

        currentSectionLevel = titleMatch[1].length;
        currentChunk.title = titleMatch[2];
        currentChunk.sectionLevel = currentSectionLevel;
      } else if (line.startsWith("file:")) {
        // Extraer nombre de archivo de metadata
        const fileMatch = line.match(/file:\s*([^\n]+)/);
        if (fileMatch && fileMatch[1]) {
          currentChunk.sourceFiles?.push(fileMatch[1]);
        }
      } else if (line.trim()) {
        // Contar palabras
        const words = line.trim().split(/\s+/);
        currentChunk.wordCount = (currentChunk.wordCount || 0) + words.length;
        currentChunk.content += line + "\n";
      }
    }

    // Guardar último chunk
    if (currentChunk.content) {
      chunks.push({
        id: `chunk-${chunkIdCounter}`,
        title: currentChunk.title || "Untitled",
        content: currentChunk.content.trim(),
        sectionLevel: currentSectionLevel,
        sourceFiles: [...new Set(currentChunk.sourceFiles || [])],
        wordCount: currentChunk.wordCount || 0,
        position: chunks.length,
      });
    }

    return chunks;
  }

  /**
   * Extraer conceptos globales del corpus
   */
  private async extractGlobalConcepts(): Promise<CorpusConcept[]> {
    const conceptMap = new Map<string, CorpusConcept>();
    const stopWords = new Set([
      "el",
      "la",
      "los",
      "las",
      "un",
      "una",
      "es",
      "son",
      "que",
      "y",
      "o",
      "en",
      "de",
      "para",
    ]);

    // Analizar todos los chunks
    for (const chunk of this.corpus.chunks) {
      // Extraer palabras clave de títulos
      const titleWords = chunk.title.split(/\s+/);

      for (const word of titleWords) {
        const normalized = word.toLowerCase();
        if (normalized.length > 2 && !stopWords.has(normalized)) {
          if (!conceptMap.has(normalized)) {
            conceptMap.set(normalized, {
              id: `concept-${crypto.randomUUID()}`,
              name: word,
              normalizedName: normalized,
              occurrences: 1,
              chunks: [chunk.id],
              sourceFiles: [...chunk.sourceFiles],
              importanceScore: chunk.sectionLevel <= 2 ? 2 : 1,
            });
          } else {
            const concept = conceptMap.get(normalized)!;
            concept.occurrences++;
            if (!concept.chunks.includes(chunk.id)) {
              concept.chunks.push(chunk.id);
            }
            chunk.sourceFiles.forEach((file) => {
              if (!concept.sourceFiles.includes(file)) {
                concept.sourceFiles.push(file);
              }
            });
            // Aumentar importancia si aparece en múltiples chunks
            if (concept.chunks.length > 1) {
              concept.importanceScore += 0.5;
            }
          }
        }
      }

      // Extraer conceptos de definiciones (patrones)
      const definitionPatterns = [
        "es un",
        "se define como",
        "significa que",
        "consiste en",
      ];
      for (const pattern of definitionPatterns) {
        if (chunk.content.toLowerCase().includes(pattern)) {
          const parts = chunk.content.split(new RegExp(pattern, "i"));
          if (parts.length > 1) {
            const conceptPart = parts[0].trim();
            const lastWord = conceptPart.split(/\s+/).pop();
            if (lastWord && lastWord.length > 2) {
              const normalized = lastWord.toLowerCase();
              if (!stopWords.has(normalized)) {
                if (!conceptMap.has(normalized)) {
                  conceptMap.set(normalized, {
                    id: `concept-${crypto.randomUUID()}`,
                    name: lastWord,
                    normalizedName: normalized,
                    occurrences: 1,
                    chunks: [chunk.id],
                    sourceFiles: [...chunk.sourceFiles],
                    importanceScore: 1.5,
                  });
                } else {
                  const concept = conceptMap.get(normalized)!;
                  concept.occurrences++;
                  concept.importanceScore += 0.3;
                }
              }
            }
          }
        }
      }
    }

    // Convertir a array y ordenar por importancia
    const concepts = Array.from(conceptMap.values());
    concepts.sort((a, b) => b.importanceScore - a.importanceScore);

    return concepts;
  }

  /**
   * Extraer definiciones globales del corpus
   */
  private async extractGlobalDefinitions(): Promise<CorpusDefinition[]> {
    const definitions: CorpusDefinition[] = [];

    // Buscar patrones de definición en todos los chunks
    for (const chunk of this.corpus.chunks) {
      const definitionPatterns = [
        {
          pattern:
            /(.*?)\s*(es un|se define como|significa que|consiste en)\s*(.+?)(?=\.|\n|$)/gi,
          groups: [1, 3],
        },
        { pattern: /(.*?):\s*(.+?)(?=\.|\n|$)/gi, groups: [1, 2] },
      ];

      for (const { pattern, groups } of definitionPatterns) {
        const matches = chunk.content.matchAll(pattern);
        for (const match of matches) {
          if (match[groups[0]] && match[groups[1]]) {
            const conceptName = match[groups[0]].trim();
            const definitionText = match[groups[1]].trim();

            // Buscar concepto correspondiente
            const concept = this.corpus.concepts.find(
              (c) =>
                c.normalizedName === conceptName.toLowerCase() ||
                c.name.toLowerCase() === conceptName.toLowerCase(),
            );

            if (concept) {
              // Verificar si ya existe definición para este concepto
              const existingDef = definitions.find(
                (d) => d.conceptId === concept.id,
              );

              if (existingDef) {
                // Mejorar definición existente
                existingDef.definition += ` ${definitionText}`;
                existingDef.qualityScore += 0.2;
                if (!existingDef.chunks.includes(chunk.id)) {
                  existingDef.chunks.push(chunk.id);
                }
              } else {
                // Crear nueva definición
                definitions.push({
                  id: `def-${crypto.randomUUID()}`,
                  conceptId: concept.id,
                  definition: definitionText,
                  chunks: [chunk.id],
                  sourceFiles: [...chunk.sourceFiles],
                  qualityScore: 1.0,
                });
              }
            }
          }
        }
      }
    }

    // Ordenar por calidad
    definitions.sort((a, b) => b.qualityScore - a.qualityScore);

    return definitions;
  }

  /**
   * Extraer ejemplos globales del corpus
   */
  private async extractGlobalExamples(): Promise<CorpusExample[]> {
    const examples: CorpusExample[] = [];

    // Buscar patrones de ejemplos
    const examplePatterns = [
      /por ejemplo,?\s*(.+?)(?=\.|\n|$)/gi,
      /ejemplo:\s*(.+?)(?=\.|\n|$)/gi,
      /un ejemplo de esto es\s*(.+?)(?=\.|\n|$)/gi,
    ];

    for (const chunk of this.corpus.chunks) {
      for (const pattern of examplePatterns) {
        const matches = chunk.content.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            const exampleText = match[1].trim();

            // Asociar con conceptos mencionados en el chunk
            const mentionedConcepts = this.corpus.concepts.filter((c) =>
              chunk.content.toLowerCase().includes(c.normalizedName),
            );

            // Crear ejemplo para cada concepto mencionado
            for (const concept of mentionedConcepts) {
              examples.push({
                id: `ex-${crypto.randomUUID()}`,
                conceptId: concept.id,
                example: exampleText,
                chunks: [chunk.id],
                sourceFiles: [...chunk.sourceFiles],
              });
            }
          }
        }
      }
    }

    return examples;
  }

  /**
   * Detectar relaciones entre conceptos
   */
  private async detectConceptRelationships(): Promise<CorpusRelationship[]> {
    const relationships: CorpusRelationship[] = [];

    // Patrones de relaciones
    const relationshipPatterns = [
      {
        type: "is-a" as const,
        patterns: [
          /(.+?)\s+es un(a)?\s+(.+?)(?=\.|,|\n|$)/i,
          /(.+?)\s+es un tipo de\s+(.+?)(?=\.|,|\n|$)/i,
        ],
        reverse: false,
      },
      {
        type: "part-of" as const,
        patterns: [
          /(.+?)\s+forma parte de\s+(.+?)(?=\.|,|\n|$)/i,
          /(.+?)\s+es parte de\s+(.+?)(?=\.|,|\n|$)/i,
        ],
        reverse: false,
      },
      {
        type: "related-to" as const,
        patterns: [
          /(.+?)\s+se relaciona con\s+(.+?)(?=\.|,|\n|$)/i,
          /(.+?)\s+y\s+(.+?)\s+están relacionados(?=\.|,|\n|$)/i,
        ],
        reverse: true,
      },
      {
        type: "requires" as const,
        patterns: [
          /(.+?)\s+requiere\s+(.+?)(?=\.|,|\n|$)/i,
          /(.+?)\s+necesita\s+(.+?)(?=\.|,|\n|$)/i,
        ],
        reverse: false,
      },
      {
        type: "example-of" as const,
        patterns: [/(.+?)\s+es un ejemplo de\s+(.+?)(?=\.|,|\n|$)/i],
        reverse: true,
      },
    ];

    for (const chunk of this.corpus.chunks) {
      for (const relPattern of relationshipPatterns) {
        for (const pattern of relPattern.patterns) {
          const matches = chunk.content.matchAll(pattern);
          for (const match of matches) {
            if (match[1] && match[2]) {
              const sourceConceptName = match[1].trim().toLowerCase();
              const targetConceptName = match[2].trim().toLowerCase();

              // Buscar conceptos
              const sourceConcept = this.corpus.concepts.find(
                (c) => c.normalizedName === sourceConceptName,
              );
              const targetConcept = this.corpus.concepts.find(
                (c) => c.normalizedName === targetConceptName,
              );

              if (sourceConcept && targetConcept) {
                // Verificar si ya existe la relación
                const existingRel = relationships.find(
                  (r) =>
                    r.sourceConceptId === sourceConcept.id &&
                    r.targetConceptId === targetConcept.id &&
                    r.relationshipType === relPattern.type,
                );

                if (existingRel) {
                  existingRel.confidence += 0.3;
                  existingRel.evidence += ` ${chunk.content.substring(0, 100)}...`;
                } else {
                  relationships.push({
                    id: `rel-${crypto.randomUUID()}`,
                    sourceConceptId: relPattern.reverse
                      ? targetConcept.id
                      : sourceConcept.id,
                    targetConceptId: relPattern.reverse
                      ? sourceConcept.id
                      : targetConcept.id,
                    relationshipType: relPattern.type,
                    evidence: chunk.content.substring(0, 100) + "...",
                    chunks: [chunk.id],
                    sourceFiles: [...chunk.sourceFiles],
                    confidence: 0.7,
                  });
                }
              }
            }
          }
        }
      }
    }

    // Filtrar relaciones con confianza suficiente
    return relationships.filter((r) => r.confidence >= 0.7);
  }

  /**
   * Calcular métricas del corpus
   */
  private calculateMetrics(): void {
    // Contar palabras totales
    const words = this.corpus.normalizedMarkdown.split(/\s+/);
    this.corpus.metadata.totalWords = words.length;

    // Calcular importancia de conceptos
    const maxOccurrences = Math.max(
      ...this.corpus.concepts.map((c) => c.occurrences),
      1,
    );
    this.corpus.concepts.forEach((concept) => {
      concept.importanceScore = (concept.occurrences / maxOccurrences) * 10;
    });
  }

  /**
   * Obtener el corpus construido
   */
  getCorpus(): SubjectCorpus {
    return this.corpus;
  }

  /**
   * Limpiar el corpus
   */
  clear(): void {
    this.fileContents.clear();
    this.corpus = {
      subjectId: this.subjectId,
      rawMarkdown: "",
      normalizedMarkdown: "",
      chunks: [],
      concepts: [],
      definitions: [],
      examples: [],
      relationships: [],
      metadata: {
        fileCount: 0,
        totalWords: 0,
        processingDate: new Date(),
      },
    };
  }
}
