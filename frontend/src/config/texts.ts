export const EMPLOYEES_TEXTS = {
  title: 'Empleados',
  loading: 'Cargando empleados...',
  error: 'Error al cargar los empleados',
  buttons: {
    create: 'Crear Empleado',
  },
  filters: {
    search: 'Buscar:',
    title: 'Filtros',
    searchPlaceholder: 'nombre, apellido, correo electrónico, teléfono...',
    apply: 'Aplicar',
    clear: 'Limpiar',
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
      id: 'ID',
      firstName: 'Nombre',
      lastName: 'Apellido',
      position: 'Cargo',
      email: 'Correo electrónico',
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
      area: 'Área',
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo electrónico',
      documentId: 'Documento de identidad',
      documentType: 'Tipo de documento',
      address: 'Dirección',
      position: 'Cargo',
      phone: 'Teléfono',
      hireDate: 'Fecha de alta',
      dischargeDate: 'Fecha de baja',
      birthDate: 'Fecha de nacimiento',
      role: 'Rol',
      active: 'Activo',
      warehousesAssigned: 'Almacenes asignados',
    },
    buttons: {
      save: 'Guardar',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      back: 'Volver',
    },
    errors: {
      save: 'Error al guardar el empleado',
      update: 'Error al actualizar el empleado',
    },
    select: {
      area: {
        placeholder: 'Seleccione un area',
      },
      warehouses: {
        placeholder: 'Seleccione almacenes asignados',
      },
      documentType: {
        placeholder: 'Seleccione un tipo de documento',
      },
      role: {
        placeholder: 'Seleccione un rol',
      },
      position: {
        placeholder: 'Seleccione un cargo',
      },
    },
  },
};

export const SIDEBAR_TEXTS = {
  administration: 'Administración',
  employees: 'Empleados',
  process: 'Procesos',
  processRequirement: 'Requerimiento',
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
    invalidCredentials:
      'Credenciales inválidas. Por favor, verifica tus datos.',
  },
};

export const COMMON_TEXTS = {
  loading: 'Cargando...',
  error: 'Error',
  success: 'Éxito',
  save: 'Guardar',
  update: 'Actualizar',
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
  group: 'GRUPO',
};

