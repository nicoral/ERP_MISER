# Excel Import Frontend - ERP MISER

Esta documentación describe la implementación de la funcionalidad de importación desde Excel en el frontend del ERP MISER.

## Funcionalidades Implementadas

### 1. Importación de Empleados ✅
- **Ubicación**: `src/features/employees/components/ExcelImportModal.tsx`
- **Servicio**: `src/services/api/employeeService.ts`
- **Integración**: `src/features/employees/components/EmployeeList.tsx`

### 2. Importación de Artículos ✅
- **Ubicación**: `src/features/article/components/ExcelImportModal.tsx`
- **Servicio**: `src/services/api/articleService.ts`
- **Integración**: `src/features/article/components/ArticleList.tsx`

## Estructura de Componentes

### ExcelImportModal

El componente `ExcelImportModal` es reutilizable y sigue el mismo patrón para ambos módulos:

```typescript
interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

#### Características:
- **Descarga de Template**: Botón para descargar el template Excel con la estructura correcta
- **Subida de Archivo**: Drag & drop o selección de archivo con validación de tipos
- **Procesamiento**: Importación con feedback visual y manejo de errores
- **Resultados**: Estadísticas de importación exitosa y errores detallados
- **Información**: Guía de uso y requisitos del template

#### Estados:
- `isLoading`: Control de estados de carga
- `selectedFile`: Archivo seleccionado para importar
- `importResult`: Resultados de la importación

## Servicios API

### EmployeeService
```typescript
export const downloadEmployeeTemplate = async (): Promise<Blob>
export const importEmployeesFromExcel = async (file: File): Promise<ImportResult>
```

### ArticleService
```typescript
export const downloadArticleTemplate = async (): Promise<Blob>
export const importArticlesFromExcel = async (file: File): Promise<ImportResult>
```

### Interface ImportResult
```typescript
export interface ImportResult {
  message: string;
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}
```

## Integración en Listas

### EmployeeList
- Botón "📊 Importar Excel" junto al botón de crear
- Modal de importación integrado
- Refetch automático de datos después de importación exitosa

### ArticleList
- Botón "📊 Importar Excel" junto al botón de crear
- Modal de importación integrado
- Refetch automático de datos después de importación exitosa

## Validaciones Frontend

### Tipos de Archivo Soportados
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- `.csv` (Comma Separated Values)

### Validaciones de UI
- Verificación de tipo de archivo antes de subir
- Feedback visual durante la carga
- Manejo de errores con mensajes descriptivos
- Confirmación de éxito con estadísticas

## Flujo de Usuario

### Para Empleados:
1. Usuario hace clic en "📊 Importar Excel"
2. Descarga el template con estructura de empleados
3. Llena el template con datos
4. Sube el archivo completado
5. Sistema procesa y muestra resultados
6. Lista se actualiza automáticamente

### Para Artículos:
1. Usuario hace clic en "📊 Importar Excel"
2. Descarga el template con estructura de artículos
3. Llena el template con datos (incluyendo configuración de almacenes)
4. Sube el archivo completado
5. Sistema procesa y muestra resultados
6. Lista se actualiza automáticamente

## Información de Templates

### Empleados
- Campos obligatorios: email, documentId, firstName, lastName, position, phone, address
- Emails y documentos deben ser únicos
- Fechas en formato YYYY-MM-DD
- Contraseña generada automáticamente

### Artículos
- Campos obligatorios: code, name, type, unitOfMeasure, rotationClassification
- Códigos de artículos deben ser únicos
- Marcas deben existir previamente
- Configuración de almacenes: "Almacén1:Linea1-Estante1:MinStock:MaxStock;Almacén2:Linea2-Estante2:MinStock:MaxStock"
- Líneas: categorías únicas + números 1-10
- Estantes: letras A-Z + números 1-10

## Componentes Reutilizables

### Icons
- `DownloadIcon`: Para descarga de templates
- `UploadIcon`: Para subida de archivos
- `XIcon`: Para cerrar/remover archivos

### UI Components
- `Modal`: Contenedor del modal de importación
- `Button`: Botones de acción
- `LoadingSpinner`: Indicador de carga

## Manejo de Errores

### Errores de Red
- Timeout de conexión
- Errores de servidor (500, 404, etc.)
- Problemas de autenticación

### Errores de Validación
- Tipos de archivo no soportados
- Estructura de datos incorrecta
- Campos obligatorios faltantes
- Valores duplicados

### Feedback al Usuario
- Mensajes de error descriptivos
- Indicación de fila específica con error
- Estadísticas de éxito/fallo
- Opción de reintentar

## Consideraciones Técnicas

### Performance
- Validación de archivo antes de subir
- Procesamiento asíncrono
- Feedback visual inmediato
- Refetch optimizado de datos

### UX/UI
- Diseño responsive
- Soporte para tema oscuro
- Accesibilidad (ARIA labels)
- Feedback visual claro

### Seguridad
- Validación de tipos de archivo
- Sanitización de datos
- Manejo seguro de tokens
- Prevención de XSS

## Próximas Mejoras

1. **Progreso de Importación**: Barra de progreso para archivos grandes
2. **Validación Previa**: Preview de datos antes de importar
3. **Mapeo de Columnas**: Permitir mapear columnas del Excel
4. **Importación Parcial**: Continuar importación desde donde falló
5. **Logs Detallados**: Historial de importaciones
6. **Templates Dinámicos**: Generar templates según configuración
7. **Exportación de Errores**: Descargar lista de errores en Excel

## Dependencias

- `@tanstack/react-query`: Manejo de estado y cache
- `react-router-dom`: Navegación
- `tailwindcss`: Estilos
- APIs nativas del navegador para manejo de archivos

## Testing

### Casos de Prueba Recomendados
1. Descarga de templates
2. Subida de archivos válidos
3. Subida de archivos inválidos
4. Manejo de errores de red
5. Validación de permisos
6. Actualización de listas después de importación
7. Responsive design
8. Accesibilidad

### Herramientas de Testing
- Jest para unit tests
- React Testing Library para component tests
- Cypress para e2e tests
- MSW para mock de APIs 