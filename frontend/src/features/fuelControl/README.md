# Módulo de Control de Combustible

Este módulo permite gestionar el control diario de salidas e ingresos de combustible en la empresa.

## Características

### Listado Principal
- **Tabs**: Salidas e Ingresos
- **Filtros**: Por estado, fecha, encargado
- **Estadísticas**: Resumen por estado
- **Botones dinámicos**: 
  - "Crear Salidas" si no hay registro del día
  - "Actualizar salidas de hoy" si existe registro
  - "Registrar nuevo ingreso" para el tab de ingresos

### Estados del Control
- **En ejecución**: Control en proceso
- **Pendiente firma 1**: Esperando primera firma
- **Pendiente firma 2**: Esperando segunda firma  
- **Pendiente firma 3**: Esperando tercera firma
- **Completado**: Control finalizado

### Funcionalidades
- ✅ Listado con paginación
- ✅ Filtros avanzados
- ✅ Estadísticas en tiempo real
- ✅ Tabs para salidas e ingresos
- ✅ Botones dinámicos según estado
- ✅ Acciones: Ver, Editar
- ✅ Diseño responsive

## Estructura de Archivos

```
fuelControl/
├── components/
│   └── FuelControlList.tsx    # Componente principal
├── hooks/
│   └── useFuelControl.ts      # Hook con lógica de negocio
├── types.ts                   # Tipos TypeScript
└── README.md                  # Esta documentación
```

## Uso

```tsx
import { FuelControlList } from '../features/fuelControl/components/FuelControlList';

// En tu componente
<FuelControlList
  onViewFuelControl={handleView}
  onEditFuelControl={handleEdit}
  onCreateFuelControl={handleCreate}
  onCreateFuelInput={handleCreateInput}
/>
```

## Próximas Funcionalidades

- [ ] Formulario de creación/edición
- [ ] Vista de detalles
- [ ] Integración con backend
- [ ] Reportes y exportación
- [ ] Notificaciones
- [ ] Historial de cambios

## Patrones Utilizados

- **Tabs**: Usando `@radix-ui/react-tabs`
- **Tabla**: Componente `Table` reutilizable
- **Estadísticas**: Cards con estados visuales
- **Filtros**: Formulario expandible
- **Hook personalizado**: `useFuelControlService`
- **Mock data**: Para desarrollo sin backend 