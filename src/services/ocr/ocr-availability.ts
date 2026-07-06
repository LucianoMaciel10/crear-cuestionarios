// src/services/ocr/ocr-availability.ts

/**
 * Checks if Tesseract.js is available and can be loaded
 * @returns Promise<boolean> - true if Tesseract.js is available
 */
export async function checkTesseractAvailability(): Promise<boolean> {
  try {
    // Try to import Tesseract.js dynamically
    const tesseract = await import("tesseract.js");
    
    // Check if the required functions are available
    if (tesseract.createWorker && typeof tesseract.createWorker === "function") {
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn("Tesseract.js is not available:", error);
    return false;
  }
}

/**
 * Gets a user-friendly message about OCR availability
 * @returns Promise<string> - availability message
 */
export async function getOCRAvailabilityMessage(): Promise<string> {
  const available = await checkTesseractAvailability();
  
  if (available) {
    return "OCR disponible: Tesseract.js está listo para documentos escaneados";
  } else {
    return "OCR no disponible: Los documentos escaneados no podrán ser procesados";
  }
}