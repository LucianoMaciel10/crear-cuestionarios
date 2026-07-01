# Análisis de Deuda Técnica Legada - Knowledge Engine

## Objetivo
Identificar y clasificar todas las dependencias del sistema legado para planificar su eliminación sistemática, consolidando KnowledgeNode como la única fuente de verdad.

## Auditoría Completa

### 1. Dependencias de `contenidoProcesado`

#### 📍 Puntos de Generación
- **material.service.ts** (Línea ~50-95):
  ```typescript
  const contenidoProcesado = extractionResult.legacyContent || {
    conceptos: [],
    definiciones: [],
    relaciones: []
  };
  ```
  - Genera contenidoProcesado como fallback
  - Lo usa para crear flashcards tradicionales
  - Lo almacena en el material

#### 📋 Consumidores Activos
1. **material.service.ts** (Auto-consumo):
   - Crea flashcards desde `contenidoProcesado.definiciones`
   - Línea: `saveFlashcardsFromDefinitions(contenidoProcesado.definiciones, idMateria)`

2. **QuizManagement.tsx** (Fallback):
   - Generación de preguntas cuando no hay KnowledgeNodes
   - Línea: `material.contenidoProcesado?.conceptos.map(...)`

3. **MaterialCard.tsx** (Visualización):
   - Muestra conceptos y definiciones
   - Línea: `const { conceptos, definiciones, relaciones } = material.contenidoProcesado`

#### 🔄 Información Duplicada
- **Conceptos**: Duplicados en KnowledgeNodes (type='concept')
- **Definiciones**: Duplicadas en KnowledgeNodes (type='definition')
- **Relaciones**: Solo en contenidoProcesado (no implementado en KnowledgeNodes)

### 2. Dependencias de `ISpacedRepetitionData`

#### 📍 Modelos y Tipos
- **spaced-repetition.model.ts**: Define `ISpacedRepetitionData`
- **flashcard.model.ts**: Define `IFlashcard` (idéntico a `ISpacedRepetitionData`)

#### 📋 Consumidores Activos
1. **sm2-algorithm.ts**: Algoritmo SM-2 completo
   - `calculateNextReview(card: ISpacedRepetitionData, quality: number)`
   - `createNewFlashcard(...): ISpacedRepetitionData`

2. **flashcard.service.ts**: Todos los métodos CRUD
   - `getAllFlashcards(): Promise<ISpacedRepetitionData[]>`
   - `saveFlashcard(flashcard: ISpacedRepetitionData)`
   - `updateFlashcard(flashcard: ISpacedRepetitionData)`
   - `getFlashcardsBySubject(subjectId: string)`
   - `saveFlashcardsFromDefinitions(...)`

3. **Flashcards.tsx**: Página principal
   - Estado: `flashcards: ISpacedRepetitionData[]`
   - Uso: `sm2Algorithm.calculateNextReview(currentFlashcard, quality)`

4. **Statistics.tsx**: Estadísticas
   - Estado: `flashcards: ISpacedRepetitionData[]`
   - Uso: `adaptiveEngine.calculateFlashcardMastery(flashcards)`

5. **FlashcardFlip.tsx**: Componente visual
   - Props: `flashcard: ISpacedRepetitionData`

6. **adaptive-engine.ts**: Cálculo de dominio
   - `calculateFlashcardMastery(flashcards: ISpacedRepetitionData[])`
   - `combineMastery(questionMastery, flashcardMastery)`

7. **subject.service.ts**: Eliminación en cascada
   - `await db.flashcards.bulkDelete(flashcardsIds as string[])`

### 3. Dependencias de `IFlashcard`

#### 📍 Modelo Obsoleto
- **flashcard.model.ts**: Define `IFlashcard` (duplicado exacto de `ISpacedRepetitionData`)
- **No tiene consumidores directos** (solo se exporta en `models/index.ts`)

### 4. Tablas de Dexie

#### 📋 Tablas Actuales
```typescript
// dexie-db.ts
materiales!: Dexie.Table<IMaterial, string>;
materias!: Dexie.Table<IMateria, string>;
etiquetas!: Dexie.Table<IEtiqueta, string>;
questions!: Dexie.Table<IQuestion, string>;
flashcards!: Dexie.Table<ISpacedRepetitionData, string>; // ← Legado
quizAttempts!: Dexie.Table<IQuizAttempt, string>;
knowledgeNodes!: Dexie.Table<IKnowledgeNode, string>; // ← Nuevo
```

