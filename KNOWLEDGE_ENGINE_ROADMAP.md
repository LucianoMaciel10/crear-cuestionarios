# Roadmap para la Transición al Knowledge Engine

## Objetivo General
Transformar la arquitectura actual centrada en Materiales hacia un modelo donde el Knowledge Engine sea el núcleo del sistema, priorizando el conocimiento extraído y sus relaciones sobre los archivos originales.

## Análisis de la Arquitectura Actual

### Entidades Actuales
- **Material**: Contiene contenido original y procesado (conceptos, definiciones, relaciones)
- **Materia**: Agrupa materiales
- **Pregunta**: Generada a partir de conceptos
- **Flashcard**: Generada a partir de definiciones
- **QuizAttempt**: Registro de respuestas
- **SpacedRepetitionData**: Datos de repetición espaciada

### Problemas Identificados
1. **Material como centro**: El sistema gira alrededor de los archivos cargados
2. **Duplicación de conocimiento**: Conceptos y relaciones están embebidos en materiales
3. **Falta de abstracción**: No existe una entidad independiente para representar el conocimiento
4. **Dificultad para reutilizar**: El conocimiento no puede ser fácilmente compartido entre materias

## Arquitectura Propuesta

### Nuevas Entidades

#### 1. KnowledgeNode (Nodo de Conocimiento)
```typescript
interface IKnowledgeNode {
  id: string;
  type: 'concept' | 'definition' | 'relationship' | 'example';
  content: string;
  sourceMaterialId?: string; // Referencia al material original
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    confidence: number; // Confianza en la extracción (0-1)
    sourceType: 'ai' | 'regex' | 'manual';
  };
}
```

#### 2. KnowledgeGraph (Grafo de Conocimiento)
```typescript
interface IKnowledgeGraph {
  id: string;
  name: string;
  description: string;
  nodes: string[]; // IDs de KnowledgeNodes
  edges: Array<{
    from: string;
    to: string;
    type: string;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. KnowledgeDomain (Dominio de Conocimiento)
```typescript
interface IKnowledgeDomain {
  id: string;
  name: string;
  description: string;
  graphs: string[]; // IDs de KnowledgeGraphs
  createdAt: Date;
  updatedAt: Date;
}
```

### Entidades a Mantener (con modificaciones)

#### Material (Simplificado)
```typescript
interface IMaterial {
  id: string;
  nombre: string;
  tipo: "texto" | "pdf" | "docx" | "txt" | "md";
  contenidoOriginal?: string | ArrayBuffer;
  knowledgeGraphId?: string; // Referencia al grafo generado
  fechaCarga: Date;
  idMateria?: string;
}
```

#### Pregunta (Enriquecida)
```typescript
interface IQuestion {
  id: string;
  type: "boolean" | "multiple-choice" | "short-answer";
  question: string;
  correctAnswer: string | boolean | string[];
  options?: { id: string; text: string }[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  knowledgeNodes: string[]; // Referencias a nodos de conocimiento
  idMateria?: string;
}
```

### Entidades a Eliminar Gradualmente

1. **Flashcard**: Reemplazada por KnowledgeNodes con tipo 'definition'
2. **SpacedRepetitionData**: Integrada en KnowledgeNodes como metadata
3. **Relaciones embebidas**: Migradas a KnowledgeGraph

## Roadmap de Implementación

### Fase 1: Introducción de KnowledgeNode

**Objetivo**: Crear la entidad base para representar unidades de conocimiento

**Archivos nuevos**:
- `src/data/models/knowledge-node.model.ts`
- `src/services/knowledge-node.service.ts`
- `src/data/db/migrations/knowledge-node-migration.ts`

**Archivos modificados**:
- `src/data/models/index.ts` (exportar IKnowledgeNode)
- `src/data/db/dexie-db.ts` (añadir tabla knowledgeNodes)
- `src/services/material.service.ts` (generar KnowledgeNodes al procesar)

**Archivos que dejarán de usarse**: Ninguno en esta fase

**Riesgos**:
- Duplicación temporal de datos (conceptos en Material y KnowledgeNode)
- Complejidad en la migración de datos existentes

**Estrategia de migración**:
1. Crear nueva tabla en Dexie para KnowledgeNodes
2. Modificar `material.service.ts` para generar KnowledgeNodes al procesar
3. Mantener compatibilidad con el sistema actual
4. Validar que ambos sistemas coexistan sin conflictos

**Validaciones necesarias**:
- Verificar que los KnowledgeNodes se generen correctamente
- Asegurar que el sistema actual siga funcionando
- Pruebas de integración entre Material y KnowledgeNode

### Fase 2: Implementación de KnowledgeGraph

**Objetivo**: Crear grafos de conocimiento para representar relaciones

**Archivos nuevos**:
- `src/data/models/knowledge-graph.model.ts`
- `src/services/knowledge-graph.service.ts`
- `src/components/domain/KnowledgeGraphViewer.tsx`

**Archivos modificados**:
- `src/services/material.service.ts` (generar KnowledgeGraph)
- `src/pages/MaterialsPage.tsx` (mostrar visualización del grafo)

**Riesgos**:
- Complejidad en la visualización de grafos
- Rendimiento con grafos grandes

**Estrategia de migración**:
1. Implementar servicio básico de grafos
2. Crear visualizador simple
3. Integrar con el procesamiento de materiales

### Fase 3: Transición de Preguntas

**Objetivo**: Modificar preguntas para referenciar KnowledgeNodes

**Archivos modificados**:
- `src/services/question-generator/*.ts` (usar KnowledgeNodes)
- `src/data/models/question.model.ts` (añadir knowledgeNodes)

**Riesgos**:
- Inconsistencia en preguntas existentes

**Estrategia de migración**:
1. Modificar generadores para usar KnowledgeNodes
2. Actualizar preguntas nuevas
3. Mantener preguntas antiguas sin KnowledgeNodes

### Fase 4: Eliminación de Flashcards

**Objetivo**: Reemplazar flashcards por KnowledgeNodes

**Archivos modificados**:
- `src/pages/Flashcards.tsx` (usar KnowledgeNodes)
- `src/services/flashcard.service.ts` (deprecar)

**Archivos que dejarán de usarse**:
- `src/data/models/flashcard.model.ts`
- `src/data/models/spaced-repetition.model.ts`

### Fase 5: Consolidación Final

**Objetivo**: Eliminar dependencias de la arquitectura antigua

**Archivos modificados**:
- Eliminar código obsoleto
- Optimizar base de datos
- Actualizar documentación

## Implementación de la Fase 1

Vamos a implementar la primera fase: Introducción de KnowledgeNode

### Paso 1: Crear modelo de KnowledgeNode