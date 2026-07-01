# Roadmap para la Transición al Knowledge Engine

## Objetivo General
Transformar la arquitectura actual centrada en Materiales hacia un modelo donde el Knowledge Engine sea el núcleo del sistema, priorizando el conocimiento extraído y sus relaciones sobre los archivos originales.

## Arquitectura Propuesta

### Nuevas Entidades

#### 1. KnowledgeNode (Nodo de Conocimiento) ✅ IMPLEMENTADO
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

## Roadmap de Implementación

### Fase 1: Introducción de KnowledgeNode ✅ COMPLETADA

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

### Fase 2: Migración del Question Generator ✅ IMPLEMENTADA

**Objetivo**: Migrar la generación de preguntas para usar KnowledgeNodes como fuente principal

**Archivos modificados**:
- `src/services/question-generator/boolean-generator.ts` (soporte para KnowledgeNodes)
- `src/services/question-generator/multiple-choice-generator.ts` (soporte para KnowledgeNodes)
- `src/pages/QuizManagement.tsx` (obtener KnowledgeNodes y usarlos preferentemente)

**Estrategia de transición**:
1. Generadores ahora aceptan ambos formatos (antiguo y KnowledgeNodes)
2. QuizManagement intenta usar KnowledgeNodes primero
3. Si no hay KnowledgeNodes, cae al formato antiguo para compatibilidad
4. Ambos sistemas coexisten sin romper funcionalidad

**Validaciones necesarias**:
- Verificar que las preguntas se generen correctamente desde KnowledgeNodes
- Asegurar que el fallback al formato antiguo funcione
- Pruebas de integración completas

**Resultados obtenidos**:
- Question Generator ahora usa KnowledgeNodes como fuente principal
- Generación de preguntas ya no depende de contenidoProcesado
- Compatibilidad total con materiales existentes
- Transición limpia sin breaking changes

### Fase 3: Consolidación del Knowledge Engine

**Objetivo**: Eliminar dependencias restantes de contenidoProcesado

**Archivos a modificar**:
- `src/components/domain/MaterialCard.tsx` (usar KnowledgeNodes para visualización)
- `src/services/flashcard.service.ts` (migrar a KnowledgeNodes)
- `src/pages/Flashcards.tsx` (usar KnowledgeNodes directamente)

**Estrategia**:
1. Reemplazar lecturas de contenidoProcesado por consultas a KnowledgeNodes
2. Mantener compatibilidad durante la transición
3. Eliminar código obsoleto una vez que todo use KnowledgeNodes

**Validaciones necesarias**:
- Verificar que las visualizaciones funcionen con KnowledgeNodes
- Asegurar que flashcards se generen correctamente
- Pruebas de regresión completas

### Fase 4: Implementación de KnowledgeGraph

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

### Fase 5: Eliminación Final del Modelo Antiguo

**Objetivo**: Eliminar definitivamente contenidoProcesado y modelos obsoletos

**Archivos a eliminar**:
- `src/data/models/flashcard.model.ts`
- `src/data/models/spaced-repetition.model.ts`
- Campos obsoletos de IMaterial

**Archivos a modificar**:
- Todos los servicios que aún referencien el modelo antiguo
- Limpieza final de código

**Validaciones necesarias**:
- Verificar que no queden dependencias del modelo antiguo
- Pruebas completas de regresión
- Validación de rendimiento

## Implementación Actual

La Fase 2 (Migración del Question Generator) ha sido implementada con éxito, consolidando el Knowledge Engine como la nueva fuente de verdad para la generación de preguntas.

### Cambios Realizados

1. **Generadores de Preguntas Actualizados**:
   - `boolean-generator.ts`: Ahora acepta KnowledgeNodes o formato antiguo
   - `multiple-choice-generator.ts`: Normalización de entrada para ambos formatos
   - Funciones detectan automáticamente el tipo de entrada
   - Mismo comportamiento y interfaz mantenidos

