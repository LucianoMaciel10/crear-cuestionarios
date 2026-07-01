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

### Fase 4: Preparación para Flashcards 🚧 EN PROGRESO
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

## Próximos Pasos

### Fase 4: Finalización de Migración de Flashcards
- [ ] Implementar sincronización bidireccional entre flashcards y KnowledgeNodes
- [ ] Crear servicio de migración para convertir flashcards existentes a KnowledgeNodes
- [ ] Actualizar algoritmo SM-2 para trabajar directamente con KnowledgeNodes
- [ ] Implementar interfaz de usuario para creación manual de KnowledgeNodes

### Fase 5: Eliminación de Sistema Antiguo
- [ ] Deprecar `IFlashcard` y `ISpacedRepetitionData`
- [ ] Eliminar tabla `flashcards` de Dexie
- [ ] Actualizar todos los componentes para usar exclusivamente KnowledgeNodes

### Fase 6: Knowledge Graph
- [ ] Implementar relaciones entre nodos
- [ ] Crear visualización de grafo de conocimiento
- [ ] Implementar navegación por relaciones semánticas

## Criterios de Finalización para Fase Actual

✅ Ampliar IKnowledgeNode con campos necesarios para flashcards
✅ Crear adaptadores bidireccionales
✅ Actualizar servicios para soportar ambos sistemas
✅ Modificar componentes para usar nuevo sistema (sin breaking changes)
✅ Mantener compatibilidad con sistema antiguo
✅ Validar que todos los tests pasen
✅ Documentar cambios en MASTER_PROJECT_STATE.md

## Riesgos y Mitigaciones

1. **Breaking changes**: Mantener ambos sistemas funcionando en paralelo
2. **Duplicación de datos**: Implementar sincronización automática
3. **Performance**: Usar índices adecuados en Dexie
4. **Complejidad**: Documentar claramente el flujo de migración

## Decisiones Arquitectónicas

1. **No eliminar sistema antiguo aún**: Mantener compatibilidad durante transición
2. **Priorizar KnowledgeNodes**: Usar como fuente principal cuando disponibles
3. **Adaptadores vs Herencia**: Usar adaptadores para conversión en lugar de herencia
4. **Campos opcionales**: Permitir flexibilidad en KnowledgeNode para diferentes tipos de contenido

## Métricas de Éxito

- Todos los tests pasan
- No hay regresiones en funcionalidad existente
- KnowledgeNodes pueden ser usados como flashcards
- Sistema antiguo sigue funcionando como fallback
- Documentación actualizada