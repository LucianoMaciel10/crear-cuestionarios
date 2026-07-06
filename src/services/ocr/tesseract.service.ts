// src/services/ocr/tesseract.service.ts
import { createWorker, type Worker, type RecognizeResult } from "tesseract.js";

/**
 * Tesseract.js OCR Service
 * Provides OCR functionality using Tesseract.js
 */
export class TesseractService {
  private worker: Worker | null = null;
  private isInitialized = false;

  /**
   * Initialize the Tesseract worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.worker = await createWorker("eng", undefined, {
        logger: (m: unknown) => {
          // Suppress logs in production, can be enabled for debugging
          if (import.meta.env.DEV) {
            // Type assertion for logger message
            const loggerMsg = m as { status?: string; progress?: number };
            console.log(
              "Tesseract:",
              loggerMsg.status,
              loggerMsg.progress
                ? `${Math.round(loggerMsg.progress * 100)}%`
                : "",
            );
          }
        },
      });

      // Initialize the worker
      await this.worker.load();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Tesseract worker:", error);
      await this.cleanup();
      throw new Error("OCR initialization failed", { cause: error });
    }
  }

  /**
   * Perform OCR on an image
   * @param imageData - Image data (ArrayBuffer, Blob, or URL)
   * @returns Extracted text
   */
  async recognize(imageData: ArrayBuffer | Blob | string): Promise<string> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error("Tesseract worker not initialized");
    }

    try {
      // Convert ArrayBuffer to Blob if needed
      let imageToProcess: string | Blob;
      if (imageData instanceof ArrayBuffer) {
        imageToProcess = new Blob([imageData], { type: "image/png" });
      } else {
        imageToProcess = imageData;
      }

      const result: RecognizeResult =
        await this.worker.recognize(imageToProcess);
      return result.data.text;
    } catch (error) {
      console.error("OCR recognition failed:", error);
      throw new Error("OCR recognition failed", { cause: error });
    }
  }

  /**
   * Perform OCR on multiple images (pages)
   * @param imageDataArray - Array of image data
   * @param onProgress - Optional progress callback
   * @returns Array of extracted text for each image
   */
  async recognizeBatch(
    imageDataArray: (ArrayBuffer | Blob | string)[],
    onProgress?: (current: number, total: number, text: string) => void,
  ): Promise<string[]> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error("Tesseract worker not initialized");
    }

    const results: string[] = [];

    for (let i = 0; i < imageDataArray.length; i++) {
      try {
        // Convert ArrayBuffer to Blob if needed
        let imageToProcess: string | Blob;
        const item = imageDataArray[i];
        if (item instanceof ArrayBuffer) {
          imageToProcess = new Blob([item], { type: "image/png" });
        } else {
          imageToProcess = item;
        }
        const result = await this.worker.recognize(imageToProcess);
        results.push(result.data.text);

        if (onProgress) {
          onProgress(i + 1, imageDataArray.length, result.data.text);
        }
      } catch (error) {
        console.error(`OCR failed for image ${i + 1}:`, error);
        results.push("");
      }
    }

    return results;
  }

  /**
   * Clean up the Tesseract worker
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (error) {
        console.error("Error terminating Tesseract worker:", error);
      }
      this.worker = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if Tesseract is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }
}

/**
 * Singleton instance of TesseractService
 */
let tesseractServiceInstance: TesseractService | null = null;

export function getTesseractService(): TesseractService {
  if (!tesseractServiceInstance) {
    tesseractServiceInstance = new TesseractService();
  }
  return tesseractServiceInstance;
}
