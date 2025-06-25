import React, { useState, useRef, useEffect } from 'react';

type Props = {
  imageUrl: string | null;
  onChange: (file: File) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export const LogoPreview: React.FC<Props> = ({
  imageUrl,
  onChange,
  className = '',
  size = 'md',
}) => {
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  useEffect(() => {
    setPreview(imageUrl);
  }, [imageUrl]);

  const handleImageError = () => {
    setPreview(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleImageClick}
        className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden cursor-pointer group border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200`}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : preview ? (
          <img
            src={preview}
            alt="Logo de la empresa"
            className="w-full h-full object-contain bg-white dark:bg-gray-800"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sin logo
              </p>
            </div>
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center flex flex-col items-center justify-center w-full h-full">
            <svg
              className="mx-auto h-6 w-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs mb-2">Cambiar logo</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
