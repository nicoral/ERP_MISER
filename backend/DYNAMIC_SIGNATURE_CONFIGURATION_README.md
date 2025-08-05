# Sistema de Configuración Dinámica de Firmas

## Descripción General

Este sistema permite configurar las firmas requeridas para cada documento de forma individual, con soporte para plantillas reutilizables y validaciones específicas por rol y monto.

## Arquitectura

### Entidades Principales

#### 1. `DocumentApprovalConfiguration`
- **Propósito**: Almacena la configuración específica de firmas para cada documento individual
- **Campos**:
  - `entityType`: Tipo de documento ('requirement', 'quotation', 'fuel_control')
  - `entityId`: ID del documento específico
  - `signatureLevel`: Nivel de prioridad de la firma (1-4)
  - `roleName`: Rol requerido para firmar ('SOLICITANTE', 'OFICINA_TECNICA', etc.)
  - `isRequired`: Si la firma es obligatoria
  - `isActive`: Si la configuración está activa

#### 2. `ApprovalFlowTemplate`
- **Propósito**: Plantillas reutilizables para configuraciones de firmas
- **Campos**:
  - `templateName`: Nombre de la plantilla ('DEFAULT', 'SIMPLIFIED', etc.)
  - `entityType`: Tipo de documento al que aplica
  - `signatureLevel`: Nivel de prioridad
  - `roleName`: Rol requerido
  - `isRequired`: Si es obligatorio

### Servicios

#### `DocumentApprovalConfigurationService`

**Métodos Principales**:

1. **`getConfigurationForDocument(entityType, entityId)`**
   - Obtiene la configuración específica de un documento
   - Si no existe, usa la plantilla por defecto
   - Crea configuración específica basada en plantilla

2. **`applyTemplateToDocument(entityType, entityId, templateName, userId)`**
   - Aplica una plantilla a un documento específico
   - Desactiva configuración existente
   - Crea nueva configuración basada en plantilla

3. **`createCustomConfiguration(entityType, entityId, configurations, userId)`**
   - Crea configuración personalizada para un documento
   - Permite configurar cada nivel de firma individualmente

4. **`applyConfigurationByAmount(entityType, entityId, totalAmount, userId, lowAmountThreshold)`**
   - Aplica configuración automática según el monto
   - Montos bajos: Solo Solicitante + Administración
   - Montos altos: Todas las firmas

### Funciones Utilitarias

#### `canUserSignWithConfiguration()`
- **Validaciones**:
  - ✅ Solo el creador puede firmar como solicitante
  - ✅ Gerencia solo se requiere para montos altos
  - ✅ Verifica permisos y si ya fue firmado
  - ✅ Valida que el documento no esté rechazado

#### `processSignatureWithConfiguration()`
- Aplica la firma según el nivel y rol
- Maneja la lógica de aprobación automática para montos bajos

## Flujo de Validaciones

### 1. Validación de Solicitante (Creador)
```typescript
if (config.roleName === 'SOLICITANTE') {
  if (!isCreator) {
    continue; // No puede firmar como solicitante
  }
  if (entity.firstSignedAt) {
    continue; // Ya fue firmado por solicitante
  }
  return { canSign: true, level: config.signatureLevel, role: config.roleName };
}
```

### 2. Validación de Gerencia (Solo para montos altos)
```typescript
if (config.roleName === 'GERENCIA') {
  if (totalAmount < lowAmountThreshold) {
    continue; // Gerencia no requerida para montos bajos
  }
}
```

### 3. Validación de Permisos
```typescript
const hasPermission = userPermissions.includes(`${entityType}-view-${config.roleName.toLowerCase()}`);
const alreadySigned = getSignatureByLevel(entity, config.signatureLevel);

if (hasPermission && !alreadySigned) {
  return { canSign: true, level: config.signatureLevel, role: config.roleName };
}
```

## Configuraciones por Defecto

### Montos Bajos (< S/. 10,000 por defecto, configurable)
```typescript
[
  { signatureLevel: 1, roleName: 'SOLICITANTE', isRequired: true },
  { signatureLevel: 2, roleName: 'ADMINISTRACION', isRequired: true },
  { signatureLevel: 3, roleName: 'OFICINA_TECNICA', isRequired: false },
  { signatureLevel: 4, roleName: 'GERENCIA', isRequired: false }
]
```

