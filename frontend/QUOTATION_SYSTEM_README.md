# Sistema de Gestión de Cotizaciones

## Descripción General

El Sistema de Gestión de Cotizaciones es una aplicación completa para gestionar el proceso de cotización de productos después de que se aprueba un requerimiento. Está diseñado con un enfoque de wizard (pasos progresivos) que guía al usuario a través de todo el proceso de manera intuitiva y eficiente.

## Características Principales

### 🎯 Proceso de 5 Pasos

1. **Selección de Proveedores**
   - Lista de proveedores con checkboxes
   - Filtros por categoría, ubicación y búsqueda
   - Vista de información detallada del proveedor
   - Selección múltiple con confirmación

2. **Generación de Órdenes de Cotización**
   - Tarjetas por proveedor con vista previa
   - Edición de términos personalizados
   - Exportación de PDF
   - Envío de órdenes
   - Configuración global de fechas límite

3. **Ingreso de Cotizaciones Recibidas**
   - Tabla editable por proveedor
   - Campos de precio, tiempo de entrega y notas
   - Guardado de borradores
   - Validación de datos
   - Cálculo automático de totales

4. **Comparación de Cotizaciones**
   - Tabla comparativa de precios
   - Resaltado visual del mejor precio
   - Análisis de mejores precios por producto
   - Resumen por proveedor
   - Selección de proveedores para comparar

5. **Selección Final**
   - Resumen de decisiones por producto
   - Selección manual o automática de proveedores
   - Notas internas
   - Generación de orden de compra final

## Arquitectura del Sistema

### Estructura de Archivos

```
frontend/src/features/quotation/
├── components/
│   ├── QuotationWizard.tsx          # Componente principal del wizard
│   ├── SupplierSelection.tsx        # Paso 1: Selección de proveedores
│   ├── GenerateOrders.tsx           # Paso 2: Generación de órdenes
│   ├── ReceiveQuotations.tsx        # Paso 3: Ingreso de cotizaciones
│   ├── CompareQuotations.tsx        # Paso 4: Comparación de precios
│   └── FinalSelection.tsx           # Paso 5: Selección final
└── hooks/
    └── useSupplierService.ts        # Hook para servicio de proveedores

frontend/src/types/
└── quotation.ts                     # Tipos TypeScript para cotizaciones

frontend/src/pages/
└── Quotations.tsx                   # Página principal de cotizaciones
```

### Tipos de Datos

#### QuotationRequest
```typescript
interface QuotationRequest {
  id: number;
  requirement: Requirement;
  selectedSuppliers: SelectedSupplier[];
  status: QuotationStatus;
  currentStep: QuotationStep;
  deadline: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### SelectedSupplier
```typescript
interface SelectedSupplier {
  supplier: Supplier;
  isSelected: boolean;
  quotationOrder?: QuotationOrder;
  receivedQuotation?: ReceivedQuotation;
  isFinalSelected?: boolean;
}
```

#### QuotationOrder
```typescript
interface QuotationOrder {
  id: number;
  supplierId: number;
  requirementId: number;
  orderNumber: string;
  terms: string;
  deadline: Date;
  status: 'DRAFT' | 'SENT' | 'RECEIVED';
  sentAt?: Date;
  receivedAt?: Date;
  pdfUrl?: string;
}
```

## Diseño de Interfaz

### Principios de Diseño

- **Estilo Empresarial Moderno**: Inspirado en sistemas como SAP, Odoo y Zoho
- **Navegación Intuitiva**: Wizard con pasos claros y progreso visual
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Accesibilidad**: Contraste adecuado y navegación por teclado
- **Dark Mode**: Soporte completo para modo oscuro

### Paleta de Colores

- **Primario**: Azul (#3B82F6) - Acciones principales y enlaces
- **Secundario**: Gris (#6B7280) - Texto secundario y bordes
- **Éxito**: Verde (#10B981) - Estados positivos y confirmaciones
- **Advertencia**: Amarillo (#F59E0B) - Estados de borrador y pendientes
- **Error**: Rojo (#EF4444) - Errores y estados críticos

### Componentes Reutilizables

- **Button**: Botones con variantes primary, secondary, outline
- **FormInput**: Campos de entrada con validación
- **Table**: Tabla responsive con paginación
- **Progress Steps**: Indicador de progreso del wizard

## Funcionalidades Clave

### 1. Selección de Proveedores

```typescript
// Filtros disponibles
- Búsqueda por nombre, RUC o contacto
- Filtro por categoría de productos
- Filtro por ubicación geográfica
- Selección múltiple con checkboxes
- Vista de información detallada
```

### 2. Generación de Órdenes

```typescript
// Características
- Generación automática de números de orden
- Edición de términos personalizados
- Vista previa de productos solicitados
- Exportación a PDF
- Envío masivo o individual
```

### 3. Ingreso de Cotizaciones

```typescript
// Funcionalidades
- Tabla editable por proveedor
- Cálculo automático de totales
- Validación de precios y cantidades
- Guardado de borradores
- Adjuntar archivos PDF
```

### 4. Comparación de Precios

```typescript
// Análisis disponible
- Comparación lado a lado
- Resaltado del mejor precio
- Análisis de mejores precios por producto
- Resumen financiero por proveedor
- Gráficos de comparación
```

### 5. Selección Final

```typescript
// Opciones de selección
- Selección automática por mejor precio
- Selección manual por criterios específicos
- Notas internas para justificación
- Generación de orden de compra
- Resumen final de decisiones
```

## Estados del Sistema

### QuotationStatus
```typescript
enum QuotationStatus {
  DRAFT = 'DRAFT',           // Borrador
  SENT = 'SENT',             // Enviada
  RECEIVED = 'RECEIVED',     // Recibida
  COMPARED = 'COMPARED',     // Comparada
  SELECTED = 'SELECTED',     // Seleccionada
  COMPLETED = 'COMPLETED'    // Completada
}
```

### QuotationStep
```typescript
enum QuotationStep {
  SUPPLIER_SELECTION = 0,    // Paso 1
  GENERATE_ORDERS = 1,       // Paso 2
  RECEIVE_QUOTATIONS = 2,    // Paso 3
  COMPARE_QUOTATIONS = 3,    // Paso 4
  FINAL_SELECTION = 4        // Paso 5
}
```

## Integración con el Sistema

### Servicios Utilizados

- **SupplierService**: Gestión de proveedores
- **RequirementService**: Información de requerimientos
- **ArticleService**: Datos de productos
- **PDFService**: Generación de documentos

### Hooks Personalizados

```typescript
// useSupplierService
const { suppliers, loading, error } = useSupplierService();