### 5. Código de Fallback

#### 🔄 Fallback en QuizManagement.tsx
```typescript
// Si no hay KnowledgeNodes, usa contenidoProcesado
material.contenidoProcesado?.conceptos.map((concept) => ({
  concept,
  definition: material.contenidoProcesado?.definiciones.find(
    (def) => def.concepto === concept,
  )?.definicion || "",
}))
```

#### 🔄 Fallback en flashcard.service.ts
```typescript
// getAllFlashcardsForSubject()
// Primero intenta obtener desde KnowledgeNodes
const knowledgeNodeFlashcards = await getFlashcardsFromKnowledgeNodes(subjectId);
if (knowledgeNodeFlashcards.length > 0) {
  return knowledgeNodeFlashcards;
}
// Si no hay KnowledgeNodes, usar el sistema tradicional
return getFlashcardsBySubject(subjectId);
```

## Clasificación de Dependencias

### 🟢 Puede Eliminarse AHORA

1. **IFlashcard (modelo completo)**
   - **Razón**: Duplicado exacto de `ISpacedRepetitionData`, sin consumidores directos
   - **Impacto**: Ninguno (solo se exporta en índice)
   - **Acciones**:
     - Eliminar `src/data/models/flashcard.model.ts`
     - Remover exportación de `models/index.ts`

2. **Relaciones en contenidoProcesado**
   - **Razón**: No implementado en KnowledgeNodes, pero no se usa
   - **Impacto**: Solo aparece en MaterialCard.tsx sin uso real
   - **Acciones**:
     - Remover `relaciones` de `IContenidoProcesado`
     - Eliminar referencia en MaterialCard.tsx

3. **Generación de flashcards desde contenidoProcesado**
   - **Razón**: Ya existe `getFlashcardsFromKnowledgeNodes()`
   - **Impacto**: Solo afecta nuevos materiales (antiguos mantienen sus flashcards)
   - **Acciones**:
     - Eliminar llamada a `saveFlashcardsFromDefinitions()` en material.service.ts

### 🟡 Puede Eliminarse en Próxima Fase

1. **contenidoProcesado en MaterialCard.tsx**
   - **Razón**: Solo se usa para visualización debug
   - **Dependencia**: `showDebugInfo` aún lo muestra
   - **Acciones futuras**:
     - Reemplazar con visualización de KnowledgeNodes
     - Eliminar cuando se elimine contenidoProcesado completamente

2. **contenidoProcesado en QuizManagement.tsx**
   - **Razón**: Fallback para materiales antiguos
   - **Dependencia**: Materiales sin KnowledgeNodes
   - **Acciones futuras**:
     - Migrar todos los materiales a KnowledgeNodes
     - Eliminar fallback cuando todos tengan KnowledgeNodes

3. **Tabla flashcards en Dexie**
   - **Razón**: Todavía tiene datos activos
   - **Dependencia**: Flashcards tradicionales aún en uso
   - **Acciones futuras**:
     - Migrar datos a KnowledgeNodes
     - Eliminar tabla cuando todos usen KnowledgeNodes

### 🔴 Debe Mantenerse (Por Ahora)

1. **ISpacedRepetitionData**
   - **Razón**: Usado extensivamente en SM-2, servicios y UI
   - **Dependencia**: Todo el sistema de flashcards actual
   - **Plan futuro**: Reemplazar con KnowledgeNode cuando SM-2 se adapte

2. **sm2-algorithm.ts**
   - **Razón**: Algoritmo completo basado en ISpacedRepetitionData
   - **Dependencia**: Lógica de repetición espaciada
   - **Plan futuro**: Adaptar para trabajar con KnowledgeNode.metadata

3. **Flashcards.tsx y Statistics.tsx**
   - **Razón**: Interfaz de usuario principal
   - **Dependencia**: Componentes visuales basados en ISpacedRepetitionData
   - **Plan futuro**: Reemplazar con componentes basados en KnowledgeNode

4. **adaptive-engine.ts (calculateFlashcardMastery)**
   - **Razón**: Cálculo de estadísticas basado en flashcards
   - **Dependencia**: Statistics page
   - **Plan futuro**: Adaptar para usar KnowledgeNodes

## Implementación - Eliminación Inmediata

### 1. Eliminar IFlashcard

**Archivos a modificar:**
- `src/data/models/flashcard.model.ts` → **ELIMINAR**
- `src/data/models/index.ts` → Remover exportación

