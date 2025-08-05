# Frontend - Configuración Dinámica de Firmas

## Descripción General

Este documento describe la implementación del frontend para el sistema de configuración dinámica de firmas, que permite a los usuarios configurar las firmas requeridas para cada documento de forma individual.

## Arquitectura del Frontend

### Tipos TypeScript

#### `documentApprovalConfiguration.ts`
- **Interfaces principales**:
  - `DocumentApprovalConfiguration`: Configuración específica de un documento
  - `ApprovalFlowTemplate`: Plantillas reutilizables
  - `SignatureConfigurationDto`: DTO para configuraciones de firma
  - `CreateDocumentApprovalConfigurationDto`: DTO para crear configuraciones
  - `ApplyTemplateDto`: DTO para aplicar plantillas

- **Constantes**:
  - `SIGNATURE_ROLES`: Roles disponibles ('SOLICITANTE', 'OFICINA_TECNICA', etc.)
  - `SIGNATURE_LEVELS`: Niveles de firma (1, 2, 3, 4)
  - `ENTITY_TYPES`: Tipos de entidades ('requirement', 'quotation', 'fuel_control')

### Servicios API

#### `documentApprovalConfigurationService.ts`
**Métodos disponibles**:

1. **`createConfiguration(createDto)`**
   - Crea configuración personalizada para un documento
   - POST `/document-approval-configurations/create`

2. **`applyTemplate(applyTemplateDto)`**
   - Aplica una plantilla a un documento específico
   - POST `/document-approval-configurations/apply-template`

3. **`getAvailableTemplates(entityType)`**
   - Obtiene plantillas disponibles para un tipo de entidad
   - GET `/document-approval-configurations/templates/{entityType}`

4. **`getDocumentConfiguration(entityType, entityId)`**
   - Obtiene la configuración específica de un documento
   - GET `/document-approval-configurations/document/{entityType}/{entityId}`

### Hooks Personalizados

#### `useDocumentApprovalConfiguration.ts`
**Funcionalidades**:

- **Estado de carga y errores**: Manejo centralizado de loading y errores
- **Métodos principales**:
  - `createConfiguration()`: Crear configuración personalizada
  - `applyTemplate()`: Aplicar plantilla
  - `getAvailableTemplates()`: Obtener plantillas
  - `getDocumentConfiguration()`: Obtener configuración de documento
  - `createDefaultConfiguration()`: Crear configuración por defecto
  - `createHighAmountConfiguration()`: Crear configuración para montos altos

- **Integración con Toast**: Notificaciones automáticas de éxito/error usando `showSuccess` y `showError`

### Componentes

#### 1. `SignatureConfigurationForm.tsx`
**Propósito**: Formulario para configurar las firmas de un documento

**Características**:
- ✅ Configuración de 4 niveles de firma
- ✅ Selección de roles por dropdown nativo
- ✅ Checkbox para marcar como requerido/opcional
- ✅ Carga configuración existente automáticamente
- ✅ Validación y manejo de errores
- ✅ Interfaz intuitiva con badges y controles nativos

**Props**:
```typescript
interface SignatureConfigurationFormProps {
  entityType: EntityType;
  entityId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

#### 2. `SignatureConfigurationModal.tsx`
**Propósito**: Modal que contiene el formulario de configuración

**Características**:
- ✅ Modal responsive con overlay
- ✅ Integración con el formulario
- ✅ Manejo de eventos de éxito/cancelación
- ✅ Botón de cierre en la esquina superior derecha

#### 3. `SignatureConfigurationButton.tsx`
**Propósito**: Botón que abre el modal de configuración

**Características**:
- ✅ Botón reutilizable con variantes
- ✅ Integración automática con el modal
- ✅ Props personalizables (variant, children)
- ✅ Usa el componente Button común del proyecto

**Props**:
```typescript
interface SignatureConfigurationButtonProps {
  entityType: EntityType;
  entityId: number;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  onSuccess?: () => void;
  children?: React.ReactNode;
}
```

#### 4. `SignatureConfigurationDisplay.tsx`
**Propósito**: Muestra la configuración actual de firmas de un documento

**Características**:
- ✅ Visualización clara de la configuración actual
- ✅ Estados de carga y error
- ✅ Botón para editar configuración
- ✅ Iconos para indicar estado requerido/opcional
- ✅ Ordenamiento por nivel de firma
- ✅ Spinner de carga personalizado

## Integración en Componentes Existentes

### RequirementDetails.tsx
```typescript
// Agregado el componente de configuración de firmas
{requirement && (
  <div className="mb-6">
    <SignatureConfigurationDisplay
      entityType="requirement"
      entityId={requirement.id}
      onConfigurationChange={refetch}
    />
  </div>
)}
```

## Uso de los Componentes

### 1. Botón de Configuración Simple
```tsx
import { SignatureConfigurationButton } from '../components/common/SignatureConfigurationButton';