export const ADMINISTRATION_TEXTS = {
  title: 'Administración',
  panels: {
    general: {
      title: 'Configuración General',
      description: 'Gestión de parámetros del sistema',
    },
    roles: {
      title: 'Roles y permisos',
      description: 'Administración de roles y permisos',
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
  rolesForm: {
    edit: 'Editar rol',
    create: 'Crear rol',
    back: 'Volver',
    view: 'Ver',
    name: 'Nombre',
    permissions: 'Permisos',
    description: 'Descripción',
    save: 'Guardar rol',
    add: 'Agregar rol',
    delete: 'Eliminar',
    saving: 'Guardando rol...',
    error: 'Error al guardar el rol',
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
    buttons: {
      create: 'Crear Artículo',
    },
    form: {
      title: {
        create: 'Crear nuevo artículo',
        edit: 'Editar artículo',
        back: 'Volver',
      },
      fields: {
        code: 'Código',
        name: 'Nombre',
        brand: 'Marca',
        line: 'Linea',
        shelf: 'Estante',
        type: 'Tipo',
        unitOfMeasure: 'Unidad de medida',
        unit: 'Unidad',
        rotationClassification: 'Clasificación de rotación',
        rotation: 'Rotación',
        minStock: 'Stock mínimo',
        maxStock: 'Stock máximo',
        imageUrl: 'URL de la imagen',
        active: 'Estado',
        warehouse: 'Almacén',
        stock: 'Stock',
        selectWarehouse: 'Seleccionar almacén',
        warehouseArticles: 'Stocks de almacenes',
      },
      buttons: {
        addWarehouse: 'Agregar almacén',
      },
      errors: {
        save: 'Error al guardar el artículo',
        warehouseDuplicate: 'No puedes asignar el mismo almacén más de una vez',
        warehouseAlreadyAssigned: 'Este almacén ya está asignado',
      },
    },
    filters: {
      title: 'Filtros',
      code: 'Código',
      name: 'Nombre',
      category: 'Categoría',
      codePlaceholder: 'Buscar por código...',
      namePlaceholder: 'Buscar por nombre...',
      categoryPlaceholder: 'Buscar por categoría...',
      apply: 'Aplicar',
      clear: 'Limpiar',
      filtering: 'Filtrando...',
    },
    table: {
      columns: {
        id: 'ID',
        name: 'Nombre',
        code: 'Código',
        line: 'Linea',
        shelf: 'Estante',
        type: 'Tipo',
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
    loading: 'Cargando artículos...',
    empty: 'No hay artículos para mostrar.',
    details: {
      title: '🧾 Detalles del Artículo',
    },
  },
  services: {
    title: 'Servicios',
    buttons: {
      create: 'Crear Servicio',
    },
    filters: {
      title: 'Filtros',
      code: 'Código',
      name: 'Nombre',
      type: 'Tipo',
      codePlaceholder: 'Buscar por código...',
      namePlaceholder: 'Buscar por nombre...',
      typePlaceholder: 'Buscar por tipo...',
      apply: 'Aplicar',
      clear: 'Limpiar',
      filtering: 'Filtrando...',
    },
    table: {
      columns: {
        code: 'Código',
        name: 'Nombre',
        type: 'Tipo',
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
    loading: 'Cargando servicios...',
    empty: 'No hay servicios para mostrar.',
  },
  suppliers: {
    title: 'Proveedores',
    buttons: {
      create: 'Crear Proveedor',
    },
    filters: {
      title: 'Filtros',
      code: 'Código',
      name: 'Nombre',
      contact: 'Contacto',
      codePlaceholder: 'Buscar por código...',
      namePlaceholder: 'Buscar por nombre...',
      contactPlaceholder: 'Buscar por contacto...',
      apply: 'Aplicar',
      clear: 'Limpiar',
      filtering: 'Filtrando...',
    },
    table: {
      columns: {
        code: 'Código',
        name: 'Nombre',
        contact: 'Contacto',
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
    loading: 'Cargando proveedores...',
    empty: 'No hay proveedores para mostrar.',
  },
  warehouses: {
    title: 'Almacenes',
    buttons: {
      create: 'Crear Almacén',
    },
    filters: {
      title: 'Filtros',
      search: 'Buscar:',
      searchPlaceholder: 'nombre, dirección...',
      apply: 'Aplicar',
      clear: 'Limpiar',
      filtering: 'Filtrando...',
    },
    table: {
      columns: {
        id: 'ID',
        name: 'Nombre',
        address: 'Dirección',
        hireDate: 'Fecha de alta',
        dismissalDate: 'Fecha de baja',
        employee: 'Encargado',
        valued: 'Valorizado',
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
    loading: 'Cargando almacenes...',
    empty: 'No hay almacenes para mostrar.',
  },
  form: {
    title: {
      create: 'Crear nuevo almacén',
      edit: 'Editar almacén',
    },
    fields: {
      name: 'Nombre',
      address: 'Dirección',
      valued: 'Valor',
      hireDate: 'Fecha de alta',
      dismissalDate: 'Fecha de baja',
      employee: 'Encargado',
      active: 'Activo',
    },
    select: {
      employee: {
        placeholder: 'Seleccione un encargado',
      },
    },
    errors: {
      save: 'Error al guardar el almacén',
    },
  },
};

export const PROFILE_TEXTS = {
  title: 'Mi Perfil',
  personalInfo: {
    title: 'Información Personal',
    changePhoto: 'Cambiar foto de perfil',
    updating: 'Actualizando...',
  },
  settings: {
    title: 'Configuración',
    profile: 'Perfil',
    password: 'Contraseña',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Nueva Contraseña',
    saveChanges: 'Guardar Cambios',
    saving: 'Guardando...',
    changePassword: 'Cambiar Contraseña',
    updating: 'Actualizando...',
  },
  messages: {
    profileUpdated: 'Perfil actualizado correctamente',
    passwordUpdated: 'Contraseña actualizada correctamente',
    imageUpdated: 'Imagen de perfil actualizada correctamente',
    passwordsDontMatch: 'Las contraseñas no coinciden',
    errorUpdateProfile: 'Error al actualizar el perfil',
    errorUpdatePassword: 'Error al actualizar la contraseña',
    errorUpdateImage: 'Error al actualizar la imagen de perfil',
  },
};
