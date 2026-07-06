// src/services/material-parser/pdf-parser.ts
import { getPDFOCRService } from "../ocr/pdf-ocr.service";

/**
 * Extrae texto de un archivo PDF.
 * @param file - Archivo PDF como ArrayBuffer.
 * @param onProgress - Callback opcional para progreso de OCR.
 * @returns Texto extraído del PDF.
 * @throws Error si falla el parseo del PDF.
 */
export async function parsePDF(
  file: ArrayBuffer,
  onProgress?: (currentPage: number, totalPages: number, text: string) => void,
): Promise<string> {
  try {
    const pdfOCRService = getPDFOCRService();
    return await pdfOCRService.extractTextWithOCR(file, onProgress);
  } catch (error) {
    const err = new Error("Failed to parse PDF file");
    console.error("Error parsing PDF:", { error });
    throw err;
  }
}
