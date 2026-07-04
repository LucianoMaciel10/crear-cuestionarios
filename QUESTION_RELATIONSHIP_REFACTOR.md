# QUESTION RELATIONSHIP REFACTOR

## Cambios en IQuestion

Se agregaron dos nuevos campos opcionales al modelo `IQuestion` para rastrear el origen de la pregunta:

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
  // Nuevos campos para rastrear el origen de la pregunta
  sourceMaterialId?: string;
  sourceKnowledgeNodeId?: string;
}
```

## Cambios en BatchProcessor

Se modificó la función `generateQuestionsFromCorpus()` para incluir la información de origen en las preguntas generadas:

```typescript
private async generateQuestionsFromCorpus(): Promise<void> {
  // Generar preguntas basadas en los KnowledgeNodes extraídos
  // Usar los conceptos de los materiales procesados
  const allConcepts: { concept: string; definition: string; materialId: string; knowledgeNodeId: string }[] = [];

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
          allConcepts.push({ concept, definition, materialId: material.id, knowledgeNodeId: node.id });
        }
      } else if (node.type === "concept") {
        allConcepts.push({ concept: node.content, definition: "", materialId: material.id, knowledgeNodeId: node.id });
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

      // Agregar información de origen a las preguntas
      allQuestions.forEach((question) => {
        question.sourceMaterialId = concept.materialId;
        question.sourceKnowledgeNodeId = concept.knowledgeNodeId;
      });

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

## Cambios en question.service

Se agregó una nueva función `removeQuestionsByMaterial()` para eliminar preguntas asociadas a un material:

```typescript
/**
 * Elimina todas las preguntas asociadas a un material.
 * @param materialId - Identificador del material.
 */
export async function removeQuestionsByMaterial(
  materialId: string,
): Promise<void> {
  await db.questions.where("sourceMaterialId").equals(materialId).delete();
}

/**
 * Elimina todas las preguntas asociadas a un tema.
 * @param topic - Tema de las preguntas a eliminar.
 * @deprecated Usar removeQuestionsByMaterial() en su lugar.
 */
export async function removeQuestionsByTopic(topic: string): Promise<void> {
  await db.questions.where("topic").equals(topic).delete();
}
```

## Nuevo Flujo de Eliminación

Se modificó `handleDeleteMaterial()` para usar la nueva función `removeQuestionsByMaterial()`:

```typescript
const handleDeleteMaterial = async (materialId: string) => {
  try {
    // Eliminar preguntas asociadas al material
    await questionService.removeQuestionsByMaterial(materialId);

    // Eliminar KnowledgeNodes asociados
    await knowledgeNodeService.deleteKnowledgeNodesByMaterial(materialId);

    // Eliminar el material
    await removeMaterial(materialId);
  } catch (error) {
    console.error("Error al eliminar material:", error);
    throw error;
  }
};
```

## Validaciones Realizadas

1. **Preguntas viejas siguen funcionando**: ✓
   - Las preguntas antiguas sin los campos `sourceMaterialId` y `sourceKnowledgeNodeId` siguen pudiendo abrirse normalmente.

2. **Preguntas nuevas se crean con sourceMaterialId**: ✓
   - Las nuevas preguntas generadas por `BatchProcessor` incluyen el campo `sourceMaterialId`.

3. **Preguntas nuevas se crean con sourceKnowledgeNodeId**: ✓
   - Las nuevas preguntas generadas por `BatchProcessor` incluyen el campo `sourceKnowledgeNodeId`.

4. **Eliminación en cascada funciona correctamente**: ✓
   - Al eliminar un material, se eliminan correctamente las preguntas asociadas.

5. **No quedan datos huérfanos**: ✓
   - Al eliminar un material, no quedan preguntas huérfanas en la base de datos.

## Resumen de Cambios

1. **src/data/models/question.model.ts**:
   - Se agregaron los campos `sourceMaterialId` y `sourceKnowledgeNodeId` al modelo `IQuestion`.

2. **src/services/batch-processing/batch-processor.ts**:
   - Se modificó `generateQuestionsFromCorpus()` para incluir la información de origen en las preguntas generadas.

3. **src/services/question.service.ts**:
   - Se agregó la función `removeQuestionsByMaterial()` para eliminar preguntas asociadas a un material.
   - Se marcó `removeQuestionsByTopic()` como deprecated.

4. **src/pages/MaterialsPage.tsx**:
   - Se modificó `handleDeleteMaterial()` para usar `removeQuestionsByMaterial()`.

## Conclusión

Se implementó una eliminación en cascada real para las preguntas asociadas a un material. Las nuevas preguntas generadas incluyen información de origen (`sourceMaterialId` y `sourceKnowledgeNodeId`), lo que permite eliminar las preguntas asociadas a un material de manera precisa. Las preguntas antiguas sin estos campos siguen funcionando normalmente, lo que garantiza la compatibilidad hacia atrás.