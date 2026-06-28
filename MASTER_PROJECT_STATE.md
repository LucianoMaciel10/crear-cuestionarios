# Estado del Proyecto: Generador Inteligente de Cuestionarios Académicos

## Estado General

Proyecto en desarrollo activo. Pipeline de procesamiento de texto (carga + extracción básica) funcional e infraestructura de navegación completa.

- **Fase actual:** Fase 4 (Banco de Preguntas y Generación Automática - V/F) - COMPLETADA
- **Avance aproximado:** 50%

## Arquitectura

SPA React + TypeScript + Vite + TailwindCSS. Persistencia local mediante Dexie.js (IndexedDB).

### Árbol Principal

- `src/components/`: common, domain, layout
- `src/hooks/`: useMaterials, useSubjects
- `src/pages/`: Dashboard, MaterialsPage, NotFoundPage, QuizManagement
- `src/routes/`: index.tsx (Router configuración)
- `src/services/`: material.service, material-parser/, question.service, question-generator/

### Modelos de datos

- `IMaterial`, `IMateria`, `IEtiqueta`, `IQuestion`, `IRelacion`

### Hooks

- `useSubjects`: Gestión CRUD materias.
- `useMaterials`: Gestión CRUD materiales + pipeline de procesamiento.

### Servicios

- `subject.service`: Gestión persistencia materias.
- `material.service`: Orquestador de pipeline (parseText -> processText -> Dexie).
- `material-parser/text-parser`: Extracción de texto plano.
- `material-parser/text-processor`: Análisis NLP básico.
- `question.service`: Gestión persistencia preguntas.
- `question-generator/boolean-generator`: Generación de preguntas Verdadero/Falso.

### Flujo de procesamiento

1. `AddMaterialModal` recibe texto -> 2. `MaterialsPage` invoca `useMaterials` -> 3. `material.service` -> 4. `parseText` -> 5. `processText` -> 6. Guardado en Dexie.

## Funcionalidades

- **Terminadas:**
  - Gestión de materias (CRUD).
  - Sistema de rutas (Router).
  - Visualización de materiales.
  - Carga de material de texto (Fase 2 del ROADMAP).
  - Procesamiento/extracción básica de conceptos (Fase 3 del ROADMAP - MVP).
  - Banco de preguntas y generación automática V/F (Fase 4 del ROADMAP - COMPLETADA).
- **Parcialmente terminadas / pendientes:**
  - Generación de cuestionarios (pendiente).
  - Aprendizaje adaptativo (pendiente).

## Problemas conocidos

_(Sin problemas conocidos activos al momento de esta actualización.)_

## Decisiones técnicas

- Uso de `crypto.randomUUID()` para generación de IDs nativos.
- Implementación de un pipeline secuencial centralizado en `material.service`.

## Próxima tarea

- **Fase 5 del ROADMAP — Modo de Estudio: Práctica:**
  - Crear `src/pages/QuizPlayer.tsx`.
  - Crear `src/components/domain/QuestionCard.tsx`.
  - Crear `src/hooks/useQuizEngine.ts`.
  - **Criterio de finalización:** Flujo completo de responder pregunta -> ver corrección -> pasar a la siguiente.

## Próximos Pasos (orden según ROADMAP.md)

1. Completar **Fase 5 - Modo de Estudio: Práctica**.
2. Continuar con **Fase 6 - Flashcards y Repetición Espaciada (Básico)**.
3. Continuar con **Fase 7 - Estadísticas y Aprendizaje Adaptativo**.

> Nota: el detalle completo de cada fase (archivos a crear, componentes involucrados, criterios de finalización, riesgos) vive únicamente en `ROADMAP.md`. Este documento no debe repetir ni reinterpretar ese contenido — solo debe indicar en qué fase está el proyecto y qué falta de la fase actual.

## Pendiente de decisión

_(Sin items pendientes al momento de esta actualización. Usar esta sección para registrar cualquier ambigüedad o conflicto entre documentos que surja durante el desarrollo, hasta que se resuelva explícitamente.)_

## Historial de Cambios

- 2025-02-23: Configuración de scripts de test (Vitest) en `package.json` completada.
- 2023-11-20: Instalación de dependencias completada.
- 2023-11-20: Verificación de compilación y type-check exitosos.
- 2023-11-20: Completados modelos de datos y configuración DB.
- 2023-11-20: Configuración inicial de TailwindCSS.
- 2023-11-19: Aprobación final de arquitectura.
- 2025-02-23: Completada la generación y persistencia de preguntas Verdadero/Falso (Fase 4).

## ⚠️ Funcionalidades Pendientes

- Modo de Estudio: Práctica (Fase 5).
- Flashcards y Repetición Espaciada (Fase 6).
- Escritura de pruebas unitarias adicionales para componentes críticos.
- Documentación final del proyecto (README, diagramas).

## ❗ Problemas Conocidos

_(Sin problemas conocidos activos.)_
