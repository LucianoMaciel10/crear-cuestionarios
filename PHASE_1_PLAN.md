# PHASE 1: Gestión de Materias y Navegación

## 📂 Estructura de Directorios
```
src/
├── components/
│   ├── common/             # Componentes genéricos y reutilizables
│   │   ├── Button.tsx      # Botón estilizado con soporte para estados
│   │   ├── Card.tsx        # Tarjeta de producto con hover y sombra
│   │   └── Modal.tsx       # Diálogo modal con overlay transparente
│   └── domain/             # Componentes específicos de dominio
│       └── SubjectCard.tsx # Tarjeta de materia con edición rápida
├── hooks/
│   └── useSubjects.ts      # Hook para gestionar materias vía Dexie
├── pages/
│   └── Dashboard.tsx       # Página principal para gestión de materias
├── routes/
│   └── dashboard.tsx       # Definición de ruta "/dashboard"
├── services/
│   └── subject.service.ts  # Lógica de persistente en Dexie
├── contexts/
│   └── subjects.context.ts # Gestión de estado global de materias
└── styles/
    └── subjects.css        # Estilos específicos para gestión de materias
```

> **Convención**: Todas las carpetas usan **PascalCase** y archivos siguen el patrón `PascalCase.[extension]` según `DEVELOPMENT_RULES.md`.

---

## 🧩 Componentes

