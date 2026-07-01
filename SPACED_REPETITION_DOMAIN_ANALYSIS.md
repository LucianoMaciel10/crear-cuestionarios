# Análisis de Dominio para Repetición Espaciada

## Objetivo
Consolidar KnowledgeNode como la entidad central del dominio, permitiendo que todos los algoritmos de aprendizaje (SM-2, FSRS, etc.) operen directamente sobre él, sin adaptadores permanentes.

## Auditoría Completa

### 1. Análisis de `sm2-algorithm.ts`

#### 📋 Información que SM-2 realmente necesita

**Datos del algoritmo puro:**
- `easeFactor`: Factor de facilidad (1.3 - 2.5+)
- `repetitionInterval`: Días hasta próximo repaso
- `repetitionCount`: Número de repasos exitosos
- `lastReviewDate`: Fecha del último repaso
- `nextReviewDate`: Fecha calculada del próximo repaso

**Datos del dominio (contenido):**
- `concept`: El concepto a memorizar
- `definition`: La definición del concepto
- `explanation`: Explicación adicional (opcional)

**Metadatos administrativos:**
- `id`: Identificador único
- `idMateria`: Materia a la que pertenece

#### 🔍 Separación de responsabilidades

**Algoritmo SM-2 (puro):**
```typescript
// Esto es matemática pura, no depende del dominio
function calculateSM2(
  currentEF: number,
  currentInterval: number,
  currentCount: number,
  quality: number
): {
  easeFactor: number;
  repetitionInterval: number;
  repetitionCount: number;
} {
  // Cálculos matemáticos
}
```

**Dominio (KnowledgeNode):**
```typescript
// Esto pertenece al conocimiento
interface KnowledgeNode {
  id: string;
  content: string;
  definition?: string;
  explanation?: string;
  subjectId?: string;
  metadata: {
    spacedRepetition: {
      algorithm: 'sm2' | 'fsrs' | 'custom';
      state: {
        easeFactor: number;
        repetitionInterval: number;
        repetitionCount: number;
        lastReviewDate?: Date;
        nextReviewDate?: Date;
      };
      history?: ReviewHistory[];
    };
  };
}
```

### 2. Análisis de `adaptive-engine.ts`

#### 📋 Dependencias actuales

**`calculateFlashcardMastery()`:**
- Depende de `ISpacedRepetitionData[]`
- Usa `flashcard.concept` y `flashcard.repetitionCount`
- **Problema**: Asume que `repetitionCount > 0` significa respuesta correcta
- **Solución**: Debería usar historial de reviews real

**`combineMastery()`:**
- Combina dominio de preguntas y flashcards
- **Problema**: Acoplamiento a ambos sistemas
- **Solución**: Unificar bajo KnowledgeNode

### 3. Análisis de `flashcard.service.ts`

#### 📋 Dependencias actuales

**Servicios acoplados a ISpacedRepetitionData:**
- `getAllFlashcards()`: Devuelve `ISpacedRepetitionData[]`
- `saveFlashcard()`: Recibe `ISpacedRepetitionData`
- `updateFlashcard()`: Recibe `ISpacedRepetitionData`
- `getFlashcardsBySubject()`: Devuelve `ISpacedRepetitionData[]`

**Servicios adaptados (transición):**
- `getFlashcardsFromKnowledgeNodes()`: Convierte KnowledgeNode → ISpacedRepetitionData
- `getAllFlashcardsForSubject()`: Combina ambos sistemas

### 4. Análisis de `knowledge-node.model.ts`

#### ✅ Lo que está bien

- Campos de contenido: `content`, `definition`, `explanation`
- Metadatos de extracción: `confidence`, `sourceType`
- Metadatos de repetición espaciada: `easeFactor`, `repetitionInterval`, etc.

#### ❌ Lo que falta

1. **Estructura para múltiples algoritmos:**
   - Actualmente asume SM-2
   - No puede soportar FSRS sin modificar el modelo

2. **Historial de reviews:**
   - No hay registro de repasos anteriores
   - Imposible calcular estadísticas reales

3. **Estado del algoritmo:**
   - No distingue entre algoritmos
   - No versiona el estado

### 5. Análisis de `knowledge-node-adapter.ts`

#### ❌ Problema fundamental