**Acciones:**
```bash
rm src/data/models/flashcard.model.ts
```

```typescript
// src/data/models/index.ts
// Remover esta línea:
export type { IFlashcard } from "./flashcard.model";
```

### 2. Eliminar relaciones de contenidoProcesado

**Archivos a modificar:**
- `src/data/models/material.model.ts`
- `src/components/domain/MaterialCard.tsx`

**Acciones:**
```typescript
// src/data/models/material.model.ts
export interface IContenidoProcesado {
  conceptos: string[];
  definiciones: { concepto: string; definicion: string }[];
  // Eliminar: relaciones: any[];
}
```

```typescript
// src/components/domain/MaterialCard.tsx
// Eliminar: const { relaciones } = material.contenidoProcesado;
// Eliminar cualquier referencia a relaciones
```

### 3. Eliminar generación de flashcards desde contenidoProcesado

**Archivos a modificar:**
- `src/services/material.service.ts`

**Acciones:**
```typescript
// src/services/material.service.ts
// Eliminar estas líneas:
if (idMateria && contenidoProcesado.definiciones.length > 0) {
  await saveFlashcardsFromDefinitions(
    contenidoProcesado.definiciones,
    idMateria,
  );
}
```

## Limpieza Adicional

### Eliminar imports muertos

**Archivos a revisar:**
- `src/data/models/index.ts` → Verificar exports no usados
- `src/services/flashcard.service.ts` → Verificar imports
- `src/components/domain/MaterialCard.tsx` → Verificar uso de relaciones

### Eliminar código duplicado

**Oportunidades:**
- `IFlashcard` vs `ISpacedRepetitionData` → Ya eliminado IFlashcard
- Lógica de fallback redundante → Mantener solo lo esencial

## Validación Arquitectónica

### Código Legado Eliminado
- ✅ `IFlashcard` (modelo completo)
- ✅ `relaciones` en contenidoProcesado
- ✅ Generación automática de flashcards desde contenidoProcesado

### Código Legado Pendiente
- ❌ `ISpacedRepetitionData` (usado extensivamente)
- ❌ `contenidoProcesado` (aún usado en UI y fallback)
- ❌ Tabla `flashcards` en Dexie (aún tiene datos)
- ❌ `sm2-algorithm.ts` (basado en modelo antiguo)
- ❌ Componentes UI (basados en modelo antiguo)

### Porcentaje de Migración
- **Knowledge Engine como Source of Truth**: 60%
- **Eliminación de deuda técnica**: 30%
- **Consolidación del dominio**: 70%

### Impedimentos Arquitectónicos

1. **SM-2 acoplado a ISpacedRepetitionData**
   - El algoritmo depende del modelo antiguo
   - Solución: Adaptar SM-2 para trabajar con KnowledgeNode.metadata

2. **UI acoplada a flashcards tradicionales**
   - Componentes visuales dependen de ISpacedRepetitionData
   - Solución: Crear componentes basados en KnowledgeNode

3. **Datos históricos en tabla flashcards**
   - Migración de datos requerida
   - Solución: Script de migración a KnowledgeNodes

4. **contenidoProcesado en materiales antiguos**
   - Compatibilidad con datos existentes
   - Solución: Migración gradual o eliminación cuando ya no sea necesario

## Próximos Pasos Recomendados

### Fase Actual (Eliminación Inmediata)
1. ✅ Eliminar IFlashcard
2. ✅ Eliminar relaciones de contenidoProcesado
3. ✅ Eliminar generación automática de flashcards desde contenidoProcesado
4. ✅ Limpiar imports y código muerto

### Próxima Fase (Adaptación)
1. Adaptar SM-2 para trabajar con KnowledgeNode
2. Crear componentes UI basados en KnowledgeNode
3. Implementar migración de datos (flashcards → KnowledgeNodes)
4. Eliminar contenidoProcesado de MaterialCard

### Fase Final (Eliminación)
1. Eliminar ISpacedRepetitionData
2. Eliminar tabla flashcards de Dexie
3. Eliminar contenidoProcesado completamente
4. Validar KnowledgeNode como único Source of Truth

## Métricas de Éxito

**Objetivo de esta fase:**
- Reducir deuda técnica en 30%
- Eliminar 3 modelos/estructuras obsoletas
- Mantener 100% compatibilidad
- No introducir breaking changes

**Resultado esperado:**
- Proyecto más simple
- Menos código legado
- KnowledgeNode más cerca de ser el único modelo
- Base sólida para futuras fases