# Generación Automática de Órdenes de Compra con Proveedores por Defecto

## Descripción

Se ha implementado la funcionalidad para que la generación automática de órdenes de compra desde requerimientos administrativos use los proveedores por defecto de los servicios.

## Problema Resuelto

### **Antes:**
- Los requerimientos administrativos generaban órdenes de compra automáticamente
- Se usaba un proveedor hardcodeado sin considerar los proveedores por defecto de los servicios
- No había lógica para seleccionar proveedores basados en los servicios del requerimiento

### **Después:**
- Se obtienen los proveedores por defecto de cada servicio en el requerimiento
- Si no hay proveedores por defecto, se usan los primeros 3 proveedores activos
- La lógica es más inteligente y considera la relación entre servicios y proveedores

## Cambios Implementados

### 1. **RequirementService** (`backend/src/app/services/requirement.service.ts`)

#### **Nuevo método `getSuppliersForRequirement`:**
```typescript
private async getSuppliersForRequirement(requirement: Requirement) {
  const suppliers = new Set<number>();
  
  // Obtener proveedores por defecto de los servicios del requerimiento
  if (requirement.requirementServices && requirement.requirementServices.length > 0) {
    for (const reqService of requirement.requirementServices) {
      // Cargar el servicio con su proveedor por defecto
      const serviceWithSupplier = await this.requirementServiceRepository
        .createQueryBuilder('reqService')
        .leftJoinAndSelect('reqService.service', 'service')
        .leftJoinAndSelect('service.defaultSupplier', 'defaultSupplier')
        .where('reqService.id = :id', { id: reqService.id })
        .getOne();

      if (serviceWithSupplier?.service?.defaultSupplier?.id) {
        suppliers.add(serviceWithSupplier.service.defaultSupplier.id);
      }
    }
  }

  // Si no hay proveedores por defecto, obtener todos los proveedores activos
  if (suppliers.size === 0) {
    const allSuppliers = await this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.status = :status', { status: 'ACTIVE' })
      .getMany();
    
    return allSuppliers.slice(0, 3); // Retornar los primeros 3 proveedores activos
  }

  // Obtener los proveedores por defecto encontrados
  const supplierIds = Array.from(suppliers);
  const defaultSuppliers = await this.supplierRepository
    .createQueryBuilder('supplier')
    .where('supplier.id IN (:...ids)', { ids: supplierIds })
    .getMany();

  return defaultSuppliers;
}
```

#### **Cambios en `createPurchaseOrderFromRequirement`:**
```typescript
// Antes:
const suppliers = await this.getSuppliersForRequirement();

// Después:
const suppliers = await this.getSuppliersForRequirement(requirement);
```

### 2. **RequirementModule** (`backend/src/app/modules/requirement.module.ts`)

#### **Agregada la entidad Supplier:**
```typescript
import { Supplier } from '../entities/Supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Requirement,
      RequirementArticle,
      RequirementServiceEntity,
      Supplier, // Nueva entidad agregada
    ]),
    // ... otros imports
  ],
})
```

### 3. **Inyección de Dependencias**

#### **Agregado SupplierService y SupplierRepository:**
```typescript
constructor(
  // ... otros servicios
  @InjectRepository(Supplier)
  private readonly supplierRepository: Repository<Supplier>,
  private readonly supplierService: SupplierService
) {}
```

## Flujo de Funcionamiento

### **1. Requerimiento Administrativo Aprobado**
```typescript
// En RequirementService.sign()
if (savedRequirement.subType === 'ADMINISTRATIVE') {
  // Crear orden de compra directamente
  await this.createPurchaseOrderFromRequirement(savedRequirement);
}
```

### **2. Obtención de Proveedores por Defecto**
```typescript
// Para cada servicio en el requerimiento
for (const reqService of requirement.requirementServices) {
  // Cargar servicio con su proveedor por defecto
  const serviceWithSupplier = await this.requirementServiceRepository
    .createQueryBuilder('reqService')
    .leftJoinAndSelect('reqService.service', 'service')
    .leftJoinAndSelect('service.defaultSupplier', 'defaultSupplier')
    .where('reqService.id = :id', { id: reqService.id })
    .getOne();

  if (serviceWithSupplier?.service?.defaultSupplier?.id) {
    suppliers.add(serviceWithSupplier.service.defaultSupplier.id);
  }
}
```

### **3. Fallback a Proveedores Activos**
```typescript
// Si no hay proveedores por defecto
if (suppliers.size === 0) {
  const allSuppliers = await this.supplierRepository
    .createQueryBuilder('supplier')
    .where('supplier.status = :status', { status: 'ACTIVE' })
    .getMany();
  
  return allSuppliers.slice(0, 3);
}
```

### **4. Creación de la Orden de Compra**
```typescript
const selectedSupplier = suppliers[0]; // Usar el primer proveedor disponible

const createPurchaseOrderDto = {
  supplierId: selectedSupplier.id,
  supplierName: selectedSupplier.businessName,
  supplierRUC: selectedSupplier.ruc,
  supplierAddress: selectedSupplier.address,
  supplierLocation: selectedSupplier.province, // Usar province en lugar de location
  supplierPhone: selectedSupplier.mobile,
  // ... otros campos
};
```

## Beneficios

### **1. Automatización Inteligente**
- Usa los proveedores por defecto configurados en los servicios
- Reduce la necesidad de selección manual de proveedores

### **2. Fallback Robusto**
- Si no hay proveedores por defecto, usa proveedores activos
- Garantiza que siempre haya un proveedor disponible

### **3. Integración Completa**
- Se integra con la funcionalidad de proveedores por defecto en servicios
- Mantiene la consistencia en toda la aplicación

### **4. Escalabilidad**
- Fácil de extender para agregar más lógica de selección de proveedores
- Permite agregar criterios adicionales en el futuro

## Consideraciones

### **1. Rendimiento**
- Las consultas incluyen JOINs para obtener proveedores por defecto
- Se recomienda monitorear el rendimiento en producción

### **2. Datos Requeridos**
- Los servicios deben tener proveedores por defecto configurados
- Los proveedores deben estar en estado ACTIVE

### **3. Logs y Monitoreo**
- Se agregaron logs de error para debugging
- Se recomienda monitorear las órdenes de compra generadas automáticamente

## Próximos Pasos

1. **Probar en desarrollo**: Verificar que la funcionalidad funciona correctamente
2. **Monitorear en producción**: Revisar logs y métricas de rendimiento
3. **Considerar mejoras**: 
   - Agregar más criterios de selección de proveedores
   - Implementar notificaciones cuando no hay proveedores por defecto
   - Agregar validaciones adicionales

## Compatibilidad

- ✅ Compatible con la funcionalidad existente de proveedores por defecto
- ✅ No afecta el flujo normal de cotizaciones
- ✅ Mantiene la integridad de datos
- ✅ Compatible con el sistema de firmas existente 