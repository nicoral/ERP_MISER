import logo from '../assets/logo-transparent.png';

export const WelcomePage = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl text-center px-4">
        <img
          src={logo}
          alt="Emixio Logo"
          className="w-40 h-auto mb-4 mx-auto"
        />
        <h1 className="text-2xl font-bungee text-gray-900 dark:text-white mb-3">
          ¡Bienvenido a Emixio!
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-3">
          Sistema Integral de Gestión Empresarial
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Emixio es tu solución completa para la gestión empresarial, diseñada
            para optimizar y simplificar tus operaciones diarias.
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Con nuestras herramientas intuitivas y potentes, podrás gestionar
            eficientemente todos los aspectos de tu negocio, desde la gestión de
            clientes hasta el control de inventario y análisis financiero.
          </p>
        </div>
      </div>
    </div>
  );
};
