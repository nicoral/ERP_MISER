export const EMPLOYEES_TEXTS = {
  title: 'Empleados',
  loading: 'Cargando empleados...',
  error: 'Error al cargar los empleados',
  buttons: {
    create: 'Crear Empleado',
  },
  filters: {
    firstName: 'Nombre',
    lastName: 'Apellido',
    firstNamePlaceholder: 'Buscar por nombre...',
    lastNamePlaceholder: 'Buscar por apellido...',
    apply: 'Aplicar Filtros',
    clear: 'Limpiar Filtros',
    filtering: 'Filtrando...',
  },
  pagination: {
    previous: 'Anterior',
    next: 'Siguiente',
    showing: 'Mostrando',
    of: 'de',
    results: 'resultados',
  },
  table: {
    columns: {
      firstName: 'Nombre',
      lastName: 'Apellido',
      position: 'Cargo',
      phone: 'Teléfono',
      role: 'Rol',
      status: 'Estado',
      actions: 'Acciones',
    },
    status: {
      active: 'Activo',
      inactive: 'Inactivo',
    },
    actions: {
      view: 'Ver detalles',
      edit: 'Editar',
      block: 'Bloquear',
      unblock: 'Desbloquear',
      delete: 'Eliminar',
      confirmDelete: '¿Seguro que deseas eliminar este empleado?',
    },
  },
  form: {
    title: {
      create: 'Crear nuevo empleado',
      edit: 'Editar empleado',
    },
    fields: {
      firstName: 'Nombre',
      lastName: 'Apellido',
      position: 'Cargo',
      phone: 'Teléfono',
      role: 'Rol',
      active: 'Activo',
    },
    buttons: {
      save: 'Guardar',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      back: 'Volver',
    },
    errors: {
      save: 'Error al guardar el empleado',
    },
    select: {
      role: {
        placeholder: 'Seleccione un rol',
        options: {
          admin: 'Administrador',
          supervisor: 'Supervisor',
          user: 'Usuario',
        },
      },
    },
  },
};

export const SIDEBAR_TEXTS = {
  administration: 'Administración',
  employees: 'Empleados',
  warehouse: 'Almacén',
  warehouseArticles: 'Artículos',
  warehouseServices: 'Servicios',
  warehouseSuppliers: 'Proveedores',
  collapse: 'Colapsar menú',
  expand: 'Expandir menú',
};

export const HEADER_TEXTS = {
  systemName: 'Emixio',
  profile: 'Perfil',
  options: 'Opciones',
  themeLight: 'Tema Claro',
  themeDark: 'Tema Oscuro',
  logout: 'Cerrar sesión',
  admin: 'Admin',
  themeToggle: {
    light: 'Cambiar a tema oscuro',
    dark: 'Cambiar a tema claro',
  },
};

export const LOGIN_TEXTS = {
  title: 'Bienvenido a Emixio',
  subtitle: 'Ingresa tus credenciales para continuar',
  emailPlaceholder: 'Correo electrónico',
  passwordPlaceholder: 'Contraseña',
  rememberMe: 'Recuérdame',
  forgotPassword: '¿Olvidaste tu contraseña?',
  loginButton: 'Iniciar sesión',
  errors: {
    generic: 'Error al iniciar sesión. Por favor, intenta de nuevo.',
    invalidCredentials: 'Credenciales inválidas. Por favor, verifica tus datos.'
  }
};

export const COMMON_TEXTS = {
  loading: 'Cargando...',
  error: 'Error',
  success: 'Éxito',
  save: 'Guardar',
  cancel: 'Cancelar',
  back: 'Volver',
  edit: 'Editar',
  delete: 'Eliminar',
  create: 'Crear',
  search: 'Buscar',
  filter: 'Filtrar',
  noResults: 'No se encontraron resultados',
  required: 'Campo requerido',
  invalid: 'Campo inválido',
};

