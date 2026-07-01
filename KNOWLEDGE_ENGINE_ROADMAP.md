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

- **Fase Actual**: Consolidación del dominio de repetición espaciada
- KnowledgeNode como entidad central para algoritmos de aprendizaje
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

### Fase 6: Consolidación del Dominio de Repetición Espaciada ✅ COMPLETADA

**Nuevo modelo de KnowledgeNode:**