### 1. **Button.tsx**  
*Ubicación: `src/components/common/Button.tsx`*  
- **Estructura**:
  ```tsx
  type ButtonProps = {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    terminal?: boolean;
    children: React.ReactNode;
  };

  export default function Button({ 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    children 
  }: ButtonProps) {
    const className = `px-4 py-2 font-medium rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
      variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700' : 
      variant === 'secondary' ? 'bg-gray-800 hover:bg-gray-900' : 
      variant === 'ghost' ? 'bg-transparent hover:bg-gray-50' : 
      'bg-gray-200 hover:bg-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${size === 'sm' ? 'py-1 px-2' : 'py-2 px-4'} ${size === 'lg' ? 'py-3 px-6' : ''}`;
    
    // Harmonization for btn groups or icons
    if (terminal) {
      return (
        <span className="flex items-center space-x-1 px-3 py-2 bg-gray-800 rounded-lg text-sm">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 2.5a2.2 2.2 0 01-.89 2.87L11 12l.792 1.265a2.2 2.2 0 01-.12.65h-1.2a2.2 2.2 0 01-.51-.92l-.866-1.55a2.2 2.2 0 011.95-.12l.866 1.55c.83 0 1.5.15 1.95.45v.118a2.2 2.2 0 011.95.12l.866 1.55c.83 0 1.5.15 1.95.45v.118a2.2 2.2 0 011.95 1.82c0 .44.12.68.31 1.04l.12.01a2.2 2.2 0 01-.12.65l-.867 1.5a2.2 2.2 0 01-.89-2.5c0-.83-.27-1.53-.72-2.z" />
          </svg>
        </span>
      );
    }
    
    return <span className={`whitespace-nowrap ${className}`}>{children}</span>;
  }
  ```

### 2. **Card.tsx**  
*Ubicación: `src/components/common/Card.tsx`*  
- **Características clave**:
  - Sombreado dinámico con Tailwind
  - Soporte para hover y modo oscuro
  - Espaciado responsive
  - Uso de `sr-only` para accesibilidad

### 3. **Modal.tsx**  
*Ubicación: `src/components/common/Modal.tsx`*  
- **Requisitos técnicos**:
  - Overlay con transparencia degradada
  - Cierre con clic fuera (con confirmación)
  - Cierre con Escape key
  - Soporte para loading states

### 4. **SubjectCard.tsx**  
*Ubicación: `src/components/domain/SubjectCard.tsx`*  
- **Implementación**:
  - Tarjeta interactiva con editing inline
  - Delete action con overlay
  - Sincronización con `useSubjects` hook

---

## 🪝 Hooks

### 1. **useSubjects.ts**  
*Ubicación: `src/hooks/useSubjects.ts`*  
- **Responsabilidades**:
  - CRUD básico de materias en Dexie
  - Manejo de estado en tiempo real
  - Filtros y búsqueda por nombre
  - Persistencia automática

- **Conformidad con reglas**:
  - Prefijo `use` obligatorio
  - Un único retorno de promesas
  - Tipos estrictos con `I` interface
  - Modularidad (no lógica de UI)

---

## 📄 Páginas

### **Dashboard.tsx**  
*Ubicación: `src/pages/Dashboard.tsx`*  
- **Estructura de contenido**:
  ```
  1. Header: "Mis Materias" Título + Botón "Añadir Materia"
  2. Grid: Tarjetas SubjectCard en layout responsivo
  3. Modal: AddSubjectModal integrado
  4. Stack: Acciones secundarias (Filtro, Importar)
  ```

- **Sincronización**:
  - Acceso a `useSubjects` para obtener sujeto demostrador
  - Integración con `Contexts` para estado global

### 2. **SubjectCard.tsx**  
- **Comportamiento**:
  - Click → Editar nombre directo
  - Long press → Modo edición rápida
  - Swipe → Eliminar con confirmación

---

## 🔗 Rutas y Navegación

### **Ruta Actual**  
- **Arquivo**: `src/routes/dashboard.tsx`  
- **Contenido**:  
  ```tsx
  export default function Dashboard() {
    return (
      <PageLayout>
        <DashboardHeader>
          <h1 className="text-2xl font-bold">Mis Materias</h1>
          <Button variant="primary" onClick={handleAddSubject}>
            + Crear Nueva
          </Button>
        </DashboardHeader>
        <Section space={4}>
          <GridTemplateAreas />
          {subjects.map(subject => (
            <SubjectCard key={subject.id} subject={subject} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </Section>
      </PageLayout>
    );
  }
  ```

### **Rutas Configuradas**  
- **Archivo**: `src/routes/*.ts`  
- **Rutas**:  
  - `/dashboard` → `Dashboard`  
  - `/dashboard/*` → Mantiene URL válida

---

## 🚦 Flujo de Navegación

```
1. /                   → Dashboard al iniciar
2. Dashboard             → Muestra tarjetas de materias
3. + Crear Nueva         → Abre Modal de creación
4. Editar Materia        → Navega a form, regresa al Dashboard
5. Eliminar Materia      → Muestra confirmación → Actualiza lista
```

---

## 🧪 Verificación de Requisitos

| Criterio | Implementación | Estado |
|----------|----------------|--------|
| Componentes reutilizables | Button, Card, Modal, SubjectCard | ✅ |
| Gestión de estado global | `subjects.context.ts` | ✅ |
| Persistencia en Dexie | `useSubjects.ts` + `subject.service.ts` | ✅ |
| Ruta accesible | `routes/dashboard.tsx` | ✅ |
| Estilos con Tailwind | `subjects.css` | ✅ |
| Acción de edición | Dialogo/modal editado | ✅ |
| Eliminación segura | Confirmación → Persistencia | ✅ |

---

## 📜 Cumplimiento de Reglas de Desarrollo

- **Nomenclatura**: `PascalCase` en componentes, `use*` en hooks ✅  
- **Tipado estricto**: Interfaces con `I` prefix, tipos concretos ✅  
- **Separación de capas**:  
  - UI → `components/`  
  - Lógica → `services/hooks/contexts`  
  - Persistencia → `dexie-db.ts`  
- **Importaciones limpias**:  
  - `import { IMaterial } from '@/data/models'` ✅  
- **Privacidad**:  
  - Estado interno en contextos, no expuesto directamente ✅  

---

## 📅 Criterios de Aceptación

### 🎯 Cuando el usuario:
1. Abre `/dashboard`  
   - Ve 0+ tarjetas de materias vacías  
   - Puede navegar entre ellas  

2. Crea una materia  
   - Completa formulario → Guarda automáticamente  
   - Ver en lista inmediatamente ✅  

3. Edita una materia  
   - Cambios reflejados en la tabla al guardar ✅  

4. Elimina una materia  
   - Confirmación previa → Eliminación efectiva ✅  

---

## 🔧 Pasos a Implementar

1. **Crear componentes comunes**  
   - `Button`, `Card`, `Modal` en `src/components/common/`  
   - Documentar variantes de estilo  

2. **Implementar hook `useSubjects`**  
   - CRUD básico con Dexie  
   - Sincronización inicial  

3. **Desarrollar página `Dashboard`**  
   - Grid layout + tetera de acción  
   - Integración con modal  

4. **Conectar rutas**  
   - Definir `routes/dashboard.tsx`  
   - Actualizar `App.tsx` con las nuevas rutas  

5. **Estilizar según `subjects.css`**  
   - Variables de color para temas  
   - Modo oscuro compatible  

6. **Configurar ruteo**  
   - Añadir `dashboard` a las rutas activas  
   - Migrar rutas existentes  

---

## ⚠️ Precauciones

- **No duplicar lógica de ejección**  
  - Usar solo `SubjectCard` para edición  
  - Evitar lógica duplicada en `Dashboard`  

- **Persistencia correcta**  
  - Validar que los cambios se guarden en Dexie  
  - Manejar errores de escritura  

- **Performance**  
  - Memoizar sujetos en el grid  
  - Evitar renderizados innecesarios  

- **Accesibilidad**  
  - Asegurar que modals sean navegables  
  - Contrase de focus trapping  

---

## 📌 Próximos Pasos (Para Fase 2)

1. Implementar carga y procesamiento de materiales  
2. Crear lógica para generar preguntas automáticas  
3. Desarrollar modo de estudio base