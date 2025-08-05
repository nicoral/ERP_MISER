# Sistema de Firmas para Órdenes de Compra

## Descripción

El sistema de firmas para órdenes de compra permite que las órdenes de compra tengan su propio flujo de aprobación con firmas, que se copian automáticamente desde la cotización correspondiente al momento de la generación.

## Características

### ✅ **Funcionalidades Implementadas**

1. **Entidad PurchaseOrder**
   - Extiende de `ApprovalFlowBase` (misma estructura que Requirement y QuotationRequest)
   - Campos de firma heredados: `firstSignature`, `secondSignature`, `thirdSignature`, `fourthSignature`
   - Campos de rechazo: `rejectedReason`, `rejectedBy`, `rejectedAt`
   - Estado: `PurchaseOrderStatus` (PENDING, SIGNED_1, SIGNED_2, SIGNED_3, SIGNED_4, APPROVED, REJECTED, CANCELLED)

2. **Métodos de Firma**
   - `signPurchaseOrder(id, userId)` - Firma una orden de compra
   - `rejectPurchaseOrder(id, userId, reason)` - Rechaza una orden de compra
   - `getSignatureConfiguration(id)` - Obtiene configuración de firmas
   - `savePurchaseOrderWithSignatures(purchaseOrder)` - Guarda con firmas copiadas

3. **Endpoints REST**
   - `POST /purchase-order/:id/sign` - Firmar orden de compra
   - `POST /purchase-order/:id/reject` - Rechazar orden de compra
   - `GET /purchase-order/:id/signature-configuration` - Obtener configuración

4. **Copia Automática de Firmas**
   - Al generar una orden de compra, automáticamente se copian las firmas de la cotización
   - Se mantiene el estado de aprobación correspondiente
   - No requiere endpoint manual de copia

## Arquitectura

### **Entidad PurchaseOrder**
```typescript
@Entity()
export class PurchaseOrder extends ApprovalFlowBase {
  @PrimaryGeneratedColumn()
  id: number;

  // ... campos existentes ...

  @Column({ 
    type: 'enum', 
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDING
  })
  status: PurchaseOrderStatus;

  // Campos de firma heredados de ApprovalFlowBase:
  // - firstSignature, firstSignedBy, firstSignedAt
  // - secondSignature, secondSignedBy, secondSignedAt
  // - thirdSignature, thirdSignedBy, thirdSignedAt
  // - fourthSignature, fourthSignedBy, fourthSignedAt
  // - rejectedReason, rejectedBy, rejectedAt
}
```

### **Servicio PurchaseOrderService**
```typescript
@Injectable()
export class PurchaseOrderService {
  // Métodos de firma
  async signPurchaseOrder(id: number, userId: number): Promise<PurchaseOrder>
  async rejectPurchaseOrder(id: number, userId: number, reason: string): Promise<PurchaseOrder>
  async getSignatureConfiguration(id: number)
  async savePurchaseOrderWithSignatures(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder>
}
```

### **Controlador PurchaseOrderController**
```typescript
@Controller('purchase-order')
export class PurchaseOrderController {
  @Post(':id/sign')
  sign(@Req() req, @Param('id') id: string)

  @Post(':id/reject')
  reject(@Req() req, @Param('id') id: string, @Body() body: { reason: string })

  @Get(':id/signature-configuration')
  getSignatureConfiguration(@Param('id') id: string)
}
```

## Flujo de Trabajo

### **1. Generación de Orden de Compra**
```typescript
// En QuotationService.generatePurchaseOrder()
const purchaseOrder = await this.purchaseOrderService.createPurchaseOrder(createPurchaseOrderDto);

// Copiar automáticamente las firmas de la cotización
if (quotationRequest.firstSignature) {
  purchaseOrder.firstSignature = quotationRequest.firstSignature;
  purchaseOrder.firstSignedBy = quotationRequest.firstSignedBy;
  purchaseOrder.firstSignedAt = quotationRequest.firstSignedAt;
}

// ... copiar otras firmas ...

// Actualizar estado basado en las firmas copiadas
if (quotationRequest.status === 'APPROVED') {
  purchaseOrder.status = PurchaseOrderStatus.APPROVED;
} else if (quotationRequest.fourthSignedAt) {
  purchaseOrder.status = PurchaseOrderStatus.SIGNED_4;
}
// ... etc ...

// Guardar la orden de compra con las firmas copiadas
const savedPurchaseOrder = await this.purchaseOrderService.savePurchaseOrderWithSignatures(purchaseOrder);

return savedPurchaseOrder;
```

