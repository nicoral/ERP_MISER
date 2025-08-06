# Integración de Proveedor por Defecto en Servicios

## Descripción

Se ha agregado la funcionalidad para asignar un proveedor por defecto opcional a los servicios. Esto permite que cada servicio tenga un proveedor predeterminado que se puede usar en procesos de cotización y compra.

## Cambios Realizados

### 1. Entidad Service

Se agregó la relación con la entidad Supplier:

```typescript
@Column('int', { name: 'default_supplier_id', nullable: true })
defaultSupplierId: number;

@ManyToOne(() => Supplier, { nullable: true })
@JoinColumn({ name: 'default_supplier_id' })
defaultSupplier: Supplier;
```

### 2. DTOs Actualizados

#### CreateServiceDto
```typescript
export class CreateServiceDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  defaultSupplierId?: number;
}
```

#### UpdateServiceDto
Hereda de CreateServiceDto, por lo que automáticamente incluye el campo `defaultSupplierId`.

### 3. Servicio Actualizado

El `ServiceService` ahora incluye la relación con el proveedor por defecto en las consultas:

- `findAll()`: Incluye `leftJoinAndSelect` para el proveedor por defecto
- `findOne()`: Incluye la relación `defaultSupplier` en las consultas

### 4. Migración

Se creó la migración `1754502070252-add-default-supplier-to-service.ts` que:
- Agrega la columna `default_supplier_id` a la tabla `service`
- Establece la clave foránea con la tabla `supplier`
- Permite valores NULL para hacer el campo opcional

## Uso

### Crear un servicio con proveedor por defecto

```typescript
// POST /services
{
  "code": "SERV001",
  "name": "Servicio de Mantenimiento",
  "active": true,
  "defaultSupplierId": 1  // ID del proveedor por defecto
}
```

### Actualizar un servicio con proveedor por defecto

```typescript
// PUT /services/1
{
  "defaultSupplierId": 2  // Cambiar el proveedor por defecto
}
```

### Consultar servicios con proveedor por defecto

```typescript
// GET /services
// La respuesta incluirá el proveedor por defecto en cada servicio
{
  "data": [
    {
      "id": 1,
      "code": "SERV001",
      "name": "Servicio de Mantenimiento",
      "active": true,
      "defaultSupplierId": 1,
      "defaultSupplier": {
        "id": 1,
        "businessName": "Proveedor ABC",
        "ruc": "12345678901",
        // ... otros campos del proveedor
      }
    }
  ],
  "total": 1
}
```

## Consideraciones

1. **Opcional**: El campo `defaultSupplierId` es completamente opcional
2. **Integridad Referencial**: Si se elimina un proveedor, el campo se establece en NULL automáticamente
3. **Validación**: El DTO valida que el `defaultSupplierId` sea un número válido
4. **Rendimiento**: Las consultas incluyen JOIN con la tabla supplier para obtener los datos del proveedor

## Próximos Pasos

Para aplicar estos cambios:

1. Ejecutar la migración: `npm run migration:run`
2. Reiniciar el servidor backend
3. Probar las nuevas funcionalidades a través de la API 