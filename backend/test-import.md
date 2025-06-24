# Pruebas de Importación de Artículos - Implementación Final

## Pasos Implementados

### 1. **Parsear Data del Excel**
- **Agrupación por ID**: Los productos con el mismo ID se agrupan automáticamente
- **Warehouses únicos**: No se repiten warehouses para el mismo producto
- **Mapeo directo**: Usa exactamente los headers del template sin normalización

### 2. **Validación y Procesamiento**
- **Validación de datos**: Verifica que el producto tenga todos los campos requeridos
- **Búsqueda de producto**: Si existe por ID, actualiza; si no existe, crea
- **Manejo de marcas**: Si la marca no existe, la crea automáticamente
- **Manejo de almacenes**: Si el almacén no existe, agrega error y continúa

### 3. **Inserción Forzada con ID Específico**
- **Función `forceInsertArticleWithId`**: Usa queries SQL directas para forzar inserción con ID específico
- **Reinicio de secuencia**: Después de cada inserción, reinicia la secuencia de la base de datos
- **Manejo robusto**: Asegura que los IDs se guarden correctamente sin conflictos

## Estructura del Excel

El sistema espera exactamente estos headers en este orden:

```
ID | Nombre | Código | Unidad de Medida | Tipo | Clasificación de Rotación | Activo | Marca | Almacén | Stock | Stock Mínimo | Stock Máximo | Línea | Estante | Valorado
```

### Ejemplo de Datos:
```
1 | Laptop HP Pavilion | LAP001 | UNIDAD | NUEVO | ALTA | true | HP | Almacén Principal | 10 | 5 | 50 | Línea ELECTRONICA 1 | Estante A 1 | 1500.00
1 | Laptop HP Pavilion | LAP001 | UNIDAD | NUEVO | ALTA | true | HP | Almacén Secundario | 5 | 2 | 20 | Línea ELECTRONICA 2 | Estante B 3 | 1500.00
2 | Mouse Inalámbrico | MOU001 | UNIDAD | NUEVO | MEDIA | true | Logitech | Almacén Principal | 25 | 10 | 100 | Línea ELECTRONICA 3 | Estante C 2 | 25.00
```

## Flujo de Procesamiento

### Paso 1: Parsear Excel
```typescript
// Agrupa por ID y elimina warehouses duplicados
const articleGroups = new Map<number, Array<{ row, rowNumber }>>();
// Extrae datos usando índices exactos del template
const articleData = {
  id: firstRow[0],
  name: firstRow[1],
  // ... resto de campos
};
// Warehouses únicos por producto
const warehouseMap = new Map<string, ImportWarehouseStockDto>();
```

### Paso 2: Validar Datos
```typescript
// Valida campos requeridos
if (!this.validateArticleData(articleData)) {
  result.errors.push(`Artículo ID ${articleData.id}: Faltan datos requeridos`);
  continue;
}
```

### Paso 3: Buscar/Crear Marca
```typescript
// Busca marca existente o crea nueva
let brand = brandMap.get(articleData.brandName?.toLowerCase());
if (!brand && articleData.brandName) {
  brand = this.brandRepository.create({ name: articleData.brandName });
  brand = await this.brandRepository.save(brand);
}
```

### Paso 4: Buscar/Crear Producto
```typescript
// Si existe, actualiza; si no existe, crea con force insert
const existingArticle = await this.articleRepository.findOne({ where: { id: articleData.id } });
if (existingArticle) {
  // Actualizar campos
  existingArticle.name = articleData.name;
  // ... resto de campos
  article = await this.articleRepository.save(existingArticle);
} else {
  // Crear nuevo con force insert
  article = await this.forceInsertArticleWithId(articleData, brand?.id);
}
```

