// src/services/material-parser/pptx-parser.ts
import { getPPTXOCRService } from "../ocr/pptx-ocr.service";

/**
 * Extrae texto de un archivo PPTX.
 * @param file - Archivo PPTX como ArrayBuffer.
 * @param onProgress - Callback opcional para progreso de OCR.
 * @returns Texto extraído del PPTX.
 * @throws Error si falla el parseo del PPTX.
 */
export async function parsePPTX(
  file: ArrayBuffer,
  onProgress?: (
    currentSlide: number,
    totalSlides: number,
    text: string,
  ) => void,
): Promise<string> {
  try {
    const pptxOCRService = getPPTXOCRService();
    return await pptxOCRService.extractTextWithOCR(file, onProgress);
  } catch (error) {
    const err = new Error("Failed to parse PPTX file");
    console.error("Error parsing PPTX:", { error });
    throw err;
  }
}
