# Configuraciones Generales del Sistema

## Descripción

Este módulo permite gestionar las configuraciones generales del sistema ERP MISER, incluyendo información de la empresa, logo, y gestión automática del tipo de cambio desde SUNAT.

## Características

### Configuraciones de Empresa
- **Nombre de la empresa**: Configurable desde la interfaz
- **Logo de la empresa**: URL del logo corporativo
- **Zona horaria**: Configuración de timezone (por defecto: America/Lima)

### Gestión de Tipo de Cambio
- **Actualización automática**: Se ejecuta diariamente a las 8:00 AM
- **Almacenamiento local**: Los datos se guardan en la base de datos
- **Actualización manual**: Posibilidad de actualizar manualmente desde la interfaz
- **Verificación horaria**: Revisa cada hora si necesita actualización

## Estructura de la Base de Datos

### Tabla: `general_settings`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | Clave primaria |
| `company_name` | VARCHAR(255) | Nombre de la empresa |
| `company_logo_url` | VARCHAR(500) | URL del logo (opcional) |
| `exchange_rate_sale` | DECIMAL(10,4) | Tipo de cambio de venta |
| `exchange_rate_purchase` | DECIMAL(10,4) | Tipo de cambio de compra |
| `exchange_rate_date` | DATE | Fecha del tipo de cambio |
| `exchange_rate_date_string` | VARCHAR(20) | Fecha en formato DD/MM/YYYY |
| `exchange_rate_auto_update` | BOOLEAN | Habilitar actualización automática |
| `timezone` | VARCHAR(100) | Zona horaria del sistema |
| `additional_settings` | TEXT | Configuraciones adicionales (JSON) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

## Endpoints de la API

### Configuraciones Generales

#### GET `/general-settings`
Obtiene las configuraciones generales del sistema.
- **Permisos**: `read:settings`
- **Roles**: `admin`

#### PUT `/general-settings`
Actualiza las configuraciones generales.
- **Permisos**: `update:settings`
- **Roles**: `admin`
- **Body**: `UpdateGeneralSettingsDto`

### Tipo de Cambio

#### GET `/general-settings/exchange-rate`
Obtiene el tipo de cambio completo actual.
- **Público**: Sí (sin autenticación)

#### GET `/general-settings/exchange-rate/sale`
Obtiene solo el tipo de cambio de venta.
- **Público**: Sí (sin autenticación)

#### POST `/general-settings/exchange-rate/update`
Actualiza manualmente el tipo de cambio desde SUNAT.
- **Permisos**: `update:settings`
- **Roles**: `admin`

#### GET `/general-settings/exchange-rate/should-update`
Verifica si el tipo de cambio necesita actualización.
- **Permisos**: `read:settings`
- **Roles**: `admin`

## Tareas Programadas

### Actualización Diaria del Tipo de Cambio
- **Horario**: 8:00 AM (America/Lima)
- **Frecuencia**: Diaria
- **Descripción**: Obtiene el tipo de cambio actualizado desde SUNAT y lo almacena en la base de datos

### Verificación Horaria
- **Frecuencia**: Cada hora
- **Descripción**: Verifica si el tipo de cambio necesita actualización y registra en logs

## Instalación y Configuración

### 1. Ejecutar Migración
```bash
npm run migrations:run
```

### 2. Ejecutar Seeder (Opcional)
```bash
npm run seed:all
```

### 3. Verificar Configuración
El sistema creará automáticamente una configuración por defecto si no existe.

## Uso en el Frontend

### Hooks Disponibles

```typescript
// Obtener configuraciones generales
const { data: settings, isLoading } = useGeneralSettings();

// Actualizar configuraciones
const updateSettings = useUpdateGeneralSettings();

// Obtener tipo de cambio actual
const { data: exchangeRate } = useCurrentExchangeRate();

// Obtener solo tipo de cambio de venta
const { data: saleRate } = useCurrentSaleRate();

// Actualizar manualmente el tipo de cambio
const updateExchangeRate = useUpdateExchangeRate();
```

### Componente de Ejemplo

```typescript
import { SunatExchangeRate } from '../components/common/SunatExchangeRate';

// Mostrar tipo de cambio con fecha
<SunatExchangeRate showDate={true} />

// Mostrar solo el valor
<SunatExchangeRate />
```

## Monitoreo y Logs

### Logs Importantes
- **Actualización automática**: Se registra cuando se ejecuta la tarea programada
- **Errores de SUNAT**: Se registran errores de conexión o formato inválido
- **Actualizaciones manuales**: Se registran las actualizaciones solicitadas por usuarios

### Verificación de Estado
```bash
# Verificar logs de tareas programadas
grep "update-exchange-rate" logs/app.log

# Verificar estado del tipo de cambio
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/general-settings/exchange-rate/should-update
```

## Consideraciones de Seguridad

1. **Permisos**: Solo usuarios con rol `admin` pueden modificar configuraciones
2. **Validación**: Todos los datos se validan antes de guardar
3. **Auditoría**: Las modificaciones se registran en el log de auditoría
4. **Rate Limiting**: Los endpoints públicos tienen limitación de velocidad

## Troubleshooting

### Problemas Comunes

1. **Tipo de cambio no se actualiza automáticamente**
   - Verificar que `exchange_rate_auto_update` esté en `true`
   - Revisar logs de tareas programadas
   - Verificar conectividad con SUNAT

2. **Error al obtener tipo de cambio**
   - Verificar que existan datos en la tabla `general_settings`
   - Revisar logs de errores de SUNAT
   - Ejecutar actualización manual

3. **Migración falla**
   - Verificar que no exista la tabla `general_settings`
   - Revisar permisos de base de datos
   - Ejecutar `npm run migrations:revert` si es necesario

### Comandos Útiles

```bash
# Verificar estado de la base de datos
npm run test:db

# Ejecutar migración específica
npm run migrations:run

# Revertir última migración
npm run migrations:revert

# Ejecutar seeders
npm run seed:all
``` 