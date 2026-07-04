# BUG ANALYSIS REPORT

## BUG 1: Material aparece antes de que termine el procesamiento

### Flujo Actual
1. **Subo un PPTX** → `AddMaterialModal.handleGuardar()`
2. **Procesamiento por lotes** → `processBatchMaterials()`
3. **Creación de materiales** → `BatchProcessor.createMaterials()`
   - Se crea el material con `processingStatus: "pending"`
   - Se agrega a IndexedDB
4. **MaterialCard se renderiza** → `useLiveQuery` detecta el nuevo material
   - Muestra "Conceptos: 0", "Definiciones: 0", "Procesado correctamente"
5. **Procesamiento continúa** → `BatchProcessor.processFiles()`
   - Lectura de archivos
   - Conversión a Markdown
   - Construcción de Corpus
   - Extracción de conocimiento
   - Generación de KnowledgeNodes
   - Generación de preguntas
   - Finalización
6. **Actualización de estado** → `updateMaterialProcessingStatus(materialId, "completed", ...)`
   - Se actualiza `processingStatus` a "completed"
   - Se actualizan `conceptCount`, `definitionCount`, `questionCount`
7. **UI no se actualiza** → `MaterialCard` no refleja los cambios

### Causa Raíz
El problema es que `MaterialCard` carga los `KnowledgeNodes` una sola vez al montarse, pero no se actualiza cuando los datos en IndexedDB cambian. Aunque `useLiveQuery` en `useMaterials` actualiza la lista de materiales, `MaterialCard` no tiene un mecanismo para volver a cargar los `KnowledgeNodes` cuando el estado del material cambia.

### Solución Propuesta
1. **Usar `useLiveQuery` en `MaterialCard`** para escuchar cambios en los `KnowledgeNodes` asociados al material.
2. **Actualizar el estado visual** para reflejar el estado real del procesamiento.
3. **Asegurar que `MaterialCard` se actualice** cuando `processingStatus` cambie.

## BUG 2: Barra de progreso del modal nunca termina correctamente

### Flujo Actual
1. **Modal muestra etapas** → `AddMaterialModal` renderiza `processingStages`
2. **Procesamiento avanza** → `BatchProcessor.updateStage()`
3. **Etapas se actualizan** → `setProcessingStages(stages)`
4. **Modal se cierra** → `onClose()` se llama antes de que "Finalización" llegue a "completed"

### Causa Raíz
El problema es que `handleGuardar` en `AddMaterialModal` cierra el modal inmediatamente después de que `onBatchAdd` termina, sin esperar a que todas las etapas se completen correctamente. Además, el intervalo que actualiza el progreso se limpia antes de que la última etapa se marque como "completed".

### Solución Propuesta
1. **Esperar a que todas las etapas estén completas** antes de cerrar el modal.
2. **Asegurar que "Finalización" llegue a "completed"** antes de cerrar el modal.
3. **Mostrar todas las etapas correctamente** en la UI.

## BUG 3: Material desaparece al actualizar

### Flujo Actual
1. **URL inicial** → `/materiales/{idMateria}`
2. **Click en material** → `navigate(`/materiales/${material.id}`)`
3. **URL cambia** → `/materiales/{idMaterial}`
4. **Actualizar página** → React Router intenta cargar `MaterialsPage` con `idMaterial` como `subjectId`
5. **Material desaparece** → `useMaterials(subjectId)` no encuentra materiales para `idMaterial`

### Causa Raíz
El problema es que `MaterialCard` navega a `/materiales/{idMaterial}`, reemplazando el `idMateria` por el `idMaterial`. Esto rompe la navegación porque `MaterialsPage` espera un `subjectId` para cargar los materiales.

### Solución Propuesta
1. **Cambiar la navegación** para que conserve el `idMateria`.
2. **Usar una ruta como** `/materiales/{idMateria}/material/{idMaterial}`.
3. **Asegurar que la URL nunca reemplace** el `idMateria` por el `idMaterial`.

## BUG 4: Race condition entre React e IndexedDB

### Flujo Actual
1. **Material se crea** → `createMaterial()`
2. **Material se agrega a IndexedDB** → `db.materiales.add(material)`
3. **React renderiza `MaterialCard`** → `useLiveQuery` detecta el nuevo material
4. **Procesamiento continúa** → `BatchProcessor.processFiles()`
5. **KnowledgeNodes se crean** → `createKnowledgeNodesFromConcepts()`
6. **Material se actualiza** → `updateMaterialProcessingStatus()`
7. **React no se actualiza** → `MaterialCard` no refleja los cambios

### Causa Raíz
El problema es que `MaterialCard` carga los `KnowledgeNodes` una sola vez al montarse, pero no se actualiza cuando los datos en IndexedDB cambian. Aunque `useLiveQuery` en `useMaterials` actualiza la lista de materiales, `MaterialCard` no tiene un mecanismo para volver a cargar los `KnowledgeNodes` cuando el estado del material cambia.

### Solución Propuesta
1. **Usar `useLiveQuery` en `MaterialCard`** para escuchar cambios en los `KnowledgeNodes` asociados al material.
2. **Asegurar que `MaterialCard` se actualice** cuando `processingStatus` cambie.

## Resumen de Causas Raíz

1. **BUG 1**: `MaterialCard` no se actualiza cuando los datos en IndexedDB cambian.
2. **BUG 2**: El modal se cierra antes de que todas las etapas se completen.
3. **BUG 3**: La navegación reemplaza el `idMateria` por el `idMaterial`.
4. **BUG 4**: `MaterialCard` no se actualiza cuando los datos en IndexedDB cambian.

## Soluciones Propuestas

1. **Usar `useLiveQuery` en `MaterialCard`** para escuchar cambios en los `KnowledgeNodes` asociados al material.
2. **Esperar a que todas las etapas estén completas** antes de cerrar el modal.
3. **Cambiar la navegación** para que conserve el `idMateria`.
4. **Asegurar que `MaterialCard` se actualice** cuando `processingStatus` cambie.

## Archivos a Modificar

1. **src/components/domain/MaterialCard.tsx**
2. **src/components/AddMaterialModal.tsx**
3. **src/pages/MaterialsPage.tsx**
4. **src/routes/index.tsx**

## Conclusión

Los problemas están relacionados con la sincronización entre React e IndexedDB, y con la navegación incorrecta. Las soluciones propuestas se centran en usar `useLiveQuery` para escuchar cambios en los datos, y en corregir la navegación para que conserve el `idMateria`.