### Paso 5: Force Insert con ID Específico
```typescript
// Función forceInsertArticleWithId
private async forceInsertArticleWithId(articleData: ImportArticleDto, brandId?: number): Promise<Article> {
  // Forzar inserción con ID específico
  await this.dataSource.query(
    `INSERT INTO articulo (id, nombre, codigo, unidad_medida, tipo, clasificacion_rotacion, activo, marca_id, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [articleData.id, articleData.name, /* ... resto de valores */]
  );

  // Reiniciar la secuencia
  await this.dataSource.query(`
    SELECT setval('articulo_id_seq', (SELECT MAX(id) FROM articulo));
  `);

  return this.findOne(articleData.id!);
}
```

### Paso 6: Procesar Almacenes
```typescript
// Verifica que el almacén exista
const warehouse = warehouseMap.get(stockData.warehouseName.toLowerCase());
if (!warehouse) {
  result.errors.push(`Artículo ID ${articleData.id}: Almacén "${stockData.warehouseName}" no existe`);
  continue;
}
// Busca configuración existente o crea nueva
```

## Cómo Probar

### 1. **Descargar Template**
```bash
GET /api/articles/import/template
```

### 2. **Llenar con Datos de Prueba**
- Usar exactamente los headers del template
- Agregar datos de prueba con múltiples warehouses por producto
- Guardar como .xlsx

### 3. **Importar**
```bash
POST /api/articles/import
Content-Type: multipart/form-data
file: [archivo.xlsx]
```

### 4. **Verificar Respuesta**
```json
{
  "message": "Importación completada. 2 artículos importados exitosamente.",
  "success": 2,
  "errors": [
    "Artículo ID 3: Almacén \"Almacén Inexistente\" no existe"
  ],
  "total": 3
}
```

### 5. **Verificar en Base de Datos**

```sql
-- Verificar artículos con IDs específicos
SELECT id, name, code, brand_id FROM articles WHERE id IN (1, 2);

-- Verificar marcas creadas
SELECT id, name FROM brands WHERE name IN ('HP', 'Logitech');

-- Verificar configuraciones de almacén
SELECT 
  a.id as article_id,
  a.name as article_name,
  b.name as brand_name,
  w.name as warehouse_name,
  wa.stock,
  wa.min_stock,
  wa.max_stock,
  wa.line,
  wa.shelf,
  wa.valued
FROM articles a
LEFT JOIN brands b ON a.brand_id = b.id
JOIN warehouse_articles wa ON a.id = wa.article_id
JOIN warehouses w ON wa.warehouse_id = w.id
WHERE a.id IN (1, 2)
ORDER BY a.id, w.name;

-- Verificar secuencia
SELECT currval('articulo_id_seq');
```

## Casos de Prueba

### Caso 1: Producto Nuevo con Marca Nueva
- **Input**: Producto con marca que no existe
- **Resultado**: Se crea la marca y el producto con ID específico
- **Logs**: Sin logs (como solicitado)

### Caso 2: Producto Existente
- **Input**: Producto con ID que ya existe
- **Resultado**: Se actualiza el producto existente
- **Logs**: Sin logs

### Caso 3: Almacén Inexistente
- **Input**: Producto con almacén que no existe
- **Resultado**: Error agregado, continúa con siguiente
- **Logs**: Sin logs

### Caso 4: Datos Faltantes
- **Input**: Producto sin campos requeridos
- **Resultado**: Error agregado, continúa con siguiente
- **Logs**: Sin logs

### Caso 5: Warehouses Duplicados
- **Input**: Múltiples filas con mismo ID y mismo almacén
- **Resultado**: Solo se procesa una configuración por almacén
- **Logs**: Sin logs

### Caso 6: ID Específico Forzado
- **Input**: Producto con ID específico (ej: 1001)
- **Resultado**: Se crea con ID exacto usando force insert
- **Verificación**: `SELECT id FROM articulo WHERE id = 1001;`
- **Secuencia**: Se reinicia automáticamente

## Ventajas de la Implementación

1. **Simplicidad**: Mapeo directo por índices sin normalización
2. **Confiabilidad**: Usa exactamente el template oficial
3. **Robustez**: Maneja errores sin detener el proceso
4. **Eficiencia**: Agrupa productos y elimina duplicados
5. **Flexibilidad**: Crea marcas automáticamente, valida almacenes
6. **Sin logs**: Procesamiento silencioso como solicitado
7. **ID específico**: Force insert garantiza IDs exactos del Excel
8. **Secuencia automática**: Se reinicia después de cada inserción 