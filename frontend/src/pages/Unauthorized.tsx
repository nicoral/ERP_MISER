import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-500">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-white">
            No tienes permisos para acceder a esta página
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-white mb-6">
              Si crees que esto es un error, contacta al administrador del
              sistema.
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                Volver a la página anterior
              </Button>

              <Button
                onClick={handleGoHome}
                className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                Ir al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
