import { useState } from 'react';
import { FormInput } from '../../../components/common/FormInput';
import { ImagePreview } from '../../../components/common/ImagePreview';
import { COMMON_TEXTS } from '../../../config/texts';
import { createBrand } from '../../../services/api/articleService';
import type { Brand } from '../../../types/article';

interface BrandFormProps {
  onSuccess: (brand: Brand) => void;
  onCancel: () => void;
}

interface BrandFormData {
  name: string;
  imageUrl: string;
}

export const BrandForm = ({ onSuccess, onCancel }: BrandFormProps) => {
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateBrand = async () => {
    if (!formData.name.trim()) return;

    setCreatingBrand(true);
    setError(null);
    try {
      // Primero creamos la marca
      const createdBrand = await createBrand(
        {
          ...formData,
          id: 0, // El backend asignará el ID real
        } as Brand,
        selectedFile ?? undefined
      );

      onSuccess(createdBrand);
    } catch (error) {
      console.error(error);
      setError('Error al crear la marca');
    } finally {
      setCreatingBrand(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
      <div className="flex justify-center mb-4">
        <ImagePreview
          imageUrl={formData.imageUrl}
          onChange={file => {
            setSelectedFile(file);
          }}
        />
      </div>
      <FormInput
        id="brandName"
        name="name"
        label="Nombre de la marca"
        value={formData.name}
        onChange={e =>
          setFormData(prev => ({
            ...prev,
            name: e.target.value,
          }))
        }
        required
      />
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {COMMON_TEXTS.cancel}
        </button>
        <button
          type="button"
          onClick={handleCreateBrand}
          disabled={creatingBrand || !formData.name.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creatingBrand ? COMMON_TEXTS.loading : COMMON_TEXTS.save}
        </button>
      </div>
    </div>
  );
};
