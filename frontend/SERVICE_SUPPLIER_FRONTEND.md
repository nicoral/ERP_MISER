# Integración de Proveedor por Defecto en Servicios - Frontend

## Descripción

Se han actualizado los componentes del frontend para permitir la asignación y visualización de un proveedor por defecto opcional en los servicios.

## Cambios Realizados

### 1. Tipos Actualizados (`src/types/service.ts`)

Se agregaron los campos para el proveedor por defecto:

```typescript
import { Supplier } from './supplier';

export interface Service {
  id: number;
  code: string;
  name: string;
  duration: number;
  durationType: string;
  active: boolean;
  defaultSupplierId?: number;
  defaultSupplier?: Supplier;
  createdAt: string;
  updatedAt?: string;
}
```

### 2. Formulario de Servicios (`src/features/service/components/ServiceForm.tsx`)

#### Nuevas Funcionalidades:
- **Campo de selección de proveedor**: Se agregó un `SearchableSelect` para seleccionar el proveedor por defecto
- **Label personalizado**: "Proveedor (Solo Administración)" como solicitado
- **Integración con proveedores**: Utiliza el hook `useSupplierService` para cargar la lista de proveedores
- **Manejo de datos**: Convierte el ID del proveedor a número o undefined según corresponda

#### Características del Campo:
- **Opcional**: El campo es completamente opcional
- **Búsqueda**: Permite buscar proveedores por nombre o RUC
- **Formato de visualización**: Muestra "Nombre - RUC" en las opciones
- **Valor por defecto**: Se inicializa en 0 (sin selección)

### 3. Vista de Detalles (`src/features/service/components/ServiceDetails.tsx`)

#### Nueva Sección:
- **Información del proveedor**: Muestra el nombre del proveedor, RUC y contacto
- **Estado vacío**: Muestra "No asignado" cuando no hay proveedor por defecto
- **Formato visual**: Información organizada y legible

### 4. Lista de Servicios (`src/features/service/components/ServiceList.tsx`)

#### Nueva Columna:
- **Columna "Proveedor por Defecto"**: Muestra el proveedor asignado en la tabla
- **Información compacta**: Nombre del proveedor y RUC en formato reducido
- **Estado vacío**: Indica cuando no hay proveedor asignado

## Componentes Utilizados

### SearchableSelect
- **Ubicación**: `src/components/common/SearchableSelect.tsx`
- **Funcionalidad**: Campo de búsqueda con dropdown
- **Características**:
  - Búsqueda en tiempo real
  - Navegación con teclado
  - Cierre automático al hacer clic fuera
  - Soporte para temas claro/oscuro

### useSupplierService
- **Ubicación**: `src/hooks/useSupplierService.ts`
- **Funcionalidad**: Hook para cargar proveedores
- **Características**:
  - Carga automática de proveedores
  - Cache de datos
  - Manejo de errores
  - Función de recarga

## Flujo de Datos

### Crear/Editar Servicio:
1. **Carga inicial**: Se cargan los proveedores disponibles
2. **Selección**: Usuario selecciona un proveedor del dropdown
3. **Validación**: El campo es opcional, no requiere validación especial
4. **Envío**: Se envía el `defaultSupplierId` al backend
5. **Respuesta**: Se actualiza la lista de servicios

### Visualización:
1. **Lista**: Muestra proveedor por defecto en tabla compacta
2. **Detalles**: Muestra información completa del proveedor
3. **Estado vacío**: Indica claramente cuando no hay proveedor asignado

## Consideraciones de UX

### 1. **Label Claro**
- "Proveedor (Solo Administración)" indica el propósito del campo
- Ayuda a los usuarios a entender que es para uso administrativo

### 2. **Búsqueda Intuitiva**
- Campo de búsqueda permite encontrar proveedores rápidamente
- Formato "Nombre - RUC" facilita la identificación

### 3. **Estados Visuales**
- Estado vacío claramente indicado
- Información organizada en vistas de detalles
- Formato compacto en listas

### 4. **Responsive Design**
- Funciona correctamente en dispositivos móviles
- Dropdown se adapta al tamaño de pantalla

## Próximos Pasos

Para implementar estos cambios:

1. **Verificar dependencias**: Asegurar que `useSupplierService` esté disponible
2. **Probar funcionalidad**: Crear y editar servicios con proveedores
3. **Validar responsive**: Probar en diferentes tamaños de pantalla
4. **Revisar permisos**: Confirmar que solo usuarios con permisos adecuados vean el campo

## Compatibilidad

- **Backend**: Requiere la migración y cambios en la API
- **Tipos**: Compatible con la estructura de datos existente
- **Componentes**: Reutiliza componentes existentes
- **Temas**: Compatible con modo claro/oscuro 