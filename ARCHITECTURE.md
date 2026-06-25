# Arquitectura del Generador Inteligente de Cuestionarios Académicos

## 1. Arquitectura General

El proyecto seguirá una arquitectura de **Aplicación de Página Única (SPA)** utilizando React y TypeScript, con Vite como herramienta de construcción y TailwindCSS para el estilado. Inicialmente, la persistencia de datos será local, utilizando IndexedDB para estructurar y almacenar los datos de manera robusta y escalable para una futura integración con un backend.

La arquitectura se dividirá en las siguientes capas lógicas:

- **Capa de Presentación (UI):** Desarrollada con React y TypeScript, utilizando componentes reutilizables y un diseño responsive para una experiencia de usuario óptima.
- **Capa de Lógica de Negocio (Servicios/Contextos):** Contendrá la lógica central de la aplicación, como la gestión de materiales, generación de preguntas, algoritmos de aprendizaje adaptativo y repetición espaciada. Se manejará a través de hooks personalizados y contextos de React para una gestión de estado eficiente.
- **Capa de Persistencia de Datos:** Abstraerá el almacenamiento de datos. Inicialmente, utilizará IndexedDB para datos estructurados y el sistema de archivos del navegador (si es posible o simulado) para archivos cargados (PDF, DOCX, etc.). Se diseñará pensando en una futura migración a una API backend.
- **Capa de Utilidades/Adaptadores:** Incluirá funciones de utilidad, formateadores de datos y adaptadores para la integración con bibliotecas externas (ej. parsers de documentos).

## 2. Flujo de Usuario

1.  **Carga de Material:** El usuario selecciona el tipo de material (texto, PDF, DOCX, TXT, Markdown) y lo carga en la aplicación.
2.  **Procesamiento de Material:** El sistema analiza el material para extraer conceptos, definiciones, relaciones, etc.
3.  **Visualización y Gestión de Cuestionarios/Flashcards:** El usuario puede visualizar el material procesado y crear nuevos cuestionarios o conjuntos de flashcards, organizándolos por materias y etiquetas.
4.  **Generación de Preguntas/Flashcards:** A partir del material procesado, el sistema genera automáticamente preguntas de diversos tipos y flashcards.
5.  **Modos de Estudio:** El usuario elige un modo de estudio (Cuestionario General, Definiciones, Práctica, Examen, Repaso Inteligente).
6.  **Interacción con Cuestionarios/Flashcards:**
    - **Cuestionarios:** Responde preguntas, recibe corrección inmediata (Modo Práctica) o al finalizar (Modo Examen), ve explicaciones.
    - **Flashcards:** Repasa conceptos, marca su nivel de conocimiento.
7.  **Resultados y Estadísticas:** Al finalizar una sesión, el usuario ve su rendimiento, estadísticas detalladas y recomendaciones de repaso.
8.  **Aprendizaje Adaptativo y Repetición Espaciada:** El sistema ajusta la dificultad, prioriza temas débiles y programa futuros repasos basándose en el rendimiento del usuario.

## 3. Estructura de Carpetas

