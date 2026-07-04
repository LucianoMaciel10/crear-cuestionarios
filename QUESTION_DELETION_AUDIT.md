# QUESTION DELETION AUDIT

## 1. QuestionModel completo

```typescript
export interface IQuestion {
  id: string;
  type: "boolean" | "multiple-choice" | "short-answer";
  question: string;
  correctAnswer: string | boolean | string[];
  options?: { id: string; text: string }[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  idMateria?: string;
}
```

## 2. Campos de una Question

- `id`: Identificador único de la pregunta.
- `type`: Tipo de pregunta (boolean, multiple-choice, short-answer).
- `question`: Texto de la pregunta.
- `correctAnswer`: Respuesta correcta.
- `options`: Opciones para preguntas de selección múltiple.
- `explanation`: Explicación de la respuesta correcta.
- `difficulty`: Dificultad de la pregunta (easy, medium, hard).
- `topic`: Tema de la pregunta.
- `idMateria`: Identificador de la materia a la que pertenece la pregunta.

## 3. Cómo se crea una Question

Las preguntas se crean en `BatchProcessor.generateQuestionsFromCorpus()` en `src/services/batch-processing/batch-processor.ts`.

## 4. Función que crea las preguntas

```typescript
private async generateQuestionsFromCorpus(): Promise<void> {
  // Generar preguntas basadas en los KnowledgeNodes extraídos
  // Usar los conceptos de los materiales procesados
  const allConcepts: { concept: string; definition: string }[] = [];

  for (const material of this.results.materials) {
    // Obtener KnowledgeNodes para este material
    const knowledgeNodes = await import("../knowledge-node.service").then(
      (service) => service.getKnowledgeNodesByMaterial(material.id),
    );

    // Extraer conceptos y definiciones de los KnowledgeNodes
    for (const node of knowledgeNodes) {
      if (node.type === "definition") {
        const [concept, definition] = node.content.split(": ");
        if (concept && definition) {
          allConcepts.push({ concept, definition });
        }
      } else if (node.type === "concept") {
        allConcepts.push({ concept: node.content, definition: "" });
      }
    }
  }

  // Generar preguntas para cada concepto
  for (let i = 0; i < allConcepts.length; i++) {
    const concept = allConcepts[i];
    const progress = Math.round(((i + 1) / allConcepts.length) * 100);
    this.updateStage("Generación de Preguntas", "processing", progress);

    try {
      // Crear conjunto de conceptos para generación
      const conceptsForQuestions = [concept];

      // Generar preguntas
      const booleanQuestions = generateBooleanQuestions(
        conceptsForQuestions,
        this.options.subjectId,
      );
      const multipleChoiceQuestions = generateMultipleChoiceQuestions(
        conceptsForQuestions,
        this.options.subjectId,
      );
      const allQuestions = [...booleanQuestions, ...multipleChoiceQuestions];

      if (allQuestions.length > 0) {
        await saveQuestions(allQuestions);

        // Asociar preguntas con el material principal
        if (this.results.materials.length > 0) {
          this.results.materials[0].questionIds = (
            this.results.materials[0].questionIds || []
          ).concat(allQuestions.map((q) => q.id));
        }

        this.results.stats.questionsGenerated += allQuestions.length;
      }
    } catch (error) {
      console.error(
        `Error generando preguntas para concepto ${concept.concept}:`,
        error,
      );
      throw new Error(
        `Failed to generate questions for concept ${concept.concept}`,
        { cause: error },
      );
    }
  }
}
```

## 5. Información que recibe de los KnowledgeNodes

Las preguntas reciben los siguientes datos de los KnowledgeNodes:
- `concept`: Concepto extraído del KnowledgeNode.
- `definition`: Definición extraída del KnowledgeNode.

## 6. Campos que relacionan una Question con otros elementos

- **Material**: No hay una relación directa. Las preguntas se relacionan con el `topic`, que es el nombre del material.
- **KnowledgeNode**: No hay una relación directa. Las preguntas se generan a partir de los conceptos y definiciones de los KnowledgeNodes, pero no se guarda una referencia al KnowledgeNode.
- **Corpus**: No hay una relación directa.
- **Tema**: `topic` en `IQuestion`.

## 7. Funciones de eliminación

### removeMaterial()

```typescript
export async function removeMaterial(id: string): Promise<void> {
  await db.materiales.delete(id);
}
```

### deleteKnowledgeNodesByMaterial()

```typescript
export async function deleteKnowledgeNodesByMaterial(
  materialId: string,
): Promise<void> {
  const nodes = await db.knowledgeNodes
    .where("sourceMaterialId")
    .equals(materialId)
    .toArray();
  const nodeIds = nodes.map((node) => node.id);
  await db.knowledgeNodes.bulkDelete(nodeIds);
}
```

### removeQuestionsByTopic()

```typescript
export async function removeQuestionsByTopic(topic: string): Promise<void> {
  await db.questions.where("topic").equals(topic).delete();
}
```

### handleDeleteMaterial()

```typescript
const handleDeleteMaterial = async (materialId: string) => {
  try {
    // Eliminar KnowledgeNodes asociados
    await knowledgeNodeService.deleteKnowledgeNodesByMaterial(materialId);

    // Eliminar preguntas asociadas (por tema, usando el nombre del material)
    const material = materials.find((m) => m.id === materialId);
    if (material) {
      await questionService.removeQuestionsByTopic(material.nombre);
    }

    // Eliminar el material
    await removeMaterial(materialId);
  } catch (error) {
    console.error("Error al eliminar material:", error);
    throw error;
  }
};
```

## 8. Explicación de por qué las preguntas permanecen al eliminar un material

### Causa Raíz

El problema es que las preguntas no están directamente relacionadas con el material. Las preguntas se generan a partir de los KnowledgeNodes asociados a un material, pero no se guarda una referencia directa al material en la pregunta. En su lugar, las preguntas se relacionan con el `topic`, que es el nombre del material.

### Flujo de Eliminación

1. **Eliminar KnowledgeNodes**: `deleteKnowledgeNodesByMaterial(materialId)` elimina los KnowledgeNodes asociados al material.
2. **Eliminar Preguntas**: `removeQuestionsByTopic(material.nombre)` elimina las preguntas asociadas al tema (nombre del material).
3. **Eliminar Material**: `removeMaterial(materialId)` elimina el material.

### Problema

El problema es que `removeQuestionsByTopic(material.nombre)` elimina las preguntas asociadas al tema, pero si el nombre del material no es único o si las preguntas se generaron con un tema diferente, las preguntas no se eliminarán correctamente.

### Solución Propuesta

Para corregir este problema, se debería guardar una referencia directa al material en las preguntas. Esto permitiría eliminar las preguntas asociadas a un material de manera más precisa.

### Código Relevante

```typescript
// Eliminar preguntas asociadas (por tema, usando el nombre del material)
const material = materials.find((m) => m.id === materialId);
if (material) {
  await questionService.removeQuestionsByTopic(material.nombre);
}
```

### Conclusión

El problema es que las preguntas no están directamente relacionadas con el material. Las preguntas se relacionan con el `topic`, que es el nombre del material, pero esto no es suficiente para garantizar que todas las preguntas asociadas a un material se eliminen correctamente. Para corregir este problema, se debería guardar una referencia directa al material en las preguntas.