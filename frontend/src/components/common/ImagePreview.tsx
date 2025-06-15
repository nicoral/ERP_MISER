import React, { useState, useRef } from 'react';
import defaultAvatar from '../../assets/default-avatar.png';

type Props = {
  imageUrl: string;
  onChange: (file: File) => void;
  className?: string;
};

export const ImagePreview: React.FC<Props> = ({
  imageUrl,
  onChange,
  className = '',
}) => {
  const [preview, setPreview] = useState<string>(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleImageClick}
        className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group"
      >
        <img
          src={preview || defaultAvatar}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Cambiar foto
          </span>
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
