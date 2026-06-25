# PROJECT_SPEC.md

# Generador Inteligente de Cuestionarios Académicos

## Objetivo

Desarrollar una aplicación web que permita transformar material de estudio académico en cuestionarios interactivos, flashcards y sistemas de repaso inteligente para facilitar el aprendizaje universitario.

La aplicación debe ayudar a los estudiantes a:

* Estudiar materias universitarias.
* Detectar debilidades.
* Practicar mediante cuestionarios.
* Reforzar conceptos difíciles.
* Mejorar la retención de conocimiento.

---

# Tecnologías

* React
* TypeScript
* Vite
* TailwindCSS

Persistencia local inicialmente mediante:

* LocalStorage o IndexedDB

La arquitectura debe ser escalable para permitir backend futuro.

---

# Gestión de Material de Estudio

El usuario debe poder cargar:

* Texto manual.
* PDF.
* DOCX.
* TXT.
* Markdown.

El sistema debe analizar el contenido y detectar:

* Conceptos.
* Definiciones.
* Relaciones.
* Clasificaciones.
* Procesos.
* Fórmulas.
* Fechas.
* Temas principales.

---

# Gestión de Cuestionarios

Los usuarios deben poder:

* Crear cuestionarios.
* Editar cuestionarios.
* Duplicar cuestionarios.
* Eliminar cuestionarios.
* Organizar por materias.
* Organizar por etiquetas.

Cada cuestionario debe tener:

* Nombre.
* Materia.
* Descripción.
* Etiquetas.
* Configuración.

---

# Banco de Preguntas

Cada cuestionario debe generar y almacenar un banco de preguntas reutilizable.

Las preguntas deben poder clasificarse por:

* Tema.
* Dificultad.
* Tipo.
* Historial de uso.

---

# Tipos de Preguntas

* Verdadero o falso.
* Opción única.
* Opción múltiple.
* Completar oración.
* Completar palabra.
* Relacionar conceptos.
* Relacionar definiciones.
* Ordenar procesos.
* Definición → Concepto.
* Concepto → Definición.
* Preguntas avanzadas que combinen múltiples conceptos.

---

# Modos de Estudio

## Cuestionario General

Utiliza todos los tipos de preguntas.

## Modo Definiciones

Enfocado en conceptos y definiciones.

## Modo Práctica

* Sin límite de tiempo.
* Corrección inmediata.
* Explicaciones instantáneas.

## Modo Examen

* Tiempo limitado.
* Resultados al finalizar.

## Modo Repaso Inteligente

* Prioriza errores previos.
* Prioriza conceptos débiles.

---

# Corrección

Cada pregunta debe almacenar:

* Respuesta correcta.
* Explicación.
* Justificación.
* Tema relacionado.

El objetivo es enseñar además de evaluar.

---

# Resultados

Mostrar:

* Puntaje.
* Tiempo utilizado.
* Aciertos.
* Errores.
* Porcentaje.
* Rendimiento por tema.

---

# Flashcards

Generar flashcards automáticamente desde el material.

Cada flashcard debe incluir:

* Concepto.
* Definición.
* Explicación.

---

# Aprendizaje Adaptativo

El sistema debe:

* Detectar fortalezas.
* Detectar debilidades.
* Medir dominio por tema.
* Recomendar repasos.
* Adaptar dificultad.

---

# Repetición Espaciada

Implementar un sistema de repaso inspirado en técnicas de repetición espaciada.

Debe:

* Programar repasos.
* Priorizar conceptos olvidados.
* Mantener historial de dominio.

---

# Estadísticas

Mostrar:

* Evolución del rendimiento.
* Historial de intentos.
* Temas dominados.
* Temas débiles.
* Tiempo promedio.
* Porcentaje de aciertos.

---

# Gamificación

Opcionalmente incluir:

* Rachas.
* Logros.
* Insignias.
* Objetivos diarios.

---

# Requisitos de UX

* Responsive.
* Modo oscuro.
* Modo claro.
* Interfaz moderna.
* Navegación intuitiva.
* Componentes reutilizables.
* Diseño profesional.

---

# Objetivo Final

Crear una plataforma educativa comparable a Quizlet y Anki, enfocada en estudiantes universitarios y diseñada para maximizar la comprensión y retención del conocimiento.
