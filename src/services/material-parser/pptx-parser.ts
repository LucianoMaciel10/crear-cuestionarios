// src/services/material-parser/pptx-parser.ts
import JSZip from "jszip";

/**
 * Extrae texto de un archivo PPTX.
 * @param file - Archivo PPTX como ArrayBuffer.
 * @returns Texto extraído del PPTX.
 * @throws Error si falla el parseo del PPTX.
 */
export async function parsePPTX(file: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(file);
    let text = "";

    // Procesar cada diapositiva
    const slideFiles = Object.keys(zip.files).filter((fileName) =>
      fileName.startsWith("ppt/slides/") && fileName.endsWith(".xml")
    );

    for (const slideFile of slideFiles) {
      const slideContent = await zip.file(slideFile)?.async("text");
      if (slideContent) {
        // Extraer texto de la diapositiva
        const slideText = extractTextFromSlide(slideContent);
        text += slideText + "\n\n";
      }
    }

    return text.trim();
  } catch (error) {
    const err = new Error("Failed to parse PPTX file");
    console.error("Error parsing PPTX:", { error });
    throw err;
  }
}

/**
 * Extrae texto de contenido de diapositiva XML
 */
function extractTextFromSlide(xmlContent: string): string {
  // Extraer texto de elementos <a:t> (textos)
  const textMatches = xmlContent.match(/<a:t>(.*?)<\/a:t>/g);
  
  if (!textMatches) return "";
  
  let slideText = "";
  for (const match of textMatches) {
    // Extraer contenido entre <a:t> y </a:t>
    const textContent = match.replace(/<a:t>/g, "").replace(/<\/a:t>/g, "");
    slideText += textContent + " ";
  }
  
  return slideText.trim();
}