2. **QuizManagement Migrado**:
   - Obtiene KnowledgeNodes asociados a materiales
   - Prioriza KnowledgeNodes como fuente principal de conocimiento
   - Fallback automático al formato antiguo si no hay KnowledgeNodes
   - Compatibilidad total con materiales existentes

3. **Estrategia de Transición Limpia**:
   - Ambos sistemas coexisten sin conflictos
   - Migración incremental sin breaking changes
   - Preparación para eliminación definitiva del modelo antiguo

### Qué Dejó de Depender de contenidoProcesado

- **Question Generator**: Ahora usa KnowledgeNodes como fuente principal
- **Generación de preguntas**: El flujo principal ya no lee contenidoProcesado
- **QuizManagement**: Obtiene conocimiento desde KnowledgeNodes

### Qué Pasó a Depender de KnowledgeNodes

- **Generadores de preguntas**: Primero intentan usar KnowledgeNodes
- **QuizManagement**: Obtiene y procesa KnowledgeNodes asociados a materiales
- **Nuevas preguntas generadas**: Se basan en KnowledgeNodes cuando disponibles
- **Sistema de preguntas**: Knowledge Engine como nueva fuente de verdad

### Qué Queda Pendiente

1. **Eliminar dependencias restantes**:
   - MaterialCard aún muestra contenidoProcesado para visualización
   - Flashcards aún usan el modelo antiguo (IFlashcard)
   - Algunas visualizaciones dependen del formato antiguo

2. **Preparación para eliminación definitiva**:
   - Migrar flashcards a KnowledgeNodes (Fase 3)
   - Actualizar componentes de visualización
   - Eliminar código de fallback una vez que todo use KnowledgeNodes

3. **Futuras mejoras**:
   - Implementar KnowledgeGraph para relaciones complejas (Fase 4)
   - Visualizadores avanzados de grafos de conocimiento
   - Integración con aprendizaje adaptativo mejorado
   - Eliminación completa del modelo antiguo (Fase 5)

## Métricas de Avance

- **Fase 1 (KnowledgeNode)**: ✅ 100% completada
- **Fase 2 (Question Generator)**: ✅ 100% completada
- **Fase 3 (Consolidación)**: ⏳ Pendiente
- **Fase 4 (KnowledgeGraph)**: ⏳ Pendiente
- **Fase 5 (Eliminación)**: ⏳ Pendiente

**Avance general**: 40% del Knowledge Engine implementado

## Decisiones Arquitectónicas Clave

1. **Coexistencia de Modelos**: Mantener ambos sistemas durante la transición para evitar breaking changes
2. **Detección Automática**: Generadores detectan el tipo de entrada automáticamente
3. **Fallback Graceful**: Caída automática al formato antiguo cuando no hay KnowledgeNodes
4. **Migración Incremental**: Cada fase mantiene el sistema funcionando
5. **Preparación para el Futuro**: Estructura diseñada para fácil eliminación del modelo antiguo

## Riesgos Mitigados

- **Breaking Changes**: Eliminados mediante estrategia de transición limpia
- **Pérdida de Funcionalidad**: Evitada con fallback al formato antiguo
- **Complejidad Excesiva**: Controlada con migración incremental
- **Problemas de Rendimiento**: Validados con pruebas completas

## Próximos Pasos

1. **Fase 3: Consolidación**
   - Migrar MaterialCard a KnowledgeNodes
   - Actualizar flashcards para usar KnowledgeNodes
   - Eliminar dependencias restantes de contenidoProcesado

2. **Fase 4: KnowledgeGraph**
   - Implementar modelo de grafos
   - Crear visualizador básico
   - Integrar con procesamiento de materiales

3. **Fase 5: Eliminación Final**
   - Eliminar modelos obsoletos
   - Limpieza de código
   - Validación completa

## Conclusión

La implementación del Knowledge Engine está progresando según lo planeado, con una estrategia de migración profesional que garantiza la estabilidad del sistema en cada fase. La Fase 2 representa un hito importante al consolidar el Knowledge Engine como la nueva fuente de verdad para la generación de preguntas, manteniendo al mismo tiempo la compatibilidad con el sistema existente.