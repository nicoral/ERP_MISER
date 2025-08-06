# ERP MISER - Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📋 Descripción

Backend del sistema ERP MISER desarrollado con NestJS, TypeScript y TypeORM. Sistema de gestión empresarial que incluye módulos de requerimientos, cotizaciones, órdenes de compra, inventario, empleados y más.

## 🚀 Configuración del Proyecto

### Instalación de Dependencias
```bash
$ npm install
```

### Ejecutar el Proyecto

```bash
# Desarrollo
$ npm run start

# Modo watch
$ npm run start:dev

# Producción
$ npm run start:prod
```

### Base de Datos
```bash
# Generar migración
$ npm run migration:generate -- --name nombre-migracion

# Ejecutar migraciones
$ npm run migration:run

# Revertir migración
$ npm run migration:revert
```

### Tests
```bash
# Tests unitarios
$ npm run test

# Tests e2e
$ npm run test:e2e

# Cobertura de tests
$ npm run test:cov
```

## 📚 Documentación

### 📖 Documentación Principal
- [Configuración General](./docs/GENERAL_SETTINGS_README.md) - Configuración del sistema y parámetros generales
- [Importación de Excel](./docs/EXCEL_IMPORT_README.md) - Guía completa para importación de datos desde Excel
- [Optimización de Importación](./docs/IMPORT_PERFORMANCE_OPTIMIZATION.md) - Mejores prácticas para optimizar importaciones
- [Test de Importación](./docs/test-import.md) - Guía para testing de funcionalidades de importación

### 🔐 Sistema de Firmas
- [Configuración Dinámica de Firmas](./docs/DYNAMIC_SIGNATURE_CONFIGURATION_README.md) - Sistema de firmas dinámicas y configuración
- [Firmas en Órdenes de Compra](./docs/PURCHASE_ORDER_SIGNATURES_README.md) - Implementación de firmas en órdenes de compra

### 🛒 Gestión de Compras
- [Proveedores por Defecto en Órdenes de Compra](./docs/PURCHASE_ORDER_DEFAULT_SUPPLIER_README.md) - Generación automática con proveedores por defecto
- [Integración de Proveedores en Servicios](./docs/SERVICE_SUPPLIER_INTEGRATION.md) - Asignación de proveedores por defecto a servicios

## 🏗️ Arquitectura

### Estructura del Proyecto
```
src/
├── app/
│   ├── controllers/     # Controladores de la API
│   ├── services/        # Lógica de negocio
│   ├── entities/        # Entidades de TypeORM
│   ├── dto/            # Data Transfer Objects
│   ├── guards/         # Guards de autenticación y autorización
│   ├── decorators/     # Decoradores personalizados
│   └── modules/        # Módulos de NestJS
├── config/             # Configuración de la aplicación
└── database/           # Migraciones y seeders
```

### Tecnologías Principales
- **NestJS** - Framework de Node.js
- **TypeScript** - Lenguaje de programación
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos principal
- **JWT** - Autenticación y autorización
- **Cloudinary** - Almacenamiento de archivos

## 🔒 Seguridad

### Nivel de Seguridad Actual

El sistema ERP_MISER implementa buenas prácticas de seguridad:

#### Backend (NestJS + TypeORM)
- **Autenticación JWT**: Tokens JWT para proteger endpoints
- **Guards de permisos y roles**: Acceso restringido mediante guards y decoradores
- **Validación de datos**: DTOs y class-validator para prevenir inyecciones
- **TypeORM**: Consultas parametrizadas para prevenir SQL injection
- **Gestión de archivos**: Subida a Cloudinary, evitando archivos en servidor
- **Auditoría y logs**: Registro de acciones administrativas
- **Variables de entorno**: Configuración sensible fuera del código
- **Prevención de ataques**: Protección contra CSRF, XSS y estructura modular segura

## 📦 Módulos Principales

### Gestión de Requerimientos
- Creación y gestión de requerimientos
- Sistema de aprobación con firmas
- Generación automática de cotizaciones

### Sistema de Cotizaciones
- Gestión de cotizaciones por proveedor
- Comparación de ofertas
- Selección final de proveedores

### Órdenes de Compra
- Generación automática desde cotizaciones
- Sistema de firmas integrado
- Gestión de pagos y entregas

### Inventario
- Gestión de artículos y servicios
- Control de stock
- Entradas y salidas de almacén

### Empleados y Usuarios
- Gestión de empleados
- Sistema de roles y permisos
- Autenticación y autorización

## 🚀 Deployment

### Preparación para Producción
1. Configurar variables de entorno
2. Ejecutar migraciones de base de datos
3. Configurar logs y monitoreo
4. Configurar SSL/TLS

### Plataformas Recomendadas
- **AWS** con NestJS Mau
- **Vercel** para deployment rápido
- **Docker** para containerización

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:
- Revisar la documentación en la carpeta `docs/`
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**ERP MISER** - Sistema de Gestión Empresarial