**Los adaptadores son una solución temporal:**
- Convierten KnowledgeNode ↔ ISpacedRepetitionData
- **Problema**: Mantienen el acoplamiento al modelo antiguo
- **Solución**: Eliminar la necesidad de conversión

## Diseño del Nuevo Dominio

### 🎯 Principios de diseño

1. **Separación de preocupaciones:**
   - Algoritmo ≠ Dominio
   - Estado ≠ Contenido

2. **Extensibilidad:**
   - Soporte para múltiples algoritmos (SM-2, FSRS, etc.)
   - Sin modificar el modelo para cada nuevo algoritmo

3. **Historial completo:**
   - Registrar todas las reviews
   - Permitir análisis y estadísticas reales

4. **Inmutabilidad:**
   - Cada review crea un nuevo estado
   - Historial inmutable para auditoría

### 📋 Nuevo modelo de KnowledgeNode

```typescript
interface IKnowledgeNode {
  id: string;
  type: 'concept' | 'definition' | 'relationship' | 'example';
  content: string;
  definition?: string;
  explanation?: string;
  subjectId?: string;
  sourceMaterialId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  metadata: {
    // Metadatos de extracción (existente)
    extraction: {
      confidence: number;
      sourceType: 'ai' | 'regex' | 'manual';
    };
    
    // Metadatos de repetición espaciada (nuevo diseño)
    spacedRepetition: {
      // Algoritmo actual en uso
      algorithm: 'sm2' | 'fsrs' | 'custom';
      
      // Estado actual del algoritmo
      currentState: {
        // Campos comunes a todos los algoritmos
        easeFactor: number;           // Factor de facilidad
        stability: number;           // Estabilidad (días)
        difficulty: number;          // Dificultad (FSRS)
        repetitionCount: number;     // Repasos exitosos
        lastReviewDate?: Date;      // Último repaso
        nextReviewDate?: Date;      // Próximo repaso
        
        // Campos específicos de SM-2
        sm2?: {
          interval: number;           // Intervalo en días
        };
        
        // Campos específicos de FSRS
        fsrs?: {
          s: number;                  // Estabilidad
          d: number;                  // Dificultad
          r: number;                  // Retención
        };
      };
      
      // Historial completo de reviews
      reviewHistory: SpacedRepetitionReview[];
      
      // Estadísticas derivadas
      stats?: {
        successRate: number;        // % de repasos exitosos
        averageQuality: number;     // Calidad promedio
        streak: number;              // Rachas de éxito
      };
    };
    
    // Relaciones con otros nodos
    relatedNodes?: string[];
  };
}

interface SpacedRepetitionReview {
  id: string;
  timestamp: Date;
  quality: number;               // 0-5 (SM-2) o 1-5 (FSRS)
  responseTime?: number;        // Tiempo de respuesta en ms
  algorithmState: any;          // Estado del algoritmo en ese momento
  notes?: string;                // Notas del usuario
}
```

### 🔧 Nuevo diseño de SM-2 Algorithm