```
├── public/
├── src/
│   ├── assets/                 # Recursos estáticos (imágenes, iconos)
│   ├── components/             # Componentes reutilizables de UI
│   │   ├── common/             # Componentes genéricos (Botones, Inputs, Modals)
│   │   └── domain/             # Componentes específicos de dominio (CardCuestionario, PreguntaDisplay)
│   ├── contexts/               # Contextos de React para gestión de estado global
│   ├── hooks/                  # Hooks personalizados
│   ├── services/               # Lógica de negocio y servicios (procesamiento de material, generación de preguntas)
│   │   ├── material-parser/    # Lógica para parsear diferentes tipos de documentos
│   │   ├── question-generator/ # Lógica para generar preguntas
│   │   ├── adaptive-learning/  # Algoritmos de aprendizaje adaptativo
│   │   └── spaced-repetition/  # Algoritmos de repetición espaciada
│   ├── data/                   # Capa de persistencia (IndexedDB wrapper, modelos de datos)
│   │   ├── models/             # Definición de modelos de datos (interfaces TypeScript)
│   │   └── db/                 # Lógica de interacción con IndexedDB
│   ├── pages/                  # Páginas principales de la aplicación (Dashboard, Cuestionario, Configuración)
│   ├── utils/                  # Funciones de utilidad (formatters, helpers)
│   ├── styles/                 # Archivos de configuración de TailwindCSS y estilos globales
│   ├── App.tsx                 # Componente principal de la aplicación
│   ├── main.tsx                # Entry point de la aplicación
│   └── vite-env.d.ts
├── ARCHITECTURE.md             # Documento de arquitectura (este archivo)
├── MASTER_PROJECT_STATE.md     # Estado actual del proyecto
├── PROJECT_SPEC.md             # Especificación del proyecto
├── README.md                   # README del proyecto
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## 4. Módulos del Sistema

- **Módulo de Gestión de Material:** Maneja la carga, el parsing y el almacenamiento del material de estudio.
  - **Submódulos:** `MaterialParser` (para PDF, DOCX, TXT, Markdown), `TextProcessor` (extracción de conceptos).
- **Módulo de Cuestionarios y Preguntas:** Gestiona la creación, edición, duplicación y eliminación de cuestionarios, así como el banco de preguntas asociado.
  - **Submódulos:** `QuestionGenerator`, `QuestionBankManager`, `QuizManager`.
- **Módulo de Flashcards:** Genera y gestiona los conjuntos de flashcards.
  - **Submódulos:** `FlashcardGenerator`, `FlashcardManager`.
- **Módulo de Modos de Estudio:** Orquesta la experiencia de usuario en los diferentes modos (Práctica, Examen, Repaso).
  - **Submódulos:** `QuizEngine`, `StudyModeCoordinator`.
- **Módulo de Corrección y Feedback:** Proporciona la lógica para evaluar respuestas, mostrar explicaciones y justificaciones.
- **Módulo de Resultados y Estadísticas:** Calcula y presenta métricas de rendimiento del usuario.
- **Módulo de Aprendizaje Adaptativo:** Implementa algoritmos para detectar fortalezas/debilidades y adaptar la experiencia.
  - **Submódulos:** `AdaptiveEngine`, `DifficultyAdjuster`, `RecommendationEngine`.
- **Módulo de Repetición Espaciada:** Gestiona la programación de repasos basada en el rendimiento del usuario.
  - **Submódulos:** `SpacedRepetitionScheduler`, `ReviewPrioritizer`.
- **Módulo de Persistencia de Datos:** Interactúa directamente con IndexedDB para el almacenamiento y recuperación de datos.
- **Módulo de UI/UX:** Proporciona la interfaz de usuario, componentes y estilos.

## 5. Modelos de Datos

Se definirán interfaces TypeScript para cada entidad principal:

- **`Material`**:
  - `id: string`
  - `nombre: string`
  - `tipo: 'texto' | 'pdf' | 'docx' | 'txt' | 'md'`
  - `contenidoOriginal: string | ArrayBuffer` (dependiendo del tipo)
  - `contenidoProcesado: { conceptos: string[], definiciones: { concepto: string, definicion: string }[], relaciones: any[] }`
  - `fechaCarga: Date`
- **`Materia`**:
  - `id: string`
  - `nombre: string`
  - `descripcion: string`
- **`Etiqueta`**:
  - `id: string`
  - `nombre: string`
- **`Cuestionario`**:
  - `id: string`
  - `nombre: string`
  - `idMateria: string`
  - `descripcion: string`
  - `etiquetas: string[]` (IDs de etiquetas)
  - `configuracion: { tiempoLimite?: number, numPreguntas?: number, tiposPregunta?: string[] }`
  - `fechaCreacion: Date`
  - `fechaActualizacion: Date`
- **`Pregunta`**:
  - `id: string`
  - `idCuestionario: string`
  - `tema: string[]`
  - `dificultad: 'facil' | 'media' | 'dificil'`
  - `tipo: 'verdadero_falso' | 'opcion_unica' | 'opcion_multiple' | 'completar_oracion' | 'completar_palabra' | 'relacionar_conceptos' | 'definicion_concepto' | 'concepto_definicion' | 'ordenar_procesos'`
  - `enunciado: string`
  - `opciones: string[]` (para opción única/múltiple)
  - `respuestaCorrecta: string | string[] | { [key: string]: string }` (tipo flexible según el tipo de pregunta)
  - `explicacion: string`
  - `justificacion: string`
  - `historialUso: { fecha: Date, acierto: boolean }[]`
- **`Flashcard`**:
  - `id: string`
  - `idMaterial: string`
  - `concepto: string`
  - `definicion: string`
  - `explicacion: string`
  - `historialRepaso: { fecha: Date, nivelDominio: number }[]` (para repetición espaciada)
- **`SesionEstudio`**:
  - `id: string`
  - `idCuestionario: string`
  - `modo: 'practica' | 'examen' | 'repaso_inteligente'`
  - `fechaInicio: Date`
  - `fechaFin: Date`
  - `tiempoTotal: number`
  - `respuestas: { idPregunta: string, respuestaUsuario: any, esCorrecta: boolean }[]`
  - `resultados: { puntaje: number, aciertos: number, errores: number, rendimientoPorTema: { tema: string, porcentaje: number }[] }`
- **`DominioTema`**: (para aprendizaje adaptativo y repetición espaciada)
  - `id: string` (ej. `userId-idMateria-tema`)
  - `idUsuario: string` (si se introduce autenticación)
  - `idMateria: string`
  - `tema: string`
  - `nivelDominio: number` (0-1, representa la fuerza del recuerdo)
  - `fechaUltimoRepaso: Date`
  - `fechaProximoRepaso: Date`
  - `factorRepeticion: number` (algoritmo SM-2 o similar)

## 6. Estrategia de Persistencia

Inicialmente, se utilizará **IndexedDB** para almacenar todos los datos estructurados de la aplicación (Material, Cuestionarios, Preguntas, Flashcards, Sesiones, DominioTema).

- **Ventajas:** Mayor capacidad de almacenamiento que LocalStorage, soporte para datos estructurados, APIs asíncronas, adecuado para aplicaciones offline.
- **Librería:** Se utilizará una librería wrapper como `Dexie.js` o una implementación personalizada para simplificar la interacción con IndexedDB y proporcionar una API más amigable, abstraer la complejidad y facilitar una futura migración a un backend.
- **Almacenamiento de archivos:** Para PDFs, DOCX, etc., se explorará el uso de `FileReader` para cargar el contenido y, si es necesario almacenar los archivos completos (aunque el `contenidoProcesado` es más crucial), se podría considerar el uso de la API `FileSystem` del navegador (con limitaciones de compatibilidad y seguridad) o almacenar el `ArrayBuffer` directamente en IndexedDB si el tamaño lo permite. Se priorizará almacenar el texto extraído y los metadatos relevantes.

## 7. Estrategia para Generación de Preguntas

La generación de preguntas será un proceso en dos fases:

1.  **Extracción de Información (Material Parsing):**
    - Se desarrollarán parsers para cada tipo de documento (PDF, DOCX, TXT, Markdown). Bibliotecas como `pdf.js` para PDF, `mammoth.js` para DOCX y `marked.js` para Markdown serán exploradas.
    - Una vez extraído el texto plano, se utilizarán técnicas de **Procesamiento de Lenguaje Natural (NLP) básicas** (o librerías JS simples que permitan esto, como `compromise` o `natural`) para identificar:
      - **Conceptos Clave:** Sustantivos, frases nominales.
      - **Definiciones:** Patrones lingüísticos como "es un...", "se define como...", "significa que...".
      - **Relaciones:** Conectores lógicos, verbos de relación.
      - **Clasificaciones, Procesos, Fechas, Fórmulas:** Mediante patrones regex y análisis contextual.
2.  **Generación de Preguntas a partir de Información Estructurada:**
    - **Verdadero o Falso:** A partir de afirmaciones directas extraídas del texto. Se generará una afirmación correcta y se creará una versión modificada para la opción falsa.
    - **Opción Única/Múltiple:**
      - **Pregunta:** Un concepto.
      - **Respuesta Correcta:** Su definición o una característica principal.
      - **Distractores:** Definiciones o características de conceptos relacionados pero incorrectos, o variaciones sutiles de la respuesta correcta.
    - **Completar Oración/Palabra:** A partir de oraciones clave donde se omite un concepto o una palabra importante.
    - **Relacionar Conceptos/Definiciones:** Extraer pares de concepto-definición o concepto-relación y pedir al usuario que los empareje.
    - **Ordenar Procesos:** Identificar listas de pasos o secuencias temporales para crear preguntas de ordenamiento.
    - **Definición → Concepto / Concepto → Definición:** Invertir la relación para crear diferentes tipos de preguntas.

**Consideraciones:**

- **Heurísticas y Reglas:** Se basará en reglas heurísticas y patrones lingüísticos definidos.
- **Calidad de la Generación:** La calidad inicial dependerá de la complejidad del texto y de la sofisticación de los patrones NLP. Se preverá que los usuarios puedan editar y mejorar las preguntas generadas.
- **Escalabilidad Futura:** Se diseñará la lógica de generación para ser modular, lo que permitiría en el futuro integrar modelos de lenguaje (LLMs) más avanzados (vía API a un backend) para una generación de preguntas más sofisticada y contextual.

## 8. Estrategia para Flashcards

La generación de flashcards será un subproducto del proceso de extracción de información del material.

- **Identificación Automática:** Se identificarán pares "concepto-definición" durante el análisis del material. Cada par formará la base de una flashcard.
- **Estructura de Flashcard:**
  - **Frente:** El concepto (ej. "Fotosíntesis").
  - **Dorso:** La definición y una explicación concisa (ej. "Proceso bioquímico mediante el cual las plantas, algas y algunas bacterias transforman la energía luminosa en energía química, sintetizando compuestos orgánicos a partir de dióxido de carbono y agua.").
- **Edición por el Usuario:** El usuario tendrá la capacidad de editar, agregar o eliminar flashcards generadas automáticamente, o crear nuevas desde cero.
- **Organización:** Las flashcards se organizarán por materia y etiquetas, al igual que los cuestionarios.

## 9. Estrategia para Aprendizaje Adaptativo

El sistema de aprendizaje adaptativo se basará en el rendimiento del usuario en los cuestionarios y el repaso de flashcards.

- **Medición del Dominio por Tema:**
  - Para cada tema (`DominioTema`), se mantendrá un `nivelDominio` (un valor numérico entre 0 y 1) que representa la fuerza del recuerdo del usuario sobre ese tema.
  - Este nivel se actualizará después de cada pregunta o flashcard respondida, aumentando si la respuesta es correcta y disminuyendo si es incorrecta. La magnitud del cambio dependerá de la dificultad de la pregunta y la confianza del sistema en la respuesta.
- **Detección de Fortalezas y Debilidades:**
  - Los temas con `nivelDominio` alto se considerarán fortalezas.
  - Los temas con `nivelDominio` bajo se considerarán debilidades.
- **Recomendación de Repasos:**
  - Basándose en los `DominioTema`, el sistema recomendará activamente los temas o preguntas donde el usuario muestra debilidad.
  - Se implementará un algoritmo que priorice los ítems con un `nivelDominio` más bajo y aquellos cuyo `fechaProximoRepaso` (del algoritmo de repetición espaciada) sea inminente.
- **Adaptación de Dificultad:**
  - En los modos de estudio adaptativos, el sistema ajustará la dificultad de las preguntas presentadas.
  - Si el usuario muestra alto dominio en un tema, se presentarán preguntas más complejas o avanzadas sobre ese tema.
  - Si el usuario tiene dificultades, se presentarán preguntas más básicas o se repetirá material previamente fallado.
  - Esto se hará seleccionando preguntas del banco de preguntas que coincidan con el nivel de dificultad adaptado.

## 10. Estrategia para Repetición Espaciada

Se implementará un algoritmo de repetición espaciada, similar al algoritmo **SM-2** (SuperMemo-2), o una variante simplificada, para programar los repasos de flashcards y preguntas.

- **Componentes Clave:**
  - **`nivelDominio`:** La fuerza del recuerdo para un ítem (pregunta o flashcard).
  - **`fechaUltimoRepaso`:** La fecha en que el ítem fue revisado por última vez.
  - **`fechaProximoRepaso`:** La fecha calculada para el siguiente repaso del ítem.
  - **`factorRepeticion` (EF - E-Factor):** Un valor que indica la facilidad con la que se recuerda un ítem. Se ajusta después de cada repaso.
  - **`intervalo`:** El número de días hasta el próximo repaso.

- **Funcionamiento Básico (inspirado en SM-2):**
  1.  Cuando un usuario responde una pregunta o flashcard, se le pedirá que califique su conocimiento (ej. del 0 al 5, donde 5 es recuerdo perfecto y 0 es olvido total).
  2.  Basado en esta calificación (o automáticamente según acierto/error), se actualizará el `factorRepeticion` y se recalculará el `intervalo` para el próximo repaso.
      - Si la respuesta es correcta y fácil, el `intervalo` aumentará significativamente.
      - Si es correcta pero difícil, el `intervalo` aumentará menos.
      - Si es incorrecta, el `intervalo` se reiniciará (próximo repaso muy pronto) y el `factorRepeticion` disminuirá.
  3.  El `fechaProximoRepaso` se calculará como `fechaUltimoRepaso + intervalo`.
  4.  El sistema priorizará la presentación de preguntas y flashcards cuya `fechaProximoRepaso` ha llegado o está próxima.

- **Integración con Aprendizaje Adaptativo:** La repetición espaciada se integrará con el aprendizaje adaptativo, de modo que los ítems que el algoritmo de repetición espaciada determine que necesitan repaso (porque su `fechaProximoRepaso` ha llegado) serán priorizados en los modos de estudio adaptativos.

## 11. Riesgos Técnicos

- **Calidad de la Extracción de Información:** La precisión en la extracción de conceptos, definiciones y relaciones de documentos no estructurados (PDF, DOCX) es un desafío. Las librerías de parsing pueden tener limitaciones y el procesamiento NLP en el cliente es limitado. Esto puede llevar a una generación de preguntas de baja calidad si no se calibra bien.
- **Complejidad de la Generación de Preguntas:** Implementar la lógica para generar una variedad de tipos de preguntas de alta calidad a partir de texto plano es complejo y requiere un ajuste fino de reglas y patrones.
- **Rendimiento de IndexedDB:** Aunque IndexedDB es potente, una base de datos muy grande o consultas ineficientes podrían afectar el rendimiento de la aplicación, especialmente en dispositivos menos potentes.
- **Sincronización y Escalabilidad a Backend:** Aunque no es un requisito inicial, diseñar la persistencia para una futura migración a un backend sin una estrategia clara desde el principio podría generar retrabajo significativo.
- **Algoritmos de Aprendizaje Adaptativo/Repetición Espaciada:** La implementación correcta y el ajuste fino de estos algoritmos para que sean efectivos y no frustren al usuario es un desafío algorítmico y de UX.
- **Compatibilidad de Navegadores:** Las APIs del navegador (IndexedDB, FileReader, potencialmente FileSystem) pueden tener variaciones de comportamiento entre navegadores.

## 12. Plan de Implementación por Fases

### Fase 1: Core de Gestión de Material y Cuestionarios (MVP)

- **Módulo de Material:** Carga de texto manual y archivos TXT/Markdown. Extracción básica de conceptos y definiciones.
- **Módulo de Cuestionarios:** CRUD de cuestionarios (crear, editar, eliminar, duplicar). Organización por materia y etiquetas.
- **Banco de Preguntas Básico:** Generación de preguntas de Verdadero/Falso y Opción Única simples a partir de conceptos/definiciones.
- **Persistencia:** Configuración inicial de IndexedDB para Material, Cuestionarios y Preguntas.
- **UI/UX:** Diseño base, componentes reutilizables, navegación principal.
- **Modo de Estudio:** Implementación del "Modo Práctica" (sin tiempo, corrección inmediata).
- **Resultados:** Visualización básica de puntaje y aciertos/errores.

### Fase 2: Expansión de Generación y Modos de Estudio

- **Módulo de Material:** Incorporación de parsing para PDF y DOCX.
- **Banco de Preguntas:** Implementación de más tipos de preguntas (Opción Múltiple, Completar Oración/Palabra, Relacionar). Mejora en la calidad de la generación.
- **Módulo de Flashcards:** Generación automática de flashcards a partir del material. Gestión de flashcards.
- **Modos de Estudio:** Implementación de "Modo Examen" (tiempo limitado, resultados al finalizar) y "Modo Definiciones".
- **Corrección:** Adición de explicaciones y justificaciones detalladas para las respuestas.

### Fase 3: Aprendizaje Inteligente

- **Aprendizaje Adaptativo:** Implementación de la medición de dominio por tema y adaptación de dificultad.
- **Repetición Espaciada:** Implementación del algoritmo SM-2 o similar para flashcards y preguntas.
- **Modo Repaso Inteligente:** Integración de aprendizaje adaptativo y repetición espaciada para priorizar repasos.
- **Estadísticas Avanzadas:** Gráficos y visualizaciones de rendimiento, evolución, fortalezas/debilidades.
- **Gamificación (Opcional):** Implementación de rachas y logros básicos.

### Fase 4: Optimización y Escalabilidad

- **Rendimiento:** Optimización de IndexedDB, carga de datos y procesamiento de material.
- **UX/UI:** Mejoras de usabilidad, pulido de la interfaz, modo oscuro/claro.
- **Consideraciones de Escalabilidad:** Refactorización de la capa de persistencia para facilitar una futura migración a un backend (aunque no se implemente en esta fase).
- **Pruebas:** Cobertura exhaustiva de pruebas unitarias y de integración.

---

## Decisiones Arquitectónicas Clave

1.  **SPA con React/TypeScript/Vite/TailwindCSS:** Se eligió esta pila por su modernidad, rendimiento y capacidad de construir interfaces de usuario complejas de manera eficiente.
2.  **Persistencia Local con IndexedDB:** Decisión inicial para mantener la aplicación completamente del lado del cliente, permitiendo un desarrollo rápido y funcionalidades offline, con una capa de abstracción para facilitar una futura migración a backend.
3.  **Enfoque Heurístico y de Patrones para Generación de Preguntas:** Ante la ausencia inicial de un backend con LLMs, se opta por un enfoque basado en NLP básico y reglas heurísticas para la extracción y generación, reconociendo que la calidad será progresiva y mejorable.
4.  **Modularidad y Capas Claras:** La división del sistema en módulos y capas bien definidas (presentación, lógica de negocio, persistencia) asegura la mantenibilidad, escalabilidad y la capacidad de intercambiar componentes (ej. un día, la persistencia IndexedDB por una API REST).
5.  **Algoritmos Estándar para Aprendizaje (SM-2):** La elección de un algoritmo probado como SM-2 para repetición espaciada proporciona una base sólida para la funcionalidad de aprendizaje inteligente, que se complementará con lógica adaptativa personalizada.
6.  **Enfoque Iterativo por Fases:** El plan de implementación se divide en fases para construir un MVP funcional rápidamente y luego añadir funcionalidades más complejas (aprendizaje inteligente) de forma incremental, gestionando los riesgos técnicos.
