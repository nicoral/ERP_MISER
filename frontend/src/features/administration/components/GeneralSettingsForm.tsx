import React, { useState } from 'react';
import {
  useGeneralSettings,
  useUpdateGeneralSettings,
  useUploadLogo,
} from '../../../hooks/useGeneralSettings';
import { useUpdateExchangeRate } from '../../../hooks/useGeneralSettings';
import { Button } from '../../../components/common/Button';
import { FormInput } from '../../../components/common/FormInput';
import { FormSwitch } from '../../../components/common/FormSwitch';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { LogoPreview } from '../../../components/common/LogoPreview';
import { useToast } from '../../../contexts/ToastContext';

export const GeneralSettingsForm = () => {
  const { data: settings, isLoading, error } = useGeneralSettings();
  const updateSettings = useUpdateGeneralSettings();
  const updateExchangeRate = useUpdateExchangeRate();
  const uploadLogo = useUploadLogo();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    timezone: '',
    exchangeRateAutoUpdate: true,
    generalTax: 18,
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || '',
        timezone: settings.timezone || 'America/Lima',
        exchangeRateAutoUpdate: settings.exchangeRateAutoUpdate,
        generalTax: settings.generalTax,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      showSuccess('Configuraciones actualizadas exitosamente');
    } catch (error) {
      showError('Error al actualizar las configuraciones', error as string);
    }
  };

  const handleUpdateExchangeRate = async () => {
    try {
      await updateExchangeRate.mutateAsync();
      showSuccess('Tipo de cambio actualizado exitosamente');
    } catch (error) {
      showError('Error al actualizar el tipo de cambio', error as string);
    }
  };

  const handleLogoChange = async (file: File | null) => {
    if (!file) {
      // Si no hay archivo, eliminar el logo
      try {
        await updateSettings.mutateAsync({ companyLogoUrl: '' });
        showSuccess('Logo eliminado exitosamente');
      } catch (error) {
        showError('Error al eliminar el logo', error as string);
      }
      return;
    }

    try {
      await uploadLogo.mutateAsync(file);
      showSuccess('Logo actualizado exitosamente');
    } catch (error) {
      showError('Error al subir el logo', error as string);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">
          Error al cargar las configuraciones: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-10 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
        Configuraciones Generales
      </h2>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Columna de campos */}
          <div className="md:col-span-2 space-y-6">
            <FormInput
              label="Nombre de la Empresa"
              value={formData.companyName}
              onChange={e =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              required
            />
            <FormInput
              label="Zona Horaria"
              value={formData.timezone}
              onChange={e =>
                setFormData({ ...formData, timezone: e.target.value })
              }
              required
            />
            <FormInput
              label="Impuesto General"
              value={formData.generalTax}
              type="number"
              onChange={e =>
                setFormData({
                  ...formData,
                  generalTax: Number(e.target.value),
                })
              }
              required
            />
          </div>
          {/* Columna de logo */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner flex flex-col items-center w-full">
              <LogoPreview
                imageUrl={settings?.companyLogoUrl || null}
                onChange={handleLogoChange}
                size="lg"
                className="mb-2 "
              />
              <span className="text-xs text-gray-500 mt-2 text-center">
                Haz clic en el logo para cambiarlo.
                <br />
                Formatos soportados: JPG, PNG
              </span>
            </div>
          </div>
        </div>

        {/* Sección de tipo de cambio */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-inner border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Configuración de Tipo de Cambio
          </h3>

          <div className="space-y-4">
            <FormSwitch
              label="Actualización automática del tipo de cambio"
              checked={formData.exchangeRateAutoUpdate}
              onChange={checked =>
                setFormData({ ...formData, exchangeRateAutoUpdate: checked })
              }
            />

            {settings && (
              <div className="bg-white dark:bg-gray-800 rounded-md p-4 flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0">
                <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-white font-medium">
                      Venta:
                    </span>
                    <span className="ml-2 font-semibold">
                      {settings.exchangeRateSale
                        ? `S/ ${settings.exchangeRateSale}`
                        : 'No disponible'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-white font-medium">
                      Compra:
                    </span>
                    <span className="ml-2 font-semibold">
                      {settings.exchangeRatePurchase
                        ? `S/ ${settings.exchangeRatePurchase}`
                        : 'No disponible'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-white font-medium">
                      Fecha:
                    </span>
                    <span className="ml-2 font-semibold">
                      {settings.exchangeRateDateString || 'No disponible'}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleUpdateExchangeRate}
                  disabled={updateExchangeRate.isPending}
                  variant="secondary"
                  className="mt-4 md:mt-0"
                >
                  {updateExchangeRate.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Tipo de Cambio Manualmente'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            disabled={updateSettings.isPending}
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 px-8 py-2 text-lg"
          >
            {updateSettings.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                Guardando...
              </>
            ) : (
              'Guardar Configuraciones'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
