# Excel Import Backend - ERP MISER

Esta documentación describe la implementación de la funcionalidad de importación desde Excel en el backend del ERP MISER.

## Funcionalidades Implementadas

### 1. Importación de Empleados ✅
- **Servicio**: `ExcelImportService.parseEmployeeExcel()`
- **Controlador**: `EmployeeController.importFromExcel()`
- **Template**: `ExcelImportService.generateEmployeeTemplate()`

### 2. Importación de Artículos ✅
- **Servicio**: `ExcelImportService.parseArticleExcel()`
- **Controlador**: `ArticleController.importFromExcel()`
- **Template**: `ExcelImportService.generateArticleTemplate()`

## Arquitectura

### Patrón de Diseño
Ambos módulos siguen el mismo patrón arquitectónico:

```
Controller (recibe archivo) → Service (procesa archivo) → ExcelImportService (parsea Excel)
```

### Responsabilidades

#### Controllers
- **Solo reciben y pasan**: No contienen lógica de negocio
- **Validación básica**: Verificar que se proporcione un archivo
- **Respuesta estandarizada**: Retornan resultados con formato consistente

#### Services
- **Lógica de negocio**: Validación de datos, creación de entidades
- **Manejo de errores**: Tracking de errores por fila
- **Transacciones**: Asegurar consistencia de datos

#### ExcelImportService
- **Parsing de Excel**: Extracción de datos desde archivos
- **Validación de headers**: Verificar estructura del archivo
- **Generación de templates**: Crear archivos Excel con estructura correcta

## Endpoints

### Empleados
```
POST /employees/import/excel
GET  /employees/import/template
```

### Artículos
```
POST /articles/import/excel
GET  /articles/import/template
```

## Estructura de Datos

### Empleados
```typescript
interface ImportEmployeeRowDto {
  email?: string;
  documentId?: string;
  documentType?: string;
  firstName?: string;
  lastName?: string;
  area?: string;
  position?: string;
  phone?: string;
  address?: string;
  active?: boolean;
  hireDate?: string;
  birthDate?: string;
}
```

### Artículos
```typescript
interface ImportArticleDto {
  id: number;
  name: string;
  code: string;
  unitOfMeasure: string;
  type: string;
  rotationClassification: string;
  active: boolean;
  brandName: string;
  imageUrl?: string;
  warehouseStocks: ImportWarehouseStockDto[];
}

interface ImportWarehouseStockDto {
  warehouseName: string;
  stock: number;
  minStock: number;
  maxStock: number;
  line: string;
  shelf: string;
  valued: number;
}
```

## Validaciones

### Headers Requeridos

#### Empleados
- Email
- Documento
- Apellidos y nombres
- Cargo
- Celular
- Direccion

#### Artículos
- ID
- Nombre
- Código
- Unidad de Medida
- Tipo
- Clasificación de Rotación
- Activo
- Marca
- Almacén
- Stock
- Stock Mínimo
- Stock Máximo
- Línea
- Estante

### Validaciones de Negocio

#### Empleados
- Emails únicos
- Documentos únicos
- Campos obligatorios completos
- Formato de fechas válido

#### Artículos
- Códigos únicos
- Marcas existentes (o crear automáticamente)
- Almacenes existentes (o crear automáticamente)
- Configuración de stock válida

## Manejo de Errores

### Estructura de Respuesta
```typescript
interface ImportResult {
  message: string;
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}
```

### Tipos de Errores
1. **Errores de archivo**: Formato inválido, headers faltantes
2. **Errores de validación**: Campos requeridos, valores únicos
3. **Errores de negocio**: Relaciones inválidas, restricciones
4. **Errores de sistema**: Problemas de base de datos, permisos

## Templates Excel

### Características
- **Headers estilizados**: Fondo azul, texto blanco, negrita
- **Columnas auto-ajustadas**: Ancho optimizado al contenido
- **Datos de ejemplo**: Fila con valores de muestra
- **Formato consistente**: Misma estructura para ambos módulos

### Empleados
- 11 columnas con datos básicos y opcionales
- Validación de tipos de datos
- Formato de fechas YYYY-MM-DD

### Artículos
- 15 columnas incluyendo configuración de almacenes
- Soporte para múltiples almacenes por artículo
- Configuración de líneas y estantes

## Configuración de Almacenes

### Formato de Líneas
- Categorías únicas + números 1-10
- Ejemplo: "ELECTRONICA 1", "ROPA 3"

### Formato de Estantes
- Letras A-Z + números 1-10
- Ejemplo: "A 1", "B 3", "C 2"

### Configuración Múltiple
- Un artículo puede tener configuración en múltiples almacenes
- Cada fila representa una configuración específica
- Agrupación por ID de artículo

## Seguridad

### Permisos Requeridos
- `create_employee` para importación de empleados
- `create_articles` para importación de artículos

### Validaciones
- Tipos de archivo permitidos (.xlsx, .xls, .csv)
- Tamaño máximo de archivo
- Sanitización de datos de entrada

## Performance

### Optimizaciones
- Procesamiento por lotes
- Validación temprana de headers
- Manejo eficiente de memoria
- Transacciones optimizadas

### Límites Recomendados
- Máximo 1000 filas por importación
- Archivos menores a 10MB
- Timeout de 5 minutos

## Logging y Auditoría

### Auditoría Automática
- Todos los endpoints tienen `@AuditDescription`
- Tracking de importaciones exitosas y fallidas
- Registro de errores detallados

### Logs
- Información de inicio y fin de importación
- Estadísticas de procesamiento
- Errores con contexto completo

## Testing

### Casos de Prueba
1. **Archivos válidos**: Importación exitosa
2. **Headers faltantes**: Error de validación
3. **Datos duplicados**: Error de unicidad
4. **Archivos corruptos**: Error de parsing
5. **Permisos insuficientes**: Error de autorización

### Herramientas
- Jest para unit tests
- Supertest para integration tests
- Archivos Excel de prueba incluidos

## Mantenimiento

### Monitoreo
- Métricas de importación exitosa/fallida
- Tiempo promedio de procesamiento
- Errores más comunes

### Actualizaciones
- Nuevos campos agregados a templates
- Validaciones adicionales
- Mejoras de performance

## Próximas Mejoras

1. **Importación asíncrona**: Procesamiento en background
2. **Validación previa**: Preview de datos antes de importar
3. **Rollback automático**: Revertir cambios en caso de error
4. **Mapeo de columnas**: Permitir mapeo personalizado
5. **Importación incremental**: Actualizar registros existentes
6. **Notificaciones**: Alertas por email de resultados
7. **Reportes**: Generación de reportes de importación 