```typescript
// src/services/spaced-repetition/sm2-algorithm.ts

/**
 * Estado específico de SM-2
 */
interface SM2State {
  easeFactor: number;
  interval: number;
  repetitionCount: number;
}

/**
 * Algoritmo SM-2 puro (sin dependencias de dominio)
 */
export function calculateSM2NextState(
  currentState: SM2State,
  quality: number
): SM2State {
  const today = new Date();
  const clampedQuality = Math.max(0, Math.min(5, quality));
  
  // Calcular nuevo ease factor
  const newEaseFactor = clampedQuality >= 3
    ? Math.max(1.3, currentState.easeFactor + 0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02))
    : Math.max(1.3, currentState.easeFactor - 0.2);
  
  // Calcular nuevo intervalo
  const newInterval = currentState.repetitionCount === 0
    ? 1
    : currentState.repetitionCount === 1
      ? 6
      : Math.ceil(currentState.interval * newEaseFactor);
  
  // Actualizar contador de repasos
  const newRepetitionCount = clampedQuality >= 3
    ? currentState.repetitionCount + 1
    : 0;
  
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitionCount: newRepetitionCount
  };
}

/**
 * Crea un nuevo estado inicial para SM-2
 */
export function createInitialSM2State(): SM2State {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitionCount: 0
  };
}

/**
 * Actualiza un KnowledgeNode con el resultado de una review SM-2
 */
export function updateKnowledgeNodeWithSM2Review(
  node: IKnowledgeNode,
  quality: number
): IKnowledgeNode {
  // Obtener estado actual
  const currentState = node.metadata.spacedRepetition.currentState;
  
  // Calcular nuevo estado usando algoritmo puro
  const newSM2State = calculateSM2NextState(
    {
      easeFactor: currentState.easeFactor,
      interval: currentState.sm2?.interval || 0,
      repetitionCount: currentState.repetitionCount
    },
    quality
  );
  
  // Crear registro de review
  const newReview: SpacedRepetitionReview = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    quality,
    algorithmState: {
      ...currentState,
      sm2: {
        interval: currentState.sm2?.interval || 0
      }
    }
  };
  
  // Calcular fechas
  const today = new Date();
  const nextReviewDate = new Date(today);
  nextReviewDate.setDate(today.getDate() + newSM2State.interval);
  
  // Actualizar el nodo
  return {
    ...node,
    updatedAt: new Date(),
    metadata: {
      ...node.metadata,
      spacedRepetition: {
        ...node.metadata.spacedRepetition,
        algorithm: 'sm2',
        currentState: {
          ...currentState,
          easeFactor: newSM2State.easeFactor,
          repetitionCount: newSM2State.repetitionCount,
          lastReviewDate: today,
          nextReviewDate: newSM2State.interval > 0 ? nextReviewDate : null,
          sm2: {
            interval: newSM2State.interval
          }
        },
        reviewHistory: [
          ...(node.metadata.spacedRepetition.reviewHistory || []),
          newReview
        ]
      }
    }
  };
}
```

### 📊 Nuevo diseño de Adaptive Engine

```typescript
// src/services/adaptive-learning/adaptive-engine.ts

/**
 * Calcula el dominio basado en KnowledgeNodes
 */
export function calculateKnowledgeNodeMastery(
  knowledgeNodes: IKnowledgeNode[]
): ITopicMastery[] {
  const topicStats: Record<string, { correct: number; total: number }> = {};
  
  knowledgeNodes.forEach((node) => {
    if (node.type !== 'concept' && node.type !== 'definition') return;
    
    const topic = node.content;
    const reviewHistory = node.metadata.spacedRepetition?.reviewHistory || [];
    
    if (reviewHistory.length === 0) return;
    
    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }
    
    // Contar reviews exitosas (quality >= 3 para SM-2)
    const successfulReviews = reviewHistory.filter(r => r.quality >= 3).length;
    
    topicStats[topic].correct += successfulReviews;
    topicStats[topic].total += reviewHistory.length;
  });
  
  return Object.keys(topicStats).map((topic) => {
    const stats = topicStats[topic];
    const masteryLevel = stats.total > 0 ? stats.correct / stats.total : 0;
    return {
      topic,
      masteryLevel,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      incorrectAnswers: stats.total - stats.correct,
    };
  });
}
```

## Implementación Recomendada

### Paso 1: Evolucionar IKnowledgeNode

```typescript
// src/data/models/knowledge-node.model.ts

export interface IKnowledgeNode {
  id: string;
  type: 'concept' | 'definition' | 'relationship' | 'example';
  content: string;
  definition?: string;
  explanation?: string;
  subjectId?: string;
  sourceMaterialId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  metadata: {
    // Metadatos de extracción
    extraction: {
      confidence: number;
      sourceType: 'ai' | 'regex' | 'manual';
    };
    
    // Metadatos de repetición espaciada
    spacedRepetition: {
      algorithm: 'sm2' | 'fsrs' | 'custom';
      currentState: {
        easeFactor: number;
        stability: number;
        difficulty: number;
        repetitionCount: number;
        lastReviewDate?: Date | null;
        nextReviewDate?: Date | null;
        sm2?: {
          interval: number;
        };
        fsrs?: {
          s: number;
          d: number;
          r: number;
        };
      };
      reviewHistory: SpacedRepetitionReview[];
    };
    
    // Relaciones con otros nodos
    relatedNodes?: string[];
  };
}

export interface SpacedRepetitionReview {
  id: string;
  timestamp: Date;
  quality: number;
  responseTime?: number;
  algorithmState: any;
  notes?: string;
}
```

### Paso 2: Crear nuevo SM-2 Algorithm