<SignatureConfigurationButton
  entityType="requirement"
  entityId={123}
  onSuccess={() => console.log('Configuración actualizada')}
>
  Configurar Firmas
</SignatureConfigurationButton>
```

### 2. Visualización de Configuración
```tsx
import { SignatureConfigurationDisplay } from '../components/common/SignatureConfigurationDisplay';

<SignatureConfigurationDisplay
  entityType="requirement"
  entityId={123}
  onConfigurationChange={() => refetch()}
/>
```

### 3. Modal Personalizado
```tsx
import { SignatureConfigurationModal } from '../components/modals/SignatureConfigurationModal';

<SignatureConfigurationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  entityType="requirement"
  entityId={123}
  onSuccess={() => {
    console.log('Configuración guardada');
    refetch();
  }}
/>
```

## Flujo de Usuario

### 1. Configuración Inicial
1. Usuario hace clic en "Configurar Firmas"
2. Se abre el modal con formulario
3. Se cargan configuraciones existentes (si las hay)
4. Usuario modifica la configuración
5. Al guardar, se envía al backend
6. Se muestra notificación de éxito

### 2. Visualización
1. Componente carga automáticamente la configuración
2. Muestra los niveles de firma ordenados
3. Indica qué firmas son requeridas/opcionales
4. Proporciona botón para editar

### 3. Actualización
1. Usuario edita la configuración
2. Se guardan los cambios
3. Se actualiza la visualización
4. Se ejecuta callback de éxito (ej: refetch)

## Estilos y UI

### Componentes UI Utilizados
- **Card**: Contenedor principal para formularios y displays
- **Button**: Botones de acción con variantes (componente común)
- **Badge**: Indicadores de nivel usando spans con clases CSS
- **Checkbox**: Toggle para requerido/opcional usando input nativo
- **Select**: Dropdown para selección de roles usando select nativo
- **Modal**: Overlay personalizado con backdrop

### Clases CSS Utilizadas
- **Responsive**: `max-w-4xl`, `max-h-[90vh]`
- **Layout**: `grid`, `flex`, `space-y-4`
- **States**: `disabled`, `loading`, `error`
- **Theming**: `bg-blue-100`, `text-blue-800`, `text-muted-foreground`
- **Spinner**: `animate-spin`, `border-b-2`, `border-blue-600`

## Correcciones Realizadas

### 1. Patrones de Componentes
- ✅ Usa `Button` común del proyecto en lugar de componente UI
- ✅ Usa controles nativos (select, checkbox) en lugar de componentes UI
- ✅ Usa spans con clases CSS para badges en lugar de componente Badge
- ✅ Usa spinner personalizado en lugar de icono de Lucide

### 2. Patrones de Toast
- ✅ Usa `showSuccess` y `showError` del contexto Toast
- ✅ Elimina hook `useToast` innecesario
- ✅ Maneja errores con mensajes descriptivos

### 3. Patrones de Modal
- ✅ Usa modal personalizado con overlay en lugar de componente Dialog
- ✅ Implementa botón de cierre en esquina superior derecha
- ✅ Maneja estado de visibilidad con `if (!isOpen) return null`

### 4. Patrones de Loading
- ✅ Usa spinner personalizado con clases CSS
- ✅ Mantiene consistencia con otros componentes del proyecto

## Ventajas de la Implementación

1. **Reutilizable**: Componentes modulares que se pueden usar en cualquier parte
2. **TypeScript**: Tipado completo para mejor DX
3. **Responsive**: Funciona en móviles y desktop
4. **Consistente**: Sigue los patrones existentes del proyecto
5. **Mantenible**: Código limpio y bien estructurado
6. **Nativo**: Usa controles HTML nativos para mejor accesibilidad

## Próximos Pasos

1. **Integración en otros módulos**: Cotizaciones y Control de Combustible
2. **Testing**: Pruebas unitarias y de integración
3. **Optimización**: Lazy loading y memoización
4. **Documentación**: Storybook para componentes
5. **Internacionalización**: Soporte para múltiples idiomas 