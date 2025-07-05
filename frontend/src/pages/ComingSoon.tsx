import React from 'react';
import ComingSoonImage from '../assets/comingSoon.png';

const ComingSoon: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <img
        src={ComingSoonImage}
        alt="En construcción"
        className="w-64 mb-6 opacity-80"
      />
      <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100 text-center">
        Estamos trabajando en esto
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        Pronto podrá verlo. ¡Gracias por su paciencia!
      </p>
    </div>
  );
};

export default ComingSoon;