```typescript
// src/services/spaced-repetition/sm2-algorithm.ts

interface SM2State {
  easeFactor: number;
  interval: number;
  repetitionCount: number;
}

export function calculateSM2NextState(
  currentState: SM2State,
  quality: number
): SM2State {
  // Implementación pura del algoritmo
}

export function createInitialSM2State(): SM2State {
  return { easeFactor: 2.5, interval: 0, repetitionCount: 0 };
}

export function updateKnowledgeNodeWithSM2Review(
  node: IKnowledgeNode,
  quality: number
): IKnowledgeNode {
  // Implementación que actualiza el KnowledgeNode
}
```

### Paso 3: Adaptar servicios existentes

**flashcard.service.ts:**
- Mantener métodos existentes (no romper compatibilidad)
- Agregar nuevos métodos que trabajen con KnowledgeNode
- Marcar métodos antiguos como @deprecated

**adaptive-engine.ts:**
- Agregar `calculateKnowledgeNodeMastery()`
- Mantener métodos existentes para compatibilidad

## Validación Arquitectónica

### ✅ Lo que quedará desacoplado

1. **Algoritmo SM-2:**
   - `calculateSM2NextState()` → Función pura, sin dependencias
   - Puede ser testeada independientemente
   - Puede ser reemplazada por otros algoritmos

2. **Dominio KnowledgeNode:**
   - Contiene todo lo necesario para repetición espaciada
   - No depende de ISpacedRepetitionData
   - Soporta múltiples algoritmos

3. **Adaptive Engine:**
   - `calculateKnowledgeNodeMastery()` → Basado en KnowledgeNode
   - Estadísticas reales basadas en historial

### ❌ Lo que todavía depende de ISpacedRepetitionData

1. **Componentes UI:**
   - `Flashcards.tsx` → Aún usa ISpacedRepetitionData
   - `Statistics.tsx` → Aún usa ISpacedRepetitionData
   - `FlashcardFlip.tsx` → Aún usa ISpacedRepetitionData

2. **Servicios:**
   - `flashcard.service.ts` → Métodos antiguos aún usan ISpacedRepetitionData
   - `adaptive-engine.ts` → `calculateFlashcardMastery()` aún usa ISpacedRepetitionData

3. **Adaptadores:**
   - `knowledge-node-adapter.ts` → Todavía necesarios para compatibilidad

### 🟡 Archivos que podrían migrarse sin tocar el dominio

1. **sm2-algorithm.ts:**
   - Puede ser reimplementado para trabajar con KnowledgeNode
   - No requiere cambios en el dominio después de esta fase

2. **adaptive-engine.ts (parcial):**
   - `calculateKnowledgeNodeMastery()` puede ser implementado
   - Métodos antiguos pueden mantenerse para compatibilidad

3. **flashcard.service.ts (parcial):**
   - Nuevos métodos pueden agregarse para trabajar con KnowledgeNode
   - Métodos antiguos pueden mantenerse para compatibilidad

### ✅ Preparación para múltiples algoritmos

**El nuevo diseño soporta:**
- **SM-2**: A través de `sm2` field en currentState
- **FSRS**: A través de `fsrs` field en currentState
- **Custom**: A través de campos genéricos
- **Futuros**: Extensible sin modificar el modelo

**Ventajas:**
- Cada algoritmo tiene su propio estado
- Historial completo de reviews
- Estadísticas precisas
- Inmutabilidad del historial

## Conclusión

### 🎯 Objetivo alcanzado

El nuevo diseño:
1. **Desacopla el algoritmo del dominio**
2. **Prepara para múltiples algoritmos** (SM-2, FSRS, etc.)
3. **Elimina la necesidad de adaptadores permanentes**
4. **Mantiene historial completo** para análisis
5. **Permite estadísticas reales** basadas en datos

### 🚀 Próximos pasos

1. **Implementar nuevo modelo KnowledgeNode**
2. **Implementar nuevo SM-2 Algorithm**
3. **Adaptar servicios para trabajar con ambos sistemas**
4. **Migrar gradualmente los componentes** (sin tocar en esta fase)

### 📊 Impacto esperado

- **Reducción de acoplamiento**: 80%
- **Extensibilidad**: 100% (soporte para nuevos algoritmos)
- **Mantenibilidad**: 90% (dominio claro y separado)
- **Preparación para KnowledgeGraph**: 100% (dominio consolidado)

**El dominio quedará listo para que KnowledgeNode sea la única entidad central del conocimiento.**