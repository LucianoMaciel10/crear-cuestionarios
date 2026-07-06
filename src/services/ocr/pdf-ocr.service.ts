// src/services/ocr/pdf-ocr.service.ts
import {
  getDocument,
  type PDFDocumentProxy,
  GlobalWorkerOptions,
} from "pdfjs-dist";
import { getTesseractService } from "./tesseract.service";
import {
  detectScannedDocument,
  analyzeDocumentTextQuality,
} from "./document-detector.service";

// Configure worker for pdf.js
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * PDF OCR Service
 * Handles PDF processing with intelligent OCR fallback
 */
export class PDFOCRService {
  private tesseractService = getTesseractService();

  /**
   * Extract text from PDF with intelligent OCR fallback
   * @param file - PDF file as ArrayBuffer
   * @param onProgress - Optional progress callback for OCR
   * @returns Extracted text
   */
  async extractTextWithOCR(
    file: ArrayBuffer,
    onProgress?: (
      currentPage: number,
      totalPages: number,
      text: string,
    ) => void,
  ): Promise<string> {
    // First, try normal text extraction
    const normalText = await this.extractTextNormal(file);
    const pdf = await getDocument({ data: file }).promise;
    const pageCount = pdf.numPages;

    // Analyze text quality to determine if OCR is needed
    const isScanned = detectScannedDocument(normalText, pageCount);

    if (!isScanned) {
      // Document has sufficient text, return normal extraction
      return normalText;
    }

    // Document appears to be scanned, use OCR
    console.log("Document detected as scanned, using OCR...");
    return this.extractTextWithOCRFull(pdf, onProgress);
  }

  /**
   * Extract text using normal PDF.js method
   * @param file - PDF file as ArrayBuffer
   * @returns Extracted text
   */
  private async extractTextNormal(file: ArrayBuffer): Promise<string> {
    try {
      const pdf: PDFDocumentProxy = await getDocument({ data: file }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: unknown) =>
            typeof item === "object" && item !== null && "str" in item
              ? item.str
              : "",
          )
          .join(" ");
        text += pageText + "\n";
      }

      return text;
    } catch (error) {
      console.error("Error in normal PDF extraction:", error);
      throw new Error("Failed to extract text from PDF", { cause: error });
    }
  }

  /**
   * Extract text using OCR for all pages
   * @param pdf - PDF document proxy
   * @param onProgress - Progress callback
   * @returns Extracted text
   */
  private async extractTextWithOCRFull(
    pdf: PDFDocumentProxy,
    onProgress?: (
      currentPage: number,
      totalPages: number,
      text: string,
    ) => void,
  ): Promise<string> {
    try {
      // Initialize Tesseract worker
      await this.tesseractService.initialize();

      let fullText = "";
      const totalPages = pdf.numPages;

      // Process each page
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);

        // Render page as image
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create canvas context for OCR");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Create render parameters
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // Convert canvas to image data
        const imageData = canvas.toDataURL("image/png");

        // Perform OCR on the image
        const pageText = await this.tesseractService.recognize(imageData);

        fullText += pageText + "\n\n";

        if (onProgress) {
          onProgress(i, totalPages, pageText);
        }

        // Clean up
        page.cleanup();
      }

      return fullText;
    } catch (error) {
      console.error("Error in PDF OCR extraction:", error);
      await this.tesseractService.cleanup();
      throw new Error("Failed to perform OCR on PDF", { cause: error });
    } finally {
      await this.tesseractService.cleanup();
    }
  }

  /**
   * Analyze PDF text quality
   * @param file - PDF file as ArrayBuffer
   * @returns Document analysis result
   */
  async analyzePDFTextQuality(file: ArrayBuffer): Promise<{
    analysis: unknown;
    isScanned: boolean;
  }> {
    const text = await this.extractTextNormal(file);
    const pdf = await getDocument({ data: file }).promise;
    const pageCount = pdf.numPages;

    const analysis = analyzeDocumentTextQuality(text, pageCount);
    const isScanned = detectScannedDocument(text, pageCount);

    return { analysis, isScanned };
  }
}

/**
 * Singleton instance of PDFOCRService
 */
let pdfOCRServiceInstance: PDFOCRService | null = null;

export function getPDFOCRService(): PDFOCRService {
  if (!pdfOCRServiceInstance) {
    pdfOCRServiceInstance = new PDFOCRService();
  }
  return pdfOCRServiceInstance;
}
