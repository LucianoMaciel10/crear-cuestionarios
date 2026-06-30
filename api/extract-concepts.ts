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
      res.status(500).json({
        error: "MISTRAL_API_KEY no configurada en el servidor.",
      });
      return;
    }

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
              Eres un extractor de conceptos y definiciones académicas. 
              Analiza el texto proporcionado y extrae conceptos clave junto con sus definiciones. 
              Responde EXCLUSIVAMENTE con un JSON válido, sin texto adicional ni bloques de código markdown. 
              Formato esperado: 
              { 
                "conceptos": string[], 
                "definiciones": { "concepto": string, "definicion": string }[] 
              }
            `,
          },
          {
            role: "user",
            content: truncatedText,
          },
        ],
      }),
    });

    // Verificar respuesta de Mistral
    if (!response.ok) {
      res.status(502).json({ error: "Error al llamar a la API de Mistral." });
      return;
    }

    const data = await response.json();

    // Validar estructura de la respuesta
    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      res
        .status(502)
        .json({ error: "Respuesta inválida de la API de Mistral." });
      return;
    }

    // Parsear el contenido como JSON
    let result: unknown;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch {
      res
        .status(502)
        .json({ error: "La respuesta de Mistral no es un JSON válido." });
      return;
    }

    // Validar estructura del JSON
    if (
      typeof result !== "object" ||
      result === null ||
      !("conceptos" in result) ||
      !("definiciones" in result) ||
      !Array.isArray(result.conceptos) ||
      !Array.isArray(result.definiciones)
    ) {
      res
        .status(502)
        .json({ error: "Estructura de respuesta inválida de Mistral." });
      return;
    }

    // Validar tipos de los elementos
    const conceptos = result.conceptos as unknown[];
    const definiciones = result.definiciones as unknown[];

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
      )
    ) {
      res.status(502).json({
        error: "Tipos de datos inválidos en la respuesta de Mistral.",
      });
      return;
    }

    // Responder con éxito
    res.status(200).json({
      conceptos,
      definiciones,
      relaciones: [],
    });
  } catch (error) {
    // Manejar errores inesperados
    console.error("Error en extract-concepts:", error);
    res
      .status(502)
      .json({ error: "Error inesperado al procesar la solicitud." });
  }
}
