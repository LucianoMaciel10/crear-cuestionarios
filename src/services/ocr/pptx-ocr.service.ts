// src/services/ocr/pptx-ocr.service.ts
import JSZip from "jszip";
import { getTesseractService } from "./tesseract.service";
import {
  detectScannedDocument,
  analyzeDocumentTextQuality,
} from "./document-detector.service";

/**
 * PPTX OCR Service
 * Handles PPTX processing with intelligent OCR fallback for image-based slides
 */
export class PPTXOCRService {
  private tesseractService = getTesseractService();

  /**
   * Extract text from PPTX with intelligent OCR for image-based slides
   * @param file - PPTX file as ArrayBuffer
   * @param onProgress - Optional progress callback for OCR
   * @returns Extracted text
   */
  async extractTextWithOCR(
    file: ArrayBuffer,
    onProgress?: (
      currentSlide: number,
      totalSlides: number,
      text: string,
    ) => void,
  ): Promise<string> {
    // First, try normal text extraction
    const { normalText, slideCount } = await this.extractTextNormal(file);

    // Analyze text quality to determine if OCR is needed
    const isScanned = detectScannedDocument(normalText, slideCount);

    if (!isScanned) {
      // Document has sufficient text, return normal extraction
      return normalText;
    }

    // Document appears to be scanned/image-based, use OCR
    console.log("PPTX detected as image-based, using OCR...");
    return this.extractTextWithOCRFull(file, slideCount, onProgress);
  }

  /**
   * Extract text using normal PPTX parsing
   * @param file - PPTX file as ArrayBuffer
   * @returns Extracted text and slide count
   */
  private async extractTextNormal(file: ArrayBuffer): Promise<{
    normalText: string;
    slideCount: number;
  }> {
    try {
      const zip = await JSZip.loadAsync(file);
      let text = "";

      // Count slides
      const slideFiles = Object.keys(zip.files).filter(
        (fileName) =>
          fileName.startsWith("ppt/slides/") && fileName.endsWith(".xml"),
      );

      // Process each slide
      for (const slideFile of slideFiles) {
        const slideContent = await zip.file(slideFile)?.async("text");
        if (slideContent) {
          const slideText = this.extractTextFromSlide(slideContent);
          text += slideText + "\n\n";
        }
      }

      return {
        normalText: text.trim(),
        slideCount: slideFiles.length,
      };
    } catch (error) {
      console.error("Error in normal PPTX extraction:", error);
      throw new Error("Failed to extract text from PPTX", { cause: error });
    }
  }

  /**
   * Extract text from slide XML content
   * @param xmlContent - Slide XML content
   * @returns Extracted text
   */
  private extractTextFromSlide(xmlContent: string): string {
    // Extract text from <a:t> elements
    const textMatches = xmlContent.match(/<a:t>(.*?)<\/a:t>/g);

    if (!textMatches) return "";

    let slideText = "";
    for (const match of textMatches) {
      const textContent = match.replace(/<a:t>/g, "").replace(/<\/a:t>/g, "");
      slideText += textContent + " ";
    }

    return slideText.trim();
  }

  /**
   * Extract text using OCR for all slides
   * @param file - PPTX file as ArrayBuffer
   * @param slideCount - Number of slides
   * @param onProgress - Progress callback
   * @returns Extracted text
   */
  private async extractTextWithOCRFull(
    file: ArrayBuffer,
    slideCount: number,
    onProgress?: (
      currentSlide: number,
      totalSlides: number,
      text: string,
    ) => void,
  ): Promise<string> {
    try {
      // Initialize Tesseract worker
      await this.tesseractService.initialize();

      const zip = await JSZip.loadAsync(file);
      let fullText = "";

      // Get all slide files
      const slideFiles = Object.keys(zip.files)
        .filter(
          (fileName) =>
            fileName.startsWith("ppt/slides/") && fileName.endsWith(".xml"),
        )
        .sort(); // Process in order

      // Process each slide
      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        const slideContent = await zip.file(slideFile)?.async("text");

        if (slideContent) {
          // First try to extract normal text
          const normalText = this.extractTextFromSlide(slideContent);

          if (normalText.length > 50) {
            // Slide has sufficient text, use normal extraction
            fullText += normalText + "\n\n";
            if (onProgress) {
              onProgress(i + 1, slideCount, normalText);
            }
            continue;
          }

          // Slide has little text, try to find and extract images
          const imageText = await this.extractTextFromSlideImages(
            zip,
            slideContent,
            slideFile,
          );

          fullText += imageText + "\n\n";
          if (onProgress) {
            onProgress(i + 1, slideCount, imageText);
          }
        }
      }

      return fullText;
    } catch (error) {
      console.error("Error in PPTX OCR extraction:", error);
      await this.tesseractService.cleanup();
      throw new Error("Failed to perform OCR on PPTX", { cause: error });
    } finally {
      await this.tesseractService.cleanup();
    }
  }

  /**
   * Extract text from slide images using OCR
   * @param zip - JSZip instance
   * @param slideContent - Slide XML content
   * @param slideFile - Slide file path
   * @returns Extracted text from images
   */
  private async extractTextFromSlideImages(
    zip: JSZip,
    slideContent: string,
    slideFile: string,
  ): Promise<string> {
    // Find image references in the slide
    const imageMatches = slideContent.match(/<a:blip[^>]*r:embed="([^"]+)"/g);

    if (!imageMatches) {
      return ""; // No images found
    }

    let slideText = "";

    // Extract slide number from file path
    const slideNumberMatch = slideFile.match(/slide(\d+)\.xml/);
    const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) : 1;

    // Find the corresponding image files
    const imageRelations = slideContent.match(
      /<Relationship[^>]*Target="([^"]+)"/g,
    );

    if (imageRelations) {
      for (const relation of imageRelations) {
        const targetMatch = relation.match(/Target="([^"]+)"/);
        if (targetMatch) {
          const imagePath = targetMatch[1];
          const fullImagePath = `ppt/media/${imagePath}`;

          try {
            const imageFile = zip.file(fullImagePath);
            if (imageFile) {
              const imageData = await imageFile.async("uint8array");

              // Convert to base64 for Tesseract
              const imageArray = new Uint8Array(imageData);
              const imageBlob = new Blob([imageArray], {
                type: "image/png",
              });
              const imageUrl = URL.createObjectURL(imageBlob);

              // Perform OCR
              const ocrText = await this.tesseractService.recognize(imageUrl);
              slideText += ocrText + " ";

              // Clean up
              URL.revokeObjectURL(imageUrl);
            }
          } catch (error) {
            console.warn(
              `Failed to process image ${fullImagePath} in slide ${slideNumber}:`,
              error,
            );
          }
        }
      }
    }

    return slideText.trim();
  }

  /**
   * Analyze PPTX text quality
   * @param file - PPTX file as ArrayBuffer
   * @returns Document analysis result
   */
  async analyzePPTXTextQuality(file: ArrayBuffer): Promise<{
    analysis: unknown;
    isScanned: boolean;
  }> {
    const { normalText, slideCount } = await this.extractTextNormal(file);
    const analysis = analyzeDocumentTextQuality(normalText, slideCount);
    const isScanned = detectScannedDocument(normalText, slideCount);

    return { analysis, isScanned };
  }
}

/**
 * Singleton instance of PPTXOCRService
 */
let pptxOCRServiceInstance: PPTXOCRService | null = null;

export function getPPTXOCRService(): PPTXOCRService {
  if (!pptxOCRServiceInstance) {
    pptxOCRServiceInstance = new PPTXOCRService();
  }
  return pptxOCRServiceInstance;
}
