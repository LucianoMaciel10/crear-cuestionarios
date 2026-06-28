// src/services/material-parser/text-parser.ts

/**
 * Extrae texto plano a partir de un archivo o contenido bruto.
 * @param input - Contenido original (string o ArrayBuffer).
 * @returns El texto plano extraído.
 */
export async function parseText(input: string | ArrayBuffer): Promise<string> {
  if (typeof input === 'string') {
    return input;
  }

  const decoder = new TextDecoder('utf-8');
  return decoder.decode(input);
}
