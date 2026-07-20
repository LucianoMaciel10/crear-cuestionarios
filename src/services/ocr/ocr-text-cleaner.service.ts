// src/services/ocr/ocr-text-cleaner.service.ts

/**
 * OCR Text Cleaner Service
 * Provides text cleaning and normalization for OCR output
 * Handles common OCR errors, noise removal, and text reconstruction
 */

export class OCRTextCleanerService {
  /**
   * Main cleaning function - applies all cleaning steps
   * @param text - Raw OCR text to clean
   * @returns Cleaned and normalized text
   */
  clean(text: string): string {
    if (!text || typeof text !== "string") {
      return "";
    }

    let cleaned = text;

    // Apply cleaning steps in order
    cleaned = this.removeExcessiveWhitespace(cleaned);
    cleaned = this.normalizeUnicode(cleaned);
    cleaned = this.fixCommonOCRErrors(cleaned);
    cleaned = this.reconstructBrokenWords(cleaned);
    cleaned = this.removeNoiseLines(cleaned);
    cleaned = this.normalizePunctuation(cleaned);
    cleaned = this.trimAndClean(cleaned);

    return cleaned;
  }

  /**
   * Remove excessive whitespace and normalize spaces
   * @param text - Text to process
   * @returns Text with normalized whitespace
   */
  private removeExcessiveWhitespace(text: string): string {
    // Replace multiple spaces with single space
    // Replace tabs and newlines with spaces
    // Trim leading/trailing whitespace
    return text
      .replace(/\s+/g, " ")
      .replace(/[\t\n\r]/g, " ")
      .trim();
  }

  /**
   * Normalize Unicode characters
   * @param text - Text to process
   * @returns Text with normalized Unicode
   */
  private normalizeUnicode(text: string): string {
    // Normalize to NFC form (composed characters)
    // This handles accented characters properly
    return text.normalize("NFC");
  }

  /**
   * Fix common OCR errors
   * @param text - Text to process
   * @returns Text with common OCR errors corrected
   */
  private fixCommonOCRErrors(text: string): string {
    // Common OCR error mappings
    const errorMappings: Record<string, string> = {
      // Common character substitutions
      "6": "ó",
      "0": "o",
      "1": "l",
      I: "l",
      "|": "l",
      "5": "s",
      $: "s",
      "8": "b",
      "@": "a",
      "#": "",
      "*": "",
      "…": "...",
      "–": "-",
      "—": "-",
      "“": '"',
      "”": '"',
      "‘": "'",
      "’": "'",
      "  ": " ", // Double spaces
    };

    let corrected = text;
    for (const [error, correction] of Object.entries(errorMappings)) {
      corrected = corrected.split(error).join(correction);
    }

    return corrected;
  }

  /**
   * Reconstruct broken words (especially hyphenated words at line breaks)
   * @param text - Text to process
   * @returns Text with reconstructed words
   */
  private reconstructBrokenWords(text: string): string {
    // Handle hyphenated words at line breaks
    // Pattern: word- + word (with possible whitespace)
    const hyphenPattern = /(\w+)-\s*(\w+)/g;
    let reconstructed = text.replace(hyphenPattern, "$1$2");

    // Handle common Spanish word reconstructions
    const reconstructions: Record<string, string> = {
      "probabili-": "probabili",
      "ejecu-": "ejecu",
      "organiza-": "organiza",
      "desarro-": "desarro",
      "implemen-": "implemen",
      "aplica-": "aplica",
      "descrip-": "descrip",
      "experi-": "experi",
      "informaci-": "informaci",
      "comuni-": "comuni",
    };

    for (const [broken, fixed] of Object.entries(reconstructions)) {
      reconstructed = reconstructed.replace(
        new RegExp(broken + "\\s*(\\w+)", "g"),
        fixed + "$1",
      );
    }

    return reconstructed;
  }

  /**
   * Remove noise lines (lines with mostly symbols, numbers, or very short)
   * @param text - Text to process
   * @returns Text with noise lines removed
   */
  private removeNoiseLines(text: string): string {
    const lines = text.split("\n");
    const filteredLines = lines.filter((line) => {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) return false;

      // Remove lines that are mostly symbols
      const symbolCount = (trimmed.match(/[^\w\s]/g) || []).length;
      const symbolPercentage = symbolCount / trimmed.length;
      if (symbolPercentage > 0.4) return false;

      // Remove lines that are mostly numbers
      const numberCount = (trimmed.match(/\d/g) || []).length;
      const numberPercentage = numberCount / trimmed.length;
      if (numberPercentage > 0.5) return false;

      // Remove very short lines (less than 3 useful characters)
      const usefulChars = trimmed.replace(/[^\w]/g, "").length;
      if (usefulChars < 3) return false;

      // Remove lines with repeated sequences (OCR artifacts)
      if (this.hasRepeatedSequences(trimmed)) return false;

      return true;
    });

