// src/services/ocr/document-detector.service.ts

/**
 * Criteria for detecting scanned documents
 */
export interface ScannedDocumentCriteria {
  // Minimum total characters to consider document has sufficient text
  minTotalChars: number;
  // Minimum average words per page
  minAvgWordsPerPage: number;
  // Maximum percentage of empty pages allowed
  maxEmptyPagePercentage: number;
  // Minimum percentage of pages that must have text
  minTextPagesPercentage: number;
  // Minimum characters per page to consider it non-empty
  minCharsPerPage: number;
}

/**
 * Default criteria for scanned document detection
 */
export const DEFAULT_SCANNED_DOCUMENT_CRITERIA: ScannedDocumentCriteria = {
  minTotalChars: 500, // Less than 500 chars total suggests scanned
  minAvgWordsPerPage: 20, // Less than 20 words per page on average suggests scanned
  maxEmptyPagePercentage: 0.7, // More than 70% empty pages suggests scanned
  minTextPagesPercentage: 0.3, // Less than 30% of pages with text suggests scanned
  minCharsPerPage: 50, // Less than 50 chars per page considered empty
};

/**
 * Page text analysis result
 */
export interface PageAnalysis {
  pageNumber: number;
  charCount: number;
  wordCount: number;
  isEmpty: boolean;
  hasMeaningfulText: boolean;
}

/**
 * Document text quality analysis result
 */
export interface DocumentAnalysisResult {
  totalPages: number;
  totalChars: number;
  totalWords: number;
  emptyPages: number;
  textPages: number;
  avgCharsPerPage: number;
  avgWordsPerPage: number;
  emptyPagePercentage: number;
  textPagePercentage: number;
  pageDetails: PageAnalysis[];
  isScanned: boolean;
  confidence: number; // 0-1 confidence that document is scanned
}

/**
 * Analyzes text content to determine if it's from a scanned document
 * @param textContent - Text content extracted from document
 * @param pageCount - Total number of pages in the document
 * @param criteria - Detection criteria (optional)
 * @returns Analysis result including whether document appears scanned
 */
export function analyzeDocumentTextQuality(
  textContent: string,
  pageCount: number,
  criteria: ScannedDocumentCriteria = DEFAULT_SCANNED_DOCUMENT_CRITERIA,
): DocumentAnalysisResult {
  // Split text by pages (assuming pages are separated by double newlines)
  const pages = textContent.split(/\n{2,}/).filter((page) => page.trim().length > 0);
  
  // If we have fewer pages than expected, the rest are empty
  const actualPageCount = Math.max(pages.length, pageCount);
  const emptyPages = Math.max(0, actualPageCount - pages.length);

  // Analyze each page
  const pageDetails: PageAnalysis[] = [];
  let totalChars = 0;
  let totalWords = 0;
  let textPages = 0;

  for (let i = 0; i < pages.length; i++) {
    const pageText = pages[i];
    const charCount = pageText.length;
    const wordCount = pageText.trim().split(/\s+/).length;
    const isEmpty = charCount < criteria.minCharsPerPage;
    const hasMeaningfulText = wordCount >= criteria.minAvgWordsPerPage / 2;

    if (hasMeaningfulText) {
      textPages++;
    }

    pageDetails.push({
      pageNumber: i + 1,
      charCount,
      wordCount,
      isEmpty,
      hasMeaningfulText,
    });

    totalChars += charCount;
    totalWords += wordCount;
  }

  // Calculate statistics
  const avgCharsPerPage = totalChars / actualPageCount;
  const avgWordsPerPage = totalWords / actualPageCount;
  const emptyPagePercentage = emptyPages / actualPageCount;
  const textPagePercentage = textPages / actualPageCount;

  // Determine if document is scanned based on criteria
  const meetsCharCriteria = totalChars < criteria.minTotalChars;
  const meetsWordCriteria = avgWordsPerPage < criteria.minAvgWordsPerPage;
  const meetsEmptyCriteria = emptyPagePercentage > criteria.maxEmptyPagePercentage;
  const meetsTextPageCriteria = textPagePercentage < criteria.minTextPagesPercentage;

  // Calculate confidence score (0-1)
  let confidence = 0;
  if (meetsCharCriteria) confidence += 0.3;
  if (meetsWordCriteria) confidence += 0.3;
  if (meetsEmptyCriteria) confidence += 0.2;
  if (meetsTextPageCriteria) confidence += 0.2;

  // Document is considered scanned if confidence is high enough
  const isScanned = confidence >= 0.6;

  return {
    totalPages: actualPageCount,
    totalChars,
    totalWords,
    emptyPages,
    textPages,
    avgCharsPerPage,
    avgWordsPerPage,
    emptyPagePercentage,
    textPagePercentage,
    pageDetails,
    isScanned,
    confidence,
  };
}

/**
 * Detects if a document is likely scanned based on extracted text quality
 * @param textContent - Text extracted from document
 * @param pageCount - Number of pages in document
 * @param criteria - Detection criteria (optional)
 * @returns true if document appears to be scanned, false otherwise
 */
export function detectScannedDocument(
  textContent: string,
  pageCount: number,
  criteria: ScannedDocumentCriteria = DEFAULT_SCANNED_DOCUMENT_CRITERIA,
): boolean {
  const analysis = analyzeDocumentTextQuality(textContent, pageCount, criteria);
  return analysis.isScanned;
}