### **2. Firma Manual**
```typescript
async signPurchaseOrder(id: number, userId: number): Promise<PurchaseOrder> {
  const purchaseOrder = await this.findOne(id);
  const employee = await this.employeeService.findOne(userId);

  // Validaciones
  if (!employee.signature) {
    throw new BadRequestException('El usuario no tiene firma registrada');
  }

  // Obtener configuración dinámica
  const configurations = await this.documentApprovalConfigurationService
    .getConfigurationForDocument('purchase_order', purchaseOrder.id);

  // Verificar permisos
  const { canSign, level, reason } = await canUserSignWithConfiguration(
    purchaseOrder,
    userPermissions,
    purchaseOrder.createdBy?.id || -1,
    userId,
    configurations,
    purchaseOrder.total,
    lowAmountThreshold,
    'purchase_order'
  );

  if (!canSign) {
    throw new ForbiddenException(`No puedes firmar esta orden de compra. ${reason}`);
  }

  // Procesar firma
  const { updatedEntity } = await processSignatureWithConfiguration(
    purchaseOrder,
    userId,
    employee.signature,
    level,
    configurations
  );

  Object.assign(purchaseOrder, updatedEntity);
  return this.purchaseOrderRepository.save(purchaseOrder);
}
```

## Configuración Dinámica

### **Plantillas de Aprobación**
Las órdenes de compra utilizan el mismo sistema de configuración dinámica que los requerimientos y cotizaciones:

- **Entidad**: `DocumentApprovalConfiguration`
- **Tipo**: `'purchase_order'`
- **Roles**: SOLICITANTE, OFICINA_TECNICA, ADMINISTRACION, GERENCIA
- **Niveles**: 1, 2, 3, 4

### **Configuración por Monto**
- **Montos Bajos**: Solo Solicitante + Administración
- **Montos Altos**: Todas las firmas requeridas

## Migración de Base de Datos

### **Script SQL**
```sql
-- Agregar campos de firma (heredados de ApprovalFlowBase)
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS first_signature TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS first_signed_by INTEGER REFERENCES employees(id);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS first_signed_at TIMESTAMP;
-- ... campos similares para second, third, fourth signatures ...

-- Agregar campos de rechazo
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS rejected_by INTEGER REFERENCES employees(id);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- Agregar campo de estado
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_first_signed_by ON purchase_orders(first_signed_by);
-- ... otros índices ...
```

## Permisos Requeridos

### **Permisos del Sistema**
- `purchase_order-signed-solicitante`
- `purchase_order-signed-oficina_tecnica`
- `purchase_order-signed-administracion`
- `purchase_order-signed-gerencia`

### **Validaciones**
- Usuario debe tener firma registrada
- Usuario debe tener permisos para el nivel de firma
- Documento no debe estar ya aprobado
- Documento no debe estar rechazado

## Estados de Aprobación

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Pendiente de firma |
| `SIGNED_1` | Firmado por Solicitante |
| `SIGNED_2` | Firmado por Oficina Técnica |
| `SIGNED_3` | Firmado por Administración |
| `SIGNED_4` | Firmado por Gerencia |
| `APPROVED` | Aprobado completamente |
| `REJECTED` | Rechazado |
| `CANCELLED` | Cancelado |

## Integración con Frontend

### **Endpoints Disponibles**
```typescript
// Firmar orden de compra
POST /purchase-order/:id/sign

// Rechazar orden de compra
POST /purchase-order/:id/reject
Body: { reason: string }

// Obtener configuración de firmas
GET /purchase-order/:id/signature-configuration
```

### **Respuestas**
```typescript
// Respuesta de firma exitosa
{
  id: number,
  status: PurchaseOrderStatus,
  firstSignature: string,
  firstSignedBy: number,
  firstSignedAt: Date,
  // ... otras firmas
}

// Respuesta de configuración
{
  purchaseOrder: PurchaseOrder,
  configurations: DocumentApprovalConfiguration[],
  totalAmount: number,
  lowAmountThreshold: number
}
```

## Generador de PDF Dinámico

### **Actualización del Sistema de Firmas**