    return filteredLines.join("\n");
  }

  /**
   * Check if text has repeated sequences (common OCR artifact)
   * @param text - Text to check
   * @returns true if repeated sequences detected
   */
  private hasRepeatedSequences(text: string): boolean {
    // Check for repeated sequences of 3+ characters
    for (let i = 0; i < text.length - 5; i++) {
      const sequence = text.substr(i, 3);
      const rest = text.substr(i + 3);
      if (rest.includes(sequence)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Normalize punctuation
   * @param text - Text to process
   * @returns Text with normalized punctuation
   */
  private normalizePunctuation(text: string): string {
    // Remove spaces before punctuation
    return text
      .replace(/\s+([.,;:!?])/g, "$1")
      .replace(/\s+(")/g, "$1")
      .replace(/(\w)([.,;:!?])/g, "$1$2")
      .trim();
  }

  /**
   * Final trim and cleaning
   * @param text - Text to process
   * @returns Final cleaned text
   */
  private trimAndClean(text: string): string {
    // Remove control characters by filtering
    let result = text.trim();
    result = result.replace(/\s{2,}/g, " ");

    // Remove control characters manually
    for (let i = 0; i < 32; i++) {
      const char = String.fromCharCode(i);
      result = result.split(char).join("");
    }

    return result;
  }

  /**
   * Validate if a concept is valid
   * @param concept - Concept to validate
   * @returns true if concept is valid
   */
  isValidConcept(concept: string): boolean {
    if (!concept || typeof concept !== "string") {
      return false;
    }

    const trimmed = concept.trim();

    // Minimum length
    if (trimmed.length < 3) return false;

    // Maximum length
    if (trimmed.length > 60) return false;

    // Only numbers
    if (/^\d+$/.test(trimmed)) return false;

    // Stopwords (basic list)
    const stopwords = [
      "el",
      "la",
      "los",
      "las",
      "un",
      "una",
      "es",
      "son",
      "que",
      "y",
      "o",
      "en",
      "de",
      "para",
      "a",
      "con",
      "por",
      "como",
      "pero",
      "más",
      "cuando",
      "donde",
      "mientras",
    ];
    if (stopwords.includes(trimmed.toLowerCase())) return false;

    // Too many non-alphabetic characters
    const nonAlpha = (trimmed.match(/[^\w\s]/g) || []).length;
    const nonAlphaPercentage = nonAlpha / trimmed.length;
    if (nonAlphaPercentage > 0.3) return false;

    // Repeated sequences (OCR artifacts)
    if (this.hasRepeatedSequences(trimmed)) return false;

    // Minimum vowels (except for valid acronyms)
    const vowels = (trimmed.match(/[aeiouáéíóúü]/gi) || []).length;
    if (vowels < 2 && !this.isValidAcronym(trimmed)) return false;

    // Too common isolated words
    const commonWords = [
      "esto",
      "eso",
      "aqui",
      "alli",
      "asi",
      "si",
      "no",
      "ya",
      "ahora",
      "luego",
    ];
    if (commonWords.includes(trimmed.toLowerCase())) return false;

    return true;
  }

  /**
   * Check if text is a valid acronym
   * @param text - Text to check
   * @returns true if valid acronym
   */
  private isValidAcronym(text: string): boolean {
    // Acronyms are typically 2-6 uppercase letters
    return /^[A-Z]{2,6}$/.test(text);
  }

  /**
   * Validate KnowledgeNode content
   * @param content - KnowledgeNode content to validate
   * @returns true if content is valid
   */
  isValidKnowledgeNodeContent(content: string): boolean {
    if (!content || typeof content !== "string") {
      return false;
    }

    const trimmed = content.trim();

    // Minimum length
    if (trimmed.length < 10) return false;

    // Only numbers or symbols
    if (/^[^\w\s]+$/.test(trimmed)) return false;

    // OCR corruption patterns
    if (this.hasOCRCorruptionPatterns(trimmed)) return false;

    return true;
  }

  /**
   * Check for OCR corruption patterns
   * @param text - Text to check
   * @returns true if OCR corruption detected
   */
  private hasOCRCorruptionPatterns(text: string): boolean {
    // Patterns that indicate OCR corruption
    const corruptionPatterns = [
      /[^\w\s]{5,}/, // Too many consecutive symbols
      /\d{10,}/, // Long sequences of numbers
      /[A-Z]{10,}/, // Long sequences of uppercase (unless acronyms)
      /\s{5,}/, // Too many spaces
    ];

    return corruptionPatterns.some((pattern) => pattern.test(text));
  }
}

/**
 * Singleton instance
 */
let ocrTextCleanerInstance: OCRTextCleanerService | null = null;

export function getOCRTextCleaner(): OCRTextCleanerService {
  if (!ocrTextCleanerInstance) {
    ocrTextCleanerInstance = new OCRTextCleanerService();
  }
  return ocrTextCleanerInstance;
}
