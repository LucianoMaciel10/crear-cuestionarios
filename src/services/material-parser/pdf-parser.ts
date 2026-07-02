// src/services/material-parser/pdf-parser.ts
import {
  getDocument,
  type PDFDocumentProxy,
  GlobalWorkerOptions,
} from "pdfjs-dist";

// Configurar worker para pdf.js usando CDN
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.js`;

/**
 * Verifica si un elemento tiene la propiedad 'str'.
 * @param item - Elemento a verificar.
 * @returns true si el elemento tiene la propiedad 'str'.
 */
function hasStr(item: unknown): item is { str: string } {
  return typeof item === "object" && item !== null && "str" in item;
}

/**
 * Extrae texto de un archivo PDF.
 * @param file - Archivo PDF como ArrayBuffer.
 * @returns Texto extraído del PDF.
 * @throws Error si falla el parseo del PDF.
 */
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
    const err = new Error("Failed to parse PDF file");
    console.error("Error parsing PDF:", { error });
    throw err;
  }
}
