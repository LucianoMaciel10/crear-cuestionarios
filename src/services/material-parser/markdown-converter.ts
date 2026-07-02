// src/services/material-parser/markdown-converter.ts

/**
 * Convierte texto plano a Markdown con formato básico
 * @param text - Texto plano a convertir
 * @returns Texto en formato Markdown
 */
export function convertToMarkdown(text: string): string {
  // Normalizar saltos de línea
  let markdown = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Convertir títulos (líneas que terminan en : o son cortas y en mayúsculas)
  markdown = markdown.replace(/^(.+?):\s*$/gm, (_, title) => {
    if (title.trim().length < 50 && title === title.toUpperCase()) {
      return `\n# ${title.trim()}\n\n`;
    }
    return `\n## ${title.trim()}\n\n`;
  });

  // Convertir listas (líneas que empiezan con - o *)
  markdown = markdown.replace(/^\s*([-*])\s+(.+?)\s*$/gm, (_, item) => {
    return `- ${item.trim()}`;
  });

  // Convertir párrafos (múltiples líneas con texto)
  markdown = markdown.replace(
    /([\w\W]+?)(?=\n\s*\n|\n#|\n##|\n-|$)/g,
    (paragraph) => {
      const trimmed = paragraph.trim();
      if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("-")) {
        return trimmed + "\n\n";
      }
      return paragraph;
    },
  );

  // Limpiar múltiples saltos de línea
  markdown = markdown.replace(/\n{3,}/g, "\n\n");

  return markdown.trim();
}

/**
 * Convierte el resultado de parsing a Markdown estructurado
 * @param text - Texto extraído de PDF/DOCX
 * @param fileName - Nombre del archivo original
 * @returns Markdown con metadata
 */
export function createStructuredMarkdown(
  text: string,
  fileName: string,
): string {
  const markdownContent = convertToMarkdown(text);

  return `---
title: ${fileName}
source: ${new Date().toISOString()}
type: processed
---

${markdownContent}`;
}
