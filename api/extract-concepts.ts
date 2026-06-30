import type { VercelRequest, VercelResponse } from "@vercel/node";

// Constante para el modelo de Mistral
const MISTRAL_MODEL = "devstral-medium-2507";

// URL de la API de Mistral
export const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    // Verificar método HTTP
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido. Se requiere POST." });
      return;
    }

    // Validar body
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      res
        .status(400)
        .json({ error: "El campo 'text' es requerido y debe ser un string." });
      return;
    }

    // Truncar texto si es demasiado largo
    const truncatedText = text.substring(0, 20000);

    // Validar API key
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.error("MISTRAL_API_KEY no configurada");
      res.status(500).json({
        error: "MISTRAL_API_KEY no configurada en el servidor.",
        solution:
          "Configura la variable de entorno MISTRAL_API_KEY en Vercel o en tu archivo .env.local",
        docs: "https://vercel.com/docs/environment-variables",
      });
      return;
    }

    console.log("Llamando a Mistral API con modelo:", MISTRAL_MODEL);
    console.log("Longitud del texto:", truncatedText.length);

    // Llamar a la API de Mistral
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          {
            role: "system",
            content: `
              Eres un extractor avanzado de conceptos académicos. 
              REGLAS ESTRICTAS:
              1. NO uses backticks o triple comillas
              2. NO uses formato Markdown
              3. Responde SOLO con JSON válido, sin texto adicional
              4. El JSON debe ser parseable directamente por JSON.parse()
              
              Analiza el texto y extrae:
              - Conceptos clave
              - Sus definiciones precisas
              - Relaciones entre conceptos (si existen)
              
              Formato EXACTO requerido:
              {
                "conceptos": ["concepto1", "concepto2"],
                "definiciones": [
                  {"concepto": "concepto1", "definicion": "definición..."}
                ],
                "relaciones": [
                  {"concepto1": "A", "concepto2": "B", "tipo": "relación", "descripcion": "descripción..."}
                ]
              }

              Para relaciones: identifica cómo se relacionan los conceptos (ej: "es un tipo de", "se usa en", "incluye", etc.)
              Si no hay relaciones claras, devuelve: "relaciones": []
              
              IMPORTANTE: Tu respuesta DEBE ser parseable por JSON.parse() sin modificaciones.
            `,
          },
          {
            role: "user",
            content: `Texto a analizar: ${truncatedText}`,
          },
        ],
      }),
    });

    console.log("Respuesta de Mistral - Status:", response.status);

    // Verificar respuesta de Mistral
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de Mistral API:", response.status, errorText);
      res.status(502).json({
        error: "Error al llamar a la API de Mistral.",
        status: response.status,
        details: errorText,
      });
      return;
    }

    const data = await response.json();
    console.log("Respuesta de Mistral:", JSON.stringify(data, null, 2));

    // Validar estructura de la respuesta
    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      console.error("Respuesta inválida de Mistral - Estructura:", data);
      res.status(502).json({
        error: "Respuesta inválida de la API de Mistral.",
        details: "Estructura de respuesta inesperada",
        received: data,
      });
      return;
    }

    // Parsear el contenido como JSON
    let result: unknown;
    try {
      let content = data.choices[0].message.content;
      console.log("Contenido crudo de Mistral:", content);

      // Intentar limpiar si Mistral devolvió Markdown
      if (content.startsWith("```")) {
        // Eliminar backticks y triple comillas si existen
        content = content.replace(/```(json)?/g, "").trim();
      }

      result = JSON.parse(content);
    } catch (parseError) {
      console.error("Error al parsear JSON de Mistral:", parseError);
      res.status(502).json({
        error: "La respuesta de Mistral no es un JSON válido.",
        details:
          parseError instanceof Error
            ? parseError.message
            : "Error desconocido",
        suggestion:
          "Mistral puede estar devolviendo Markdown. Revisar el prompt.",
      });
      return;
    }

    // Validar estructura del JSON
    if (
      typeof result !== "object" ||
      result === null ||
      !("conceptos" in result) ||
      !("definiciones" in result) ||
      !("relaciones" in result) ||
      !Array.isArray(result.conceptos) ||
      !Array.isArray(result.definiciones) ||
      !Array.isArray(result.relaciones)
    ) {
      console.error("Estructura de respuesta inválida:", result);
      res.status(502).json({
        error: "Estructura de respuesta inválida de Mistral.",
        expected: "{ conceptos: string[], definiciones: [], relaciones: [] }",
        received: result,
      });
      return;
    }

    // Validar tipos de los elementos
    const conceptos = result.conceptos as unknown[];
    const definiciones = result.definiciones as unknown[];
    const relaciones = result.relaciones as unknown[]; // New line for 'relaciones'

    if (
      !conceptos.every((c) => typeof c === "string") ||
      !definiciones.every(
        (d) =>
          typeof d === "object" &&
          d !== null &&
          "concepto" in d &&
          "definicion" in d &&
          typeof d.concepto === "string" &&
          typeof d.definicion === "string",
      ) ||
      !relaciones.every(
        // New check for 'relaciones' array elements
        (r) =>
          typeof r === "object" &&
          r !== null &&
          "concepto1" in r &&
          "concepto2" in r &&
          "tipo" in r &&
          "descripcion" in r &&
          typeof r.concepto1 === "string" &&
          typeof r.concepto2 === "string" &&
          typeof r.tipo === "string" &&
          typeof r.descripcion === "string",
      )
    ) {
      console.error("Tipos de datos inválidos:", {
        conceptos,
        definiciones,
        relaciones,
      });
      res.status(502).json({
        error: "Tipos de datos inválidos en la respuesta de Mistral.",
        details:
          "Conceptos, definiciones y relaciones tienen tipos incorrectos",
      });
      return;
    }

    console.log("Extracción exitosa - Conceptos:", conceptos);
    console.log("Extracción exitosa - Definiciones:", definiciones.length);
    console.log("Extracción exitosa - Relaciones:", relaciones.length); // New line

    // Responder con éxito
    res.status(200).json({
      conceptos,
      definiciones,
      relaciones, // Changed from `relaciones: []` to `relaciones`
    });
  } catch (error) {
    // Manejar errores inesperados
    console.error("Error inesperado en extract-concepts:", error);
    res.status(502).json({
      error: "Error inesperado al procesar la solicitud.",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
