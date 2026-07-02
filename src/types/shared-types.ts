// src/types/shared-types.ts
// Interfaces y tipos compartidos entre componentes y servicios

export interface ProcessingStage {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}