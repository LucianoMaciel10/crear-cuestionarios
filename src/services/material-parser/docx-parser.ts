// src/services/material-parser/docx-parser.ts
import * as mammoth from "mammoth";

/**
 * Extrae texto de un archivo DOCX.
 * @param file - Archivo DOCX como ArrayBuffer.
 * @returns Texto extraído del DOCX.
 * @throws Error si falla el parseo del DOCX.
 */
export async function parseDOCX(file: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: file });
    return result.value;
  } catch (error) {
    const err = new Error("Failed to parse DOCX file");
    console.error("Error parsing DOCX:", { error });
    throw err;
  }
}