export const ADMINISTRATION_TEXTS = {
  title: 'Administración',
  panels: {
    general: {
      title: 'Configuración General',
      description: 'Gestión de parámetros del sistema',
    },
    users: {
      title: 'Usuarios y Permisos',
      description: 'Administración de usuarios y roles',
    },
    audit: {
      title: 'Auditoría',
      description: 'Registros y reportes del sistema',
    },
  },
  generalForm: {
    companyName: 'Nombre de la empresa',
    contactEmail: 'Correo de contacto',
    phone: 'Teléfono',
    address: 'Dirección',
    currency: 'Moneda predeterminada',
    language: 'Idioma del sistema',
    timezone: 'Zona horaria',
    startDate: 'Fecha de inicio de operaciones',
    logo: 'Logo de la empresa',
    save: 'Guardar cambios',
  },
  usersForm: {
    view: 'Ver',
    name: 'Nombre completo',
    email: 'Email',
    date: 'Fecha de ingreso',
    notes: 'Notas',
    role: 'Rol',
    status: 'Estado',
    permissions: 'Permisos',
    save: 'Guardar usuario',
    add: 'Agregar usuario',
    edit: 'Editar',
    block: 'Bloquear',
    unblock: 'Desbloquear',
    delete: 'Eliminar',
  },
  audit: {
    user: 'Usuario',
    date: 'Fecha',
    action: 'Tipo de acción',
    filter: 'Filtrar',
    export: 'Exportar CSV',
    columns: {
      datetime: 'Fecha/Hora',
      user: 'Usuario',
      action: 'Acción',
      detail: 'Detalle',
    },
  },
};

export const WAREHOUSE_TEXTS = {
  articles: {
    title: 'Artículos',
    loading: 'Cargando artículos...',
    error: 'Error al cargar artículos',
    buttons: {
      create: 'Crear nuevo artículo',
    },
    table: {
      columns: {
        code: 'Código',
        name: 'Nombre',
        category: 'Categoría',
        stock: 'Stock',
        price: 'Precio',
        status: 'Estado',
        actions: 'Acciones',
      },
      status: {
        active: 'Activo',
        inactive: 'Inactivo',
      },
      actions: {
        view: 'Ver',
        edit: 'Editar',
        delete: 'Eliminar',
      },
    },
  },
  services: {
    title: 'Servicios',
    loading: 'Cargando servicios...',
    error: 'Error al cargar servicios',
    buttons: {
      create: 'Crear nuevo servicio',
    },
    table: {
      columns: {
        code: 'Código',
        name: 'Nombre',
        type: 'Tipo',
        price: 'Precio',
        status: 'Estado',
        actions: 'Acciones',
      },
      status: {
        active: 'Activo',
        inactive: 'Inactivo',
      },
      actions: {
        view: 'Ver',
        edit: 'Editar',
        delete: 'Eliminar',
      },
    },
  },
  suppliers: {
    title: 'Proveedores',
    loading: 'Cargando proveedores...',
    error: 'Error al cargar proveedores',
    buttons: {
      create: 'Crear nuevo proveedor',
    },
    table: {
      columns: {
        code: 'Código',
        name: 'Nombre',
        contact: 'Contacto',
        phone: 'Teléfono',
        email: 'Email',
        status: 'Estado',
        actions: 'Acciones',
      },
      status: {
        active: 'Activo',
        inactive: 'Inactivo',
      },
      actions: {
        view: 'Ver',
        edit: 'Editar',
        delete: 'Eliminar',
      },
    },
  },
  warehouses: {
    title: 'Almacenes',
    loading: 'Cargando almacenes...',
    error: 'Error al cargar almacenes',
    buttons: {
      create: 'Crear nuevo almacén',
    },
    table: {
      columns: {
        code: 'Código',
        name: 'Nombre',
        location: 'Ubicación',
        status: 'Estado',
        actions: 'Acciones',
      },
      status: {
        active: 'Activo',
        inactive: 'Inactivo',
      },
      actions: {
        view: 'Ver',
        edit: 'Editar',
        delete: 'Eliminar',
      },
    },
  },
}; 