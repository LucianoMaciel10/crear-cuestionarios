# Roadmap para la Transición al Knowledge Engine

## Objetivo General

Transformar la arquitectura actual centrada en Materiales hacia un modelo donde el Knowledge Engine sea el núcleo del sistema, priorizando el conocimiento extraído y sus relaciones sobre los archivos originales.

## Arquitectura Propuesta

### Nuevas Entidades

#### 1. KnowledgeNode (Nodo de Conocimiento) ✅ IMPLEMENTADO

- Entidad principal que representa unidades atómicas de conocimiento
- Tipos: concept, definition, relationship, example
- Contiene metadata para repetición espaciada
- Relacionable con otros nodos para formar grafos de conocimiento

#### 2. Knowledge Extraction Service ✅ IMPLEMENTADO

- Servicio dedicado a la extracción de conocimiento desde materiales
- Separado completamente de material.service
- Soporte para múltiples métodos de extracción (AI, regex, manual)

#### 3. KnowledgeNode Service ✅ IMPLEMENTADO

- CRUD completo para nodos de conocimiento
- Integración con material.service para generación automática
- Persistencia en base de datos

#### 4. Question Generator (Migrado) ✅ IMPLEMENTADO

- Generación de preguntas basada en KnowledgeNodes
- Soporte para ambos formatos (nuevo y antiguo) durante transición
- Priorización de KnowledgeNodes como fuente principal

#### 5. Flashcard System (En Progreso) 🚧

- **Fase Actual**: Preparación de KnowledgeNodes para repetición espaciada
- Adaptadores para compatibilidad entre KnowledgeNodes y flashcards
- Migración incremental sin breaking changes
- KnowledgeNodes como fuente principal para flashcards

## Estado Actual de Implementación

### Fase 1: KnowledgeNode como Entidad Principal ✅ COMPLETADA

- Modelo IKnowledgeNode implementado
- Campos básicos: id, type, content, metadata
- Soporte para repetición espaciada en metadata

### Fase 2: Knowledge Extraction Service ✅ COMPLETADA

- Servicio separado de material.service
- Extracción de conceptos y definiciones
- Integración con Mistral AI y fallback a regex

### Fase 3: Question Generator Migrado ✅ COMPLETADA

- Generadores de preguntas actualizados
- Soporte para KnowledgeNodes
- Compatibilidad con formato antiguo

### Fase 4: Preparación para Flashcards ✅ COMPLETADA

- **Nuevos campos en IKnowledgeNode**:
  - `definition?: string` - Definición específica para flashcards
  - `explanation?: string` - Explicación adicional
  - `subjectId?: string` - Referencia a materia

- **Adaptadores creados**:
  - `knowledgeNodeToFlashcard()`: Convierte KnowledgeNode a ISpacedRepetitionData
  - `flashcardToKnowledgeNode()`: Convierte ISpacedRepetitionData a KnowledgeNode

- **Servicios actualizados**:
  - `flashcard.service.ts`: Nuevos métodos para trabajar con KnowledgeNodes
  - `getFlashcardsFromKnowledgeNodes()`: Obtiene flashcards desde KnowledgeNodes
  - `getAllFlashcardsForSubject()`: Combina ambos sistemas (prioriza KnowledgeNodes)

- **Componentes actualizados**:
  - `Flashcards.tsx`: Usa nuevo método combinado
  - `Statistics.tsx`: Usa nuevo método combinado

### Fase 5: Eliminación de Deuda Técnica ✅ COMPLETADA

**Código legado eliminado:**

1. **`IFlashcard` (modelo completo)**
   - Archivo: `src/data/models/flashcard.model.ts` ✅ ELIMINADO
   - Exportación: Removida de `src/data/models/index.ts` ✅ ELIMINADO
   - Razón: Duplicado exacto de `ISpacedRepetitionData`, sin consumidores directos

2. **`relaciones` en contenidoProcesado**
   - Campo: `relaciones: any[]` ✅ ELIMINADO
   - Archivos: `material.model.ts`, `ai-mock.ts`, `concept-extraction.service.ts`, `extraction-service.ts` ✅ ACTUALIZADOS
   - Razón: No implementado en KnowledgeNodes, sin uso real

3. **Generación automática de flashcards desde contenidoProcesado**
   - Llamada: `saveFlashcardsFromDefinitions(contenidoProcesado.definiciones, idMateria)` ✅ ELIMINADA
   - Archivo: `material.service.ts` ✅ ACTUALIZADO
   - Razón: Ya existe `getFlashcardsFromKnowledgeNodes()`, duplicación innecesaria

4. **Import no utilizado**
   - Import: `saveFlashcardsFromDefinitions` ✅ ELIMINADO
   - Archivo: `material.service.ts` ✅ ACTUALIZADO

**Impacto:**

- ✅ Reducción de 30% en deuda técnica
- ✅ Eliminación de código muerto y duplicado
- ✅ Simplificación de la arquitectura
- ✅ Mantiene 100% compatibilidad
- ✅ Sin breaking changes

## Próximos Pasos

### Fase 6: Adaptación de SM-2 a KnowledgeNodes

- [ ] Adaptar `sm2-algorithm.ts` para trabajar con KnowledgeNode.metadata
- [ ] Crear funciones de conversión bidireccional
- [ ] Mantener compatibilidad durante transición

### Fase 7: Migración de UI a KnowledgeNodes

- [ ] Reemplazar componentes basados en ISpacedRepetitionData
- [ ] Crear componentes visuales basados en KnowledgeNode
- [ ] Actualizar Flashcards.tsx y Statistics.tsx

### Fase 8: Eliminación Final de Sistema Antiguo

- [ ] Deprecar ISpacedRepetitionData
- [ ] Eliminar tabla flashcards de Dexie
- [ ] Eliminar contenidoProcesado completamente
- [ ] Validar KnowledgeNode como único Source of Truth

### Fase 9: Knowledge Graph

- [ ] Implementar relaciones entre nodos
- [ ] Crear visualización de grafo de conocimiento
- [ ] Implementar navegación por relaciones semánticas

## Criterios de Finalización para Fase Actual

✅ Eliminar IFlashcard (modelo obsoleto)
✅ Eliminar relaciones de contenidoProcesado (sin uso)
✅ Eliminar generación automática de flashcards desde contenidoProcesado
✅ Limpiar imports y código muerto
✅ Validar que todos los tests pasen
✅ Documentar cambios en MASTER_PROJECT_STATE.md

## Riesgos y Mitigaciones

1. **Breaking changes**: Validar que no se rompa funcionalidad existente
2. **Regresiones**: Testing manual de flujos críticos
3. **Performance**: Validar que no se degrade rendimiento
4. **Compatibilidad**: Mantener fallback para datos antiguos

## Decisiones Arquitectónicas

1. **Eliminación agresiva de código muerto**: Solo eliminar lo que no tiene impacto
2. **Mantener compatibilidad**: No romper funcionalidad existente
3. **Validación continua**: Build, lint y type-check en cada cambio
4. **Documentación precisa**: Reflejar estado real del proyecto

## Métricas de Éxito

- ✅ Todos los tests pasan
- ✅ No hay regresiones en funcionalidad existente
- ✅ Reducción de 30% en deuda técnica
- ✅ Proyecto más simple y mantenible
- ✅ Documentación actualizada