El generador de PDF ha sido actualizado para manejar **firmas dinámicas** basadas en la configuración de aprobación:

#### **Características del Nuevo Sistema**

1. **Firmas Dinámicas**: 
   - El PDF se adapta automáticamente al número de firmas configuradas
   - Solo muestra las firmas que están configuradas para el documento
   - Los roles se muestran según la configuración específica

2. **Configuración por Documento**:
   - Cada documento puede tener su propia configuración de firmas
   - Se consulta `DocumentApprovalConfiguration` para determinar qué firmas mostrar
   - Los niveles se ordenan automáticamente (1, 2, 3, 4)

3. **Templates Actualizados**:
   - **Purchase Order**: Maneja firmas dinámicas con `{{#each signatures}}`
   - **Requirement**: Actualizado para usar el mismo sistema
   - **Quotation**: Actualizado con firmas dinámicas y nombres específicos

#### **Implementación Técnica**

```typescript
// En PurchaseOrderService y RequirementService
private async generateDynamicSignatures(
  document: PurchaseOrder | Requirement,
  configurations: DocumentApprovalConfiguration[]
): Promise<Array<{
  level: number;
  role: string;
  roleName: string;
  signature: string | null;
  signedAt: string;
  hasSignature: boolean;
}>> {
  // Lógica para generar firmas dinámicas
}
```

#### **Template Handlebars**

```html
<!-- Firmas dinámicas en el template -->
<tr style="height:60px; padding: 6px">
  {{#each signatures}}
  <td style="{{#unless @last}}border-right:1px solid #333;{{/unless}}">
    {{#if hasSignature}}
      <img src="{{signature}}" style="max-width: 100%; max-height: 40px; display: block; margin: 0 auto;">
    {{/if}}
  </td>
  {{/each}}
</tr>
<tr style="background:#fff; color:#000; font-weight: bold;">
  {{#each signatures}}
  <td style="text-align:center; font-size:11px; {{#unless @last}}border-right:1px solid #333;{{/unless}} border-bottom:1px solid #333; border-top: 1px solid #333;">
    {{roleName}}<br><small>{{signedAt}}</small>
  </td>
  {{/each}}
</tr>
```

#### **Nombres de Firmantes por Tipo de Documento**

**Requerimientos:**
- SOLICITANTE → "V°B° SOLICITANTE<br>ELABORA"
- OFICINA_TECNICA → "V°B° OFICINA TÉCNICA<br>REVISA"
- ADMINISTRACION → "V°B° ADMINISTRACIÓN<br>REVISIÓN"
- GERENCIA → "V°B° RESIDENTE<br>APRUEBA"

**Cotizaciones:**
- SOLICITANTE → "V°B° LOGÍSTICA<br>ELABORA"
- OFICINA_TECNICA → "V°B° OFICINA TÉCNICA<br>REVISA"
- ADMINISTRACION → "V°B° ADMINISTRACIÓN<br>REVISIÓN"
- GERENCIA → "V°B° GERENCIA<br>APRUEBA"

**Órdenes de Compra:**
- SOLICITANTE → "SOLICITANTE"
- OFICINA_TECNICA → "OFICINA TÉCNICA"
- ADMINISTRACION → "ADMINISTRACIÓN"
- GERENCIA → "GERENCIA"

#### **Ventajas del Sistema Dinámico**

1. **Flexibilidad**: Se adapta a cualquier número de firmas (1-4)
2. **Configuración Específica**: Cada documento puede tener su propia configuración
3. **Consistencia**: Mismo sistema para todos los tipos de documento
4. **Mantenibilidad**: Fácil agregar nuevos roles o niveles
5. **Escalabilidad**: Funciona con configuraciones complejas

#### **Próximos Pasos para PDF**

1. ✅ **Actualizar Cotizaciones**: Implementado el mismo sistema en `QuotationService`
2. **Testing**: Probar con diferentes configuraciones de firmas
3. **Optimización**: Mejorar el rendimiento de generación de PDF
4. **Documentación**: Crear guías de uso para configuraciones complejas

## Ventajas del Sistema

### **✅ Beneficios**
1. **Consistencia**: Misma estructura que requerimientos y cotizaciones (extiende de ApprovalFlowBase)
2. **Automatización**: Copia automática de firmas desde cotización al generar orden de compra
3. **Flexibilidad**: Configuración dinámica por documento
4. **Trazabilidad**: Registro completo de firmas y estados
5. **Seguridad**: Validaciones de permisos y reglas de negocio
6. **Escalabilidad**: Fácil agregar nuevos roles o niveles
7. **Simplicidad**: No requiere endpoints manuales de copia

