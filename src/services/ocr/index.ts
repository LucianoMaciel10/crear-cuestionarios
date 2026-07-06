// src/services/ocr/index.ts
// Export all OCR services for easy import

export { getTesseractService, TesseractService } from "./tesseract.service";
export { getPDFOCRService, PDFOCRService } from "./pdf-ocr.service";
export { getPPTXOCRService, PPTXOCRService } from "./pptx-ocr.service";
export { detectScannedDocument, analyzeDocumentTextQuality } from "./document-detector.service";
export type {
  ScannedDocumentCriteria,
  DocumentAnalysisResult,
  PageAnalysis,
} from "./document-detector.service";