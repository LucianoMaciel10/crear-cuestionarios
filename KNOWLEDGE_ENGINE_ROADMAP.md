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

#### 5. Flashcard System (Migrado) ✅ IMPLEMENTADO

- KnowledgeNode como entidad central del dominio
- Flashcard como representación visual únicamente
- SM-2 desacoplado y trabajando directamente con KnowledgeNode
- Preparación para múltiples algoritmos (SM-2, FSRS, etc.)

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

- Adaptadores creados
- Servicios actualizados
- Componentes modificados para usar ambos sistemas

### Fase 5: Eliminación de Deuda Técnica ✅ COMPLETADA

- `IFlashcard` eliminado
- `relaciones` en contenidoProcesado eliminado
- Generación automática de flashcards desde contenidoProcesado eliminada
- Código muerto limpiado

### Fase 6: Consolidación del Dominio ✅ COMPLETADA

- Nuevo modelo de KnowledgeNode para repetición espaciada
- SM-2 desacoplado como algoritmo puro
- KnowledgeNode Updater implementado
- Adaptive Engine adaptado

### Fase 7: Migración de Consumidores ✅ COMPLETADA

**Componentes migrados:**

- ✅ Flashcards.tsx → Ahora usa KnowledgeNode
- ✅ Statistics.tsx → Ahora usa KnowledgeNode
- ✅ FlashcardFlip.tsx → Ahora usa KnowledgeNode
- ✅ flashcard.service.ts → Nuevos métodos basados en KnowledgeNode

**Cambios realizados:**

- Estado cambiado de `ISpacedRepetitionData[]` a `IKnowledgeNode[]`
- Funciones adaptadas para trabajar con KnowledgeNode
- Lógica de actualización usando `updateKnowledgeNodeWithSM2Review()`
- Estadísticas usando `calculateKnowledgeNodeMastery()`

## Próximos Pasos

### Fase 8: Eliminación Final de Sistema Antiguo

- [ ] Deprecar ISpacedRepetitionData
- [ ] Eliminar tabla flashcards de Dexie
- [ ] Eliminar contenidoProcesado completamente
- [ ] Validar KnowledgeNode como único Source of Truth
- [ ] Eliminar adaptadores obsoletos
- [ ] Eliminar funciones marcadas como @deprecated

### Fase 9: Knowledge Graph

- [ ] Implementar relaciones entre nodos
- [ ] Crear visualización de grafo de conocimiento
- [ ] Implementar navegación por relaciones semánticas

## Validación Arquitectónica

### ✅ Lo que dejó de depender de Flashcards

1. **Flashcards.tsx**: ✅ Migrado a KnowledgeNode
2. **Statistics.tsx**: ✅ Migrado a KnowledgeNode
3. **FlashcardFlip.tsx**: ✅ Migrado a KnowledgeNode
4. **flashcard.service.ts (parcial)**: ✅ Nuevos métodos basados en KnowledgeNode

### ❌ Lo que sigue dependiendo del sistema antiguo

1. **subject.service.ts**: Eliminación en cascada (temporal)
2. **sm2-algorithm.ts**: Funciones antiguas (deprecated)
3. **adaptive-engine.ts**: Funciones antiguas (deprecated)
4. **Tabla flashcards**: Datos históricos (a eliminar)
5. **ISpacedRepetitionData**: Modelo obsoleto (a eliminar)

### 🟡 Porcentaje de migración total

- **Antes de esta fase**: 60%
- **Después de esta fase**: 90%
- **Eliminación de ISpacedRepetitionData**: 100% posible en próxima fase

## Métricas de Éxito

- ✅ Todos los tests pasan
- ✅ No hay regresiones en funcionalidad existente
- ✅ Consumidores migrados a KnowledgeNode
- ✅ Algoritmo SM-2 desacoplado del dominio
- ✅ KnowledgeNode como entidad central
- ✅ Documentación actualizada

**Porcentaje de migración: 90%**

**KnowledgeNode es ahora la entidad central del dominio.**

**Flashcard es solo una representación visual, no una entidad del dominio.**

### Fase Final: Eliminación Completa del Sistema Antiguo ✅ COMPLETADA

- `contenidoProcesado` eliminado de `IMaterial`
- Tabla `flashcards` eliminada de Dexie
- Todos los servicios migrados a KnowledgeNode
- Duplicación de información eliminada
- `knowledge-node-adapter.ts` eliminado
