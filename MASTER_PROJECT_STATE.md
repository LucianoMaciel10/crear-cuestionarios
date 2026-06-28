# Estado del Proyecto: Generador Inteligente de Cuestionarios Académicos

## Estado General

Proyecto en desarrollo activo. Pipeline de procesamiento de texto funcional e infraestructura de navegación completa.

- **Fase actual:** Fase 2 (Procesamiento de Materiales)
- **Avance aproximado:** 45%

## Arquitectura

SPA React + TypeScript + Vite + TailwindCSS. Persistencia local mediante Dexie.js (IndexedDB).

### Árbol Principal

- `src/components/`: common, domain, layout
- `src/hooks/`: useMaterials, useSubjects
- `src/pages/`: Dashboard, MaterialsPage, NotFoundPage
- `src/routes/`: index.tsx (Router configuración)
- `src/services/`: material.service, material-parser/

### Modelos de datos

- `IMaterial`, `IMateria`, `IEtiqueta`, `IRelacion`

### Hooks

- `useSubjects`: Gestión CRUD materias.
- `useMaterials`: Gestión CRUD materiales + pipeline de procesamiento.

### Servicios

- `subject.service`: Gestión persistencia materias.
- `material.service`: Orquestador de pipeline (parseText -> processText -> Dexie).
- `material-parser/text-parser`: Extracción de texto plano.
- `material-parser/text-processor`: Análisis NLP básico.

### Flujo de procesamiento

1. `AddMaterialModal` recibe texto -> 2. `MaterialsPage` invoca `useMaterials` -> 3. `material.service` -> 4. `parseText` -> 5. `processText` -> 6. Guardado en Dexie.

## Funcionalidades

- **Terminadas:** Gestión de materias (CRUD), Sistema de rutas (Router), Visualización de materiales, Pipeline de procesamiento (MVP).
- **Parcialmente terminadas:** Generación de cuestionarios (pendiente), Aprendizaje adaptativo (pendiente).

## Problemas conocidos

- Problema visual en renderizado de listas en `MaterialCard` (texto blanco sobre fondo claro). Requiere inspección de estilos CSS/Tailwind.

## Decisiones técnicas

- Uso de `crypto.randomUUID()` para generación de IDs nativos.
- Implementación de un pipeline secuencial centralizado en `material.service`.

## Próxima tarea

- Implementar Banco de Preguntas Básico (Fase 2).

## Estado Actual del Proyecto

El proyecto ha completado:

1. **Diseño de Arquitectura** (aprobado en ARCHITECTURE.md)
2. **Planificación de Implementación** (documentada en ROADMAP.md)
3. **Reglas de Desarrollo** (establecidas en DEVELOPMENT_RULES.md)
4. **Fase 0 - Configuración Base**
5. **Fase 1 - Gestión de Materias y Navegación** (incluyendo configuración de Vitest)
   - ✅ Configuración de Vitest completada
   - ✅ Pruebas unitarias básicas configuradas

## Próximos Pasos

Iniciar **Fase 2 - Carga y Almacenamiento de Material (Texto/TXT)** y **Banco de Preguntas Básico** según ROADMAP.md

## Historial de Cambios

- 2025-02-23: Configuración de scripts de test (Vitest) en `package.json` completada.
- 2023-11-20: Instalación de dependencias completada
- 2023-11-20: Verificación de compilación y type-check exitosos
- 2023-11-20: Completados modelos de datos y configuración DB
- 2023-11-20: Configuración inicial de TailwindCSS
- 2023-11-19: Aprobación final de arquitectura

## ⚠️ Funcionalidades Pendientes

- Escritura de pruebas unitarias adicionales para componentes críticos.
- Documentación final del proyecto (README, diagramas).

## 🔜 Próximas Tareas (Fase 2)

- **Módulo de Material:** Carga de texto manual y archivos TXT/Markdown. Extracción básica de conceptos y definiciones.
- **Módulo de Cuestionarios:** CRUD de cuestionarios (crear, editar, eliminar, duplicar). Organización por materia y etiquetas.
- **Banco de Preguntas Básico:** Generación de preguntas de Verdadero/Falso y Opción Única simples a partir de conceptos/definiciones.
- **Persistencia:** Configuración inicial de IndexedDB para Material, Cuestionarios y Preguntas.
- **UI/UX:** Diseño base, componentes reutilizables, navegación principal.
- **Modo de Estudio:** Implementación del "Modo Práctica" (sin tiempo, corrección inmediata).
- **Resultados:** Visualización básica de puntaje y aciertos/errores.

## ❗ Problemas Conocidos