### **🔄 Flujo Completo**
1. **Requerimiento** → Se firma y aprueba
2. **Cotización** → Se firma y aprueba
3. **Orden de Compra** → Se genera automáticamente con firmas copiadas
4. **Aprobación Final** → Orden de compra lista para ejecución

## Notas de Implementación

### **Consideraciones Técnicas**
- Las órdenes de compra heredan las firmas de la cotización automáticamente
- Se pueden agregar firmas adicionales específicas de la orden de compra
- El sistema mantiene trazabilidad completa de firmas
- Se integra con el sistema de permisos existente
- Usa la misma estructura base que otros documentos (ApprovalFlowBase)

### **Próximos Pasos**
1. Ejecutar migración de base de datos
2. Probar endpoints de firma
3. Integrar con frontend
4. Configurar plantillas de aprobación para órdenes de compra
5. Documentar casos de uso específicos 

## Nuevo Flujo: Requerimientos Administrativos

### **Descripción del Cambio**

Se ha implementado un nuevo flujo para requerimientos de tipo `ADMINISTRATIVO`:

- **Requerimientos Normales**: Requerimiento → Cotización → Orden de Compra
- **Requerimientos Administrativos**: Requerimiento → Orden de Compra (directo)

### **Cambios en la Entidad PurchaseOrder**

```typescript
@Entity()
export class PurchaseOrder extends ApprovalFlowBase {
  // ... campos existentes ...

  @ManyToOne(() => QuotationRequest, { nullable: true }) // Ahora opcional
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  @ManyToOne(() => Requirement, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requirement_id' })
  requirement: Requirement;
}
```

### **Cambios en el DTO**

```typescript
export class CreatePurchaseOrderDto {
  @IsOptional()
  @IsNumber()
  quotationRequestId?: number; // Ahora opcional

  @IsNumber()
  supplierId: number;
  // ... otros campos
}
```

### **Lógica en RequirementService**

```typescript
async sign(id: number, userId: number): Promise<Requirement> {
  // ... lógica de firma existente ...

  if (becameApproved) {
    if (savedRequirement.subType === 'ADMINISTRATIVO') {
      // Crear orden de compra directamente
      await this.createPurchaseOrderFromRequirement(savedRequirement);
    } else {
      // Crear cotización (flujo normal)
      const existingQuotation = await this.quotationService.getQuotationRequestByRequirement(savedRequirement.id);
      if (!existingQuotation) {
        await this.quotationService.createQuotationRequest(null, {
          requirementId: savedRequirement.id,
        });
      }
    }
  }
}

/**
 * Crea una orden de compra directamente desde un requerimiento administrativo
 */
private async createPurchaseOrderFromRequirement(requirement: Requirement): Promise<void> {
  // Obtener proveedores disponibles
  const suppliers = await this.getSuppliersForRequirement();
  
  // Calcular totales del requerimiento
  const totalAmount = this.calculateTotalAmount(requirement);
  const igv = totalAmount * 0.18; // 18% IGV
  const subtotal = totalAmount - igv;
  
  // Crear items basados en artículos y servicios del requerimiento
  const items = await this.createPurchaseOrderItems(requirement);
  
  // Crear DTO con datos del requerimiento
  const createPurchaseOrderDto = {
    supplierId: suppliers[0].id,
    // ... otros campos con datos del requerimiento
    items: items
  };
  
  // Crear orden de compra y copiar firmas
  const purchaseOrder = await this.purchaseOrderService.createPurchaseOrder(createPurchaseOrderDto);
  
  // Copiar firmas del requerimiento a la orden de compra
  // ... lógica de copia de firmas ...
  
  await this.purchaseOrderService.savePurchaseOrderWithSignatures(purchaseOrder);
}
```

### **Migración de Base de Datos**

```sql
-- Hacer quotation_request_id opcional
ALTER TABLE purchase_orders ALTER COLUMN quotation_request_id DROP NOT NULL;

-- Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_purchase_orders_quotation_request_id ON purchase_orders(quotation_request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_requirement_id ON purchase_orders(requirement_id);
``` 