### Montos Altos (>= S/. 10,000 por defecto, configurable)
```typescript
[
  { signatureLevel: 1, roleName: 'SOLICITANTE', isRequired: true },
  { signatureLevel: 2, roleName: 'OFICINA_TECNICA', isRequired: true },
  { signatureLevel: 3, roleName: 'ADMINISTRACION', isRequired: true },
  { signatureLevel: 4, roleName: 'GERENCIA', isRequired: true }
]
```

### Configuración del Umbral
El umbral de monto bajo se configura en `GeneralSettings.lowAmountThreshold`:
- **Valor por defecto**: S/. 10,000
- **Configurable**: A través de la interfaz de administración
- **Uso**: Determina automáticamente qué configuración aplicar según el monto del documento

## Uso en los Servicios

### RequirementService
```typescript
// Obtener umbral de monto bajo desde configuración
const lowAmountThreshold = await this.generalSettingsService.getLowAmountThreshold();

// Obtener configuración específica del documento
const configurations = await this.documentApprovalConfigurationService
  .getConfigurationForDocument('requirement', requirement.id);

// Verificar permisos usando configuración dinámica
const { canSign, level, role: signatureRole, reason } = await canUserSignWithConfiguration(
  requirement,
  userPermissions,
  requirement.employee.id,
  userId,
  configurations,
  totalAmount,
  lowAmountThreshold,
  'requirement'
);

// Procesar firma usando configuración dinámica
const { updatedEntity, becameApproved } = await processSignatureWithConfiguration(
  requirement,
  userId,
  employee.signature,
  level,
  signatureRole,
  isLowAmountRequirement
);
```

### QuotationService
```typescript
// Obtener umbral de monto bajo desde configuración
const lowAmountThreshold = await this.generalSettingsService.getLowAmountThreshold();

// Similar al RequirementService pero con entityType: 'quotation'
const configurations = await this.documentApprovalConfigurationService
  .getConfigurationForDocument('quotation', quotationRequest.id);
```

### FuelControlService
```typescript
// Obtener umbral de monto bajo desde configuración
const lowAmountThreshold = await this.generalSettingsService.getLowAmountThreshold();

// Similar pero con entityType: 'fuel_control'
const configurations = await this.documentApprovalConfigurationService
  .getConfigurationForDocument('fuel_control', fuelDailyControl.id);
```

## API Endpoints

### Crear Configuración Personalizada
```http
POST /document-approval-configurations/create
{
  "entityType": "requirement",
  "entityId": 123,
  "configurations": [
    { "signatureLevel": 1, "roleName": "SOLICITANTE", "isRequired": true },
    { "signatureLevel": 2, "roleName": "ADMINISTRACION", "isRequired": true }
  ]
}
```

### Aplicar Plantilla
```http
POST /document-approval-configurations/apply-template
{
  "templateName": "SIMPLIFIED",
  "entityId": 123
}
```

### Obtener Plantillas Disponibles
```http
GET /document-approval-configurations/templates/requirement
```

### Obtener Configuración de Documento
```http
GET /document-approval-configurations/document/requirement/123
```

## Ventajas del Sistema

1. **Flexibilidad**: Cada documento puede tener su propia configuración
2. **Plantillas**: Configuraciones reutilizables
3. **Validaciones Específicas**: Por rol, monto y estado del documento
4. **Escalabilidad**: Fácil agregar nuevos tipos de documentos
5. **Mantenibilidad**: Lógica centralizada en servicios
6. **Compatibilidad**: Mantiene funciones legacy para transición gradual

## Migración

El sistema mantiene compatibilidad con el sistema anterior:
- Las funciones legacy (`canUserSign`, `processSignature`) siguen disponibles
- Los servicios pueden usar gradualmente las nuevas funciones
- No hay cambios breaking en la API existente

## Próximos Pasos

1. **Migraciones**: Crear las tablas en la base de datos
2. **Seeders**: Poblar plantillas por defecto
3. **Frontend**: Integrar la interfaz para configurar firmas
4. **Testing**: Pruebas unitarias y de integración
5. **Documentación**: Guías de usuario y administrador 