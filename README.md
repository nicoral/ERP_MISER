# ERP MISER

Sistema de Gestión Empresarial (ERP) desarrollado para la empresa MISER, que permite la gestión integral de recursos, requerimientos, centros de costos y más.

## 🚀 Tecnologías

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router DOM
- Axios

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

## 🛠️ Instalación

### Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del backend con las siguientes variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_DATABASE=miser_db
JWT_SECRET=tu_secreto_jwt
```

4. Ejecutar migraciones:
```bash
npm run migration:run
```

5. Iniciar el servidor:
```bash
npm run start:dev
```

### Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## 📁 Estructura del Proyecto

### Backend
```
backend/
├── src/
│   ├── modules/         # Módulos de la aplicación
│   ├── common/          # Componentes y utilidades comunes
│   ├── config/          # Configuraciones
│   └── main.ts          # Punto de entrada
├── test/               # Tests
└── database/           # Migraciones y seeds
```

### Frontend
```
frontend/
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/         # Custom hooks
│   ├── services/      # Servicios API
│   ├── utils/         # Utilidades
│   ├── types/         # Tipos TypeScript
│   └── App.tsx        # Componente principal
└── public/            # Archivos estáticos
```

## 🔑 Características Principales

- **Gestión de Usuarios y Roles**
  - Sistema de autenticación JWT
  - Control de acceso basado en roles
  - Gestión de permisos por módulo

- **Centros de Costos**
  - Creación y gestión de centros de costos
  - Asignación de responsables
  - Seguimiento de presupuestos

- **Requerimientos**
  - Creación de requerimientos
  - Gestión de artículos y cantidades
  - Seguimiento de estados
  - Cálculo automático de totales

- **Artículos**
  - Catálogo de artículos
  - Gestión de inventario
  - Precios y códigos

## 🔒 Seguridad

- Autenticación mediante JWT
- Encriptación de contraseñas
- Validación de datos
- Protección contra CSRF
- Sanitización de inputs

## 🧪 Testing

### Backend
```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests e2e
npm run test:e2e
```

### Frontend
```bash
# Ejecutar tests
npm run test
```

## 📦 Despliegue

### Backend
```bash
# Construir para producción
npm run build

# Iniciar en producción
npm run start:prod
```

### Frontend
```bash
# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte, contactar al equipo de desarrollo o crear un issue en el repositorio.