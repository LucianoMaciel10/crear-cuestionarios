// src/services/batch-processing/batch-cache.ts
import { db } from "../../data/db/dexie-db";

interface BatchCacheEntry {
  id: string;
  fileName: string;
  fileHash: string;
  markdownContent: string;
  createdAt: Date;
  updatedAt: Date;
}

class BatchCache {
  private static instance: BatchCache;
  private cache: Map<string, BatchCacheEntry>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): BatchCache {
    if (!BatchCache.instance) {
      BatchCache.instance = new BatchCache();
    }
    return BatchCache.instance;
  }

  async initialize() {
    // Inicializar caché desde IndexedDB si existe
    try {
      const entries = await db.materiales.toArray();
      entries.forEach((entry) => {
        if (
          entry.contenidoOriginal &&
          typeof entry.contenidoOriginal === "string"
        ) {
          const cacheEntry: BatchCacheEntry = {
            id: entry.id,
            fileName: entry.nombre,
            fileHash: this.generateHash(entry.contenidoOriginal),
            markdownContent: entry.contenidoOriginal,
            createdAt: entry.fechaCarga,
            updatedAt: entry.fechaCarga,
          };
          this.cache.set(entry.id, cacheEntry);
        }
      });
    } catch (error) {
      console.warn("No se pudo inicializar caché desde IndexedDB:", error);
    }
  }

  private generateHash(content: string): string {
    // Implementación simple de hash para caché
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    return this.generateHash(text);
  }

  async checkCache(
    file: File,
  ): Promise<{ cached: boolean; entry?: BatchCacheEntry }> {
    const fileHash = await this.calculateFileHash(file);

    // Buscar en caché en memoria
    for (const entry of this.cache.values()) {
      if (entry.fileHash === fileHash) {
        return { cached: true, entry };
      }
    }

    return { cached: false };
  }

  async addToCache(file: File, markdownContent: string): Promise<string> {
    const fileHash = await this.calculateFileHash(file);
    const id = crypto.randomUUID();

    const entry: BatchCacheEntry = {
      id,
      fileName: file.name,
      fileHash,
      markdownContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.cache.set(id, entry);

    // Persistir en IndexedDB
    try {
      await db.materiales.add({
        id,
        nombre: file.name,
        tipo: "md" as const,
        contenidoOriginal: markdownContent,
        fechaCarga: new Date(),
        idMateria: "cache", // Marcar como caché
      });
    } catch (error) {
      console.error("Error al persistir en caché:", error);
    }

    return id;
  }

  getFromCache(id: string): BatchCacheEntry | undefined {
    return this.cache.get(id);
  }

  clearCache() {
    this.cache.clear();
  }
}

export const batchCache = BatchCache.getInstance();
