# Reglas de Desarrollo del Generador de Cuestionarios

## 1. Convenciones de Nombres

### Archivos

- Componentes React: `PascalCase.tsx` (ej. `QuestionCard.tsx`)
- Hooks: `useCamelCase.ts` (ej. `useQuestionGenerator.ts`)
- Servicios: `camelCase.service.ts` (ej. `materialParser.service.ts`)
- Modelos: `PascalCase.model.ts` (ej. `Question.model.ts`)

### Estructuras de Código

- Interfaces: prefijo `I` (ej. `IQuestion`)
- Tipos: sufijo `Type` (ej. `QuestionType`)
- Enums: PascalCase (ej. `QuestionDifficulty`)

---

## 2. Estándares TypeScript

- Tipado estricto obligatorio.
- No usar `any` (usar `unknown` con type guards cuando sea necesario).
- Preferir interfaces para representar entidades de dominio.
- Utilizar type guards para validaciones.
- Evitar non-null assertions (`!`) salvo casos excepcionales justificados.
- Mantener separación clara entre tipos de dominio y tipos de UI.

---

## 3. Estándares React

### Componentes

- Utilizar Functional Components.
- Props tipadas explícitamente.
- Evitar prop drilling excesivo.
- Mover lógica compleja a hooks personalizados.
- Mantener componentes pequeños y reutilizables.

### Hooks

- Un hook por archivo.
- Prefijo `use` obligatorio.
- Devolver objetos en lugar de tuplas cuando sea posible.
- Mantener una única responsabilidad por hook.

---

## 4. Reglas de Arquitectura

- Respetar estrictamente la estructura definida en `ARCHITECTURE.md`.
- La capa UI no debe acceder directamente a IndexedDB.
- La lógica de negocio debe residir en servicios y hooks.
- Mantener dependencias unidireccionales entre capas.
- Evitar acoplamientos innecesarios.
- No introducir librerías sin una justificación clara.

---

## 5. Persistencia (IndexedDB)

- Utilizar Dexie.js como capa de acceso.
- Versionar los esquemas.
- Implementar migraciones cuando cambie la estructura de datos.
- Mantener IndexedDB como una capa de persistencia, no de lógica de negocio.
- Preparar la estructura para una futura migración a backend.

---

## 6. Componentes Reutilizables

- Deben ser independientes del dominio cuando sea posible.
- Aceptar únicamente las props necesarias.
- Evitar duplicación de componentes similares.
- Documentar componentes complejos mediante JSDoc cuando sea necesario.
- Utilizar TailwindCSS siguiendo patrones consistentes.

---

## 7. Prevención de Deuda Técnica

- Revisar manualmente los cambios grandes antes de aceptarlos.
- Documentar TODOs importantes.
- Evitar soluciones temporales sin documentación.
- Registrar deuda técnica relevante en `MASTER_PROJECT_STATE.md`.
- Priorizar mantenibilidad sobre velocidad de implementación.

---

## 8. Documentación Interna

- Utilizar JSDoc en funciones públicas importantes.
- Los comentarios deben explicar el "por qué", no el "qué".
- Documentar decisiones arquitectónicas relevantes.
- Mantener actualizados los documentos del proyecto.
- No dejar documentación obsoleta.

---

## 9. Compatibilidad con Backend Futuro

- Toda persistencia debe pasar por servicios.
- Evitar dependencias directas de IndexedDB en la UI.
- Diseñar interfaces que permitan reemplazar fácilmente la fuente de datos.
- Preparar la arquitectura para una futura API REST o GraphQL.
- Evitar decisiones que dificulten la sincronización futura.

---

## 10. Testing

- Utilizar Jest y Testing Library.
- Mantener cobertura razonable en funcionalidades críticas.
- Crear tests de integración para flujos importantes.
- Mockear dependencias externas.
- Priorizar calidad de tests sobre cantidad.

---

## 11. Manejo de Errores

- Utilizar Error Boundaries en React cuando corresponda.
- Centralizar errores comunes.
- Mostrar mensajes claros al usuario.
- Diferenciar errores recuperables de errores críticos.
- Registrar errores relevantes para diagnóstico.

---

## 12. Accesibilidad

- Utilizar atributos ARIA cuando corresponda.
- Mantener contraste adecuado.
- Garantizar navegación mediante teclado.
- Utilizar HTML semántico.
- Considerar accesibilidad desde el inicio y no como una mejora posterior.

---

## 13. Rendimiento

- Implementar lazy loading cuando sea apropiado.
- Evitar renders innecesarios.
- Memoizar únicamente cuando aporte beneficios reales.
- Optimizar listas grandes mediante virtualización si fuera necesario.
- Medir antes de optimizar.

---

## 14. Actualización Obligatoria de Estado del Proyecto

### Por Fase Completada

- Actualizar `MASTER_PROJECT_STATE.md`.
- Registrar fecha y resumen de cambios.
- Marcar claramente el avance de la fase.

### Por Funcionalidad Importante

- Registrar la funcionalidad implementada.
- Documentar cualquier impacto relevante.

### Cambios Arquitectónicos

- Actualizar inmediatamente `ARCHITECTURE.md`.
- Registrar la decisión tomada y su motivo.

### Cambios en Planificación

- Actualizar `ROADMAP.md`.
- Documentar el motivo del cambio.

### Regla Fundamental

Ninguna tarea se considera finalizada hasta que:

- El código compila correctamente.
- No existen errores TypeScript.
- La documentación está actualizada.
- El estado del proyecto refleja los cambios realizados.

---

## 15. Implementación por Fases

- Nunca implementar más de una fase del ROADMAP en una misma tarea.
- Antes de comenzar una fase releer:
  - `PROJECT_SPEC.md`
  - `ARCHITECTURE.md`
  - `ROADMAP.md`
  - `DEVELOPMENT_RULES.md`
  - `MASTER_PROJECT_STATE.md`
- Completar la fase actual antes de avanzar a la siguiente.
- Evitar implementar funcionalidades futuras "por adelantado".

### Al finalizar cada fase

- Verificar compilación.
- Verificar TypeScript.
- Verificar estructura de carpetas.
- Actualizar documentación.
- Actualizar `MASTER_PROJECT_STATE.md`.

---

## 16. Modificación de Archivos

- Antes de crear un archivo nuevo verificar si ya existe uno equivalente.
- Evitar duplicar lógica.
- Evitar crear múltiples versiones del mismo componente.
- Priorizar reutilización sobre duplicación.
- Mantener consistencia con la arquitectura definida.
- Refactorizar cuando sea necesario en lugar de copiar código.

---

## 17. Principio General del Proyecto

Las decisiones deben priorizar:

1. Correctitud.
2. Mantenibilidad.
3. Escalabilidad.
4. Experiencia de usuario.
5. Rendimiento.

La velocidad de desarrollo nunca debe comprometer la calidad de la arquitectura ni la capacidad futura de evolución del sistema.