// useQuotationService (futuro)
const { quotations, createQuotation, updateQuotation } = useQuotationService();
```

## Configuración y Personalización

### Variables de Entorno

```env
# Configuración de fechas límite por defecto
REACT_APP_DEFAULT_QUOTATION_DEADLINE_DAYS=7
REACT_APP_DEFAULT_VALIDITY_DAYS=30

# Configuración de moneda por defecto
REACT_APP_DEFAULT_CURRENCY=PEN

# Configuración de términos estándar
REACT_APP_DEFAULT_QUOTATION_TERMS="Términos estándar de cotización"
```

### Personalización de Estilos

```css
/* Variables CSS personalizables */
:root {
  --quotation-primary-color: #3B82F6;
  --quotation-secondary-color: #6B7280;
  --quotation-success-color: #10B981;
  --quotation-warning-color: #F59E0B;
  --quotation-error-color: #EF4444;
}
```

## Uso del Sistema

### Iniciar un Proceso de Cotización

1. Navegar a la página de Cotizaciones
2. Hacer clic en "Iniciar Nuevo Proceso de Cotización"
3. Seleccionar el requerimiento aprobado
4. Seguir los 5 pasos del wizard

### Navegación entre Pasos

- **Avanzar**: Completar el paso actual y hacer clic en "Continuar"
- **Retroceder**: Hacer clic en "Volver" para editar pasos anteriores
- **Cancelar**: Hacer clic en "Cancelar" para salir del proceso

### Guardado y Recuperación

- Los datos se guardan automáticamente en cada paso
- Se puede retomar un proceso interrumpido
- Los borradores se mantienen hasta completar el proceso

## Mejores Prácticas

### Para Usuarios

1. **Selección de Proveedores**
   - Revisar la información completa del proveedor
   - Verificar categorías y ubicación
   - Considerar el historial de calificaciones

2. **Generación de Órdenes**
   - Personalizar términos según el proveedor
   - Establecer fechas límite realistas
   - Revisar la vista previa antes de enviar

3. **Ingreso de Cotizaciones**
   - Verificar precios y cantidades
   - Incluir notas importantes
   - Guardar borradores frecuentemente

4. **Comparación de Precios**
   - Analizar no solo el precio sino también el tiempo de entrega
   - Considerar la calidad del servicio
   - Revisar el historial del proveedor

5. **Selección Final**
   - Documentar las razones de selección
   - Revisar el resumen final
   - Confirmar antes de generar la orden

### Para Desarrolladores

1. **Mantenimiento del Código**
   - Seguir las convenciones de TypeScript
   - Mantener la consistencia en el naming
   - Documentar funciones complejas

2. **Performance**
   - Implementar lazy loading para componentes grandes
   - Optimizar re-renders con React.memo
   - Usar useMemo para cálculos costosos

3. **Testing**
   - Escribir tests unitarios para hooks
   - Implementar tests de integración para el wizard
   - Validar el flujo completo del usuario

## Roadmap Futuro

### Próximas Funcionalidades

1. **Análisis Avanzado**
   - Gráficos de tendencias de precios
   - Historial de cotizaciones por proveedor
   - Análisis de costos por categoría

2. **Automatización**
   - Envío automático de recordatorios
   - Notificaciones de vencimiento
   - Integración con sistemas de email

3. **Reportes**
   - Reportes de eficiencia de cotización
   - Análisis de ahorros
   - Dashboards ejecutivos

4. **Integración**
   - Conexión con sistemas de proveedores
   - Integración con sistemas de inventario
   - APIs para terceros

### Mejoras Técnicas

1. **Performance**
   - Implementación de virtualización para listas grandes
   - Optimización de consultas a la base de datos
   - Caching inteligente

2. **UX/UI**
   - Animaciones suaves entre pasos
   - Modo de pantalla completa para comparaciones
   - Accesibilidad mejorada

3. **Seguridad**
   - Validación robusta de datos
   - Auditoría de cambios
   - Control de acceso granular

## Soporte y Mantenimiento

### Documentación Técnica

- [Guía de Instalación](./INSTALLATION.md)
- [API Reference](./API_REFERENCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

### Contacto

Para soporte técnico o consultas sobre el sistema de cotizaciones:

- **Email**: soporte@empresa.com
- **Documentación**: [Wiki Interno](https://wiki.empresa.com/cotizaciones)
- **Issues**: [GitHub Issues](https://github.com/empresa/erp-miser/issues)

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Autor**: Equipo de Desarrollo ERP MISER 