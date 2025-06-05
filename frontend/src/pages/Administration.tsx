export const Administration = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Administración</h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
            <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100">Configuración General</h2>
            <p className="mt-2 text-blue-700 dark:text-blue-300">Gestión de parámetros del sistema</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
            <h2 className="text-lg font-medium text-green-900 dark:text-green-100">Usuarios y Permisos</h2>
            <p className="mt-2 text-green-700 dark:text-green-300">Administración de usuarios y roles</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
            <h2 className="text-lg font-medium text-purple-900 dark:text-purple-100">Auditoría</h2>
            <p className="mt-2 text-purple-700 dark:text-purple-300">Registros y reportes del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 