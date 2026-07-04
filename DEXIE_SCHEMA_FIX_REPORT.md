# DEXIE SCHEMA FIX REPORT

## Versión Anterior

La versión anterior de la base de datos era la versión 10, que incluía los siguientes stores:

```typescript
this.version(10).stores({
  materiales: "id, nombre, tipo, fechaCarga, idMateria, processingStatus",
  materias: "id, nombre",
  etiquetas: "id, nombre",
  questions: "id, topic, difficulty, idMateria",
  quizAttempts: "id, questionId, idMateria, topic, answeredAt",
  knowledgeNodes:
    "id, type, content, sourceMaterialId, createdAt, subjectId",
});
```

## Versión Nueva

Se creó la versión 11 de la base de datos para agregar índices a los nuevos campos `sourceMaterialId` y `sourceKnowledgeNodeId` en el store `questions`:

```typescript
this.version(11).stores({
  materiales: "id, nombre, tipo, fechaCarga, idMateria, processingStatus",
  materias: "id, nombre",
  etiquetas: "id, nombre",
  questions: "id, topic, difficulty, idMateria, sourceMaterialId, sourceKnowledgeNodeId",
  quizAttempts: "id, questionId, idMateria, topic, answeredAt",
  knowledgeNodes:
    "id, type, content, sourceMaterialId, createdAt, subjectId",
});
```

## Índices Agregados

Se agregaron los siguientes índices al store `questions`:

1. **sourceMaterialId**: Para permitir consultas eficientes por el identificador del material de origen.
2. **sourceKnowledgeNodeId**: Para permitir consultas eficientes por el identificador del KnowledgeNode de origen.

## Migración Realizada

La migración se realizó automáticamente al abrir la base de datos. Dexie.js se encargó de actualizar el esquema de la base de datos para incluir los nuevos índices.

## Validación de Eliminación

Se verificó que la eliminación en cascada funciona correctamente:

1. **Subir un material**: ✓
   - El material se sube correctamente.
   - Se generan preguntas con los campos `sourceMaterialId` y `sourceKnowledgeNodeId`.

2. **Generar preguntas**: ✓
   - Las preguntas se generan correctamente.
   - Los campos `sourceMaterialId` y `sourceKnowledgeNodeId` se persisten correctamente.

3. **Eliminar el material**: ✓
   - Se eliminan correctamente las preguntas asociadas al material.
   - Se eliminan correctamente los KnowledgeNodes asociados al material.
   - Se elimina correctamente el material.

4. **Verificar que no queda ningún dato huérfano**: ✓
   - No quedan preguntas huérfanas en la base de datos.
   - No quedan KnowledgeNodes huérfanos en la base de datos.
   - No quedan materiales huérfanos en la base de datos.

## Resumen de Cambios

1. **src/data/db/dexie-db.ts**:
   - Se creó la versión 11 de la base de datos.
   - Se agregaron índices para `sourceMaterialId` y `sourceKnowledgeNodeId` en el store `questions`.

## Conclusión

Se corrigió el error de esquema de IndexedDB al agregar los índices necesarios para los nuevos campos `sourceMaterialId` y `sourceKnowledgeNodeId` en el store `questions`. Esto permite que la función `removeQuestionsByMaterial()` funcione correctamente al usar `where("sourceMaterialId")`. La migración se realizó automáticamente y se verificó que la eliminación en cascada funciona correctamente.