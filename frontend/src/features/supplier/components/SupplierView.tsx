import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupplier } from '../hooks/useSupplier';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/ui/card';
import { ROUTES } from '../../../config/constants';
import { SupplierStatus } from '../../../types/supplier';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import {
  ChevronLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  Banknote,
  Settings,
  Calendar,
  Edit,
  Trash,
} from 'lucide-react';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';
import { useDeleteSupplier } from '../hooks/useSupplier';

export const SupplierView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteSupplierMutation = useDeleteSupplier();

  const { data: supplier, isLoading, error } = useSupplier(Number(id));

  const handleEdit = () => {
    navigate(ROUTES.SUPPLIERS_EDIT.replace(':id', id!));
  };

  const handleDelete = async () => {
    if (!supplier) return;

    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el proveedor ${supplier.businessName}?`
      )
    ) {
      try {
        await deleteSupplierMutation.mutateAsync(supplier.id);
        showSuccess(
          'Eliminado',
          `Proveedor ${supplier.businessName} eliminado correctamente`
        );
        navigate(ROUTES.SUPPLIERS);
      } catch {
        showError('Error', 'No se pudo eliminar el proveedor');
      }
    }
  };

  const getStatusColor = (status: SupplierStatus) => {
    switch (status) {
      case SupplierStatus.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case SupplierStatus.INACTIVE:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case SupplierStatus.BLACKLISTED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: SupplierStatus) => {
    switch (status) {
      case SupplierStatus.ACTIVE:
        return WAREHOUSE_TEXTS.suppliers.table.status.active;
      case SupplierStatus.INACTIVE:
        return WAREHOUSE_TEXTS.suppliers.table.status.inactive;
      case SupplierStatus.BLACKLISTED:
        return WAREHOUSE_TEXTS.suppliers.table.status.blacklisted;
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Proveedor no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(ROUTES.SUPPLIERS)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {supplier.businessName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                RUC: {supplier.ruc}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(
              supplier.status
            )}`}
          >
            {getStatusText(supplier.status)}
          </span>

          {hasPermission('update_supplier') && (
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}

          {hasPermission('delete_supplier') && (
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSupplierMutation.isPending}
            >
              <Trash className="h-4 w-4 mr-2" />
              {deleteSupplierMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          )}
        </div>
      </div>

      {/* Información General */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Información General
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Razón Social:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">
              {supplier.businessName}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contacto:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {supplier.contactPerson}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Teléfono:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">{supplier.mobile}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {supplier.email || '-'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {supplier.address || '-'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Calificación:
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(supplier.rating / 20)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({Math.round(supplier.rating)}/100)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Líneas de Productos */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Líneas de Productos
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {supplier.lines.split('-').map((line, index) => (
            <div
              key={index}
              className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                📦 {line.trim()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Información Bancaria */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Banknote className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Información Bancaria
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {supplier.appliesWithholding ? 'Con retención' : 'Sin retención'}
            </span>
            <span className="text-lg">
              {supplier.appliesWithholding ? '💰' : '💵'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cuentas PEN */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Cuentas en Soles (PEN)
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Banco:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {supplier.entityBankAccountPEN || '-'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cuenta:
                </span>
                <p className="text-gray-900 dark:text-white font-mono">
                  {supplier.bankAccountPEN || '-'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CCI:
                </span>
                <p className="text-gray-900 dark:text-white font-mono">
                  {supplier.interbankAccountPEN || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Cuentas USD */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Cuentas en Dólares (USD)
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Banco:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {supplier.entityBankAccountUSD || '-'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cuenta:
                </span>
                <p className="text-gray-900 dark:text-white font-mono">
                  {supplier.bankAccountUSD || '-'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CCI:
                </span>
                <p className="text-gray-900 dark:text-white font-mono">
                  {supplier.interbankAccountUSD || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Configuración */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configuración
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Política de Devolución:
            </span>
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                supplier.returnPolicy
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {supplier.returnPolicy ? 'Sí' : 'No'}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aplica Retención:
            </span>
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                supplier.appliesWithholding
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {supplier.appliesWithholding ? 'Sí' : 'No'}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Condición:
            </span>
            <p className="text-gray-900 dark:text-white">
              {supplier.condition || '-'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Departamento:
            </span>
            <p className="text-gray-900 dark:text-white">
              {supplier.department || '-'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Provincia:
            </span>
            <p className="text-gray-900 dark:text-white">
              {supplier.province || '-'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado SUNAT:
            </span>
            <p className="text-gray-900 dark:text-white">
              {supplier.sunatStatus || '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Información de Auditoría */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Información de Auditoría
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha de Creación:
            </span>
            <p className="text-gray-900 dark:text-white">
              {new Date(supplier.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Última Actualización:
            </span>
            <p className="text-gray-900 dark:text-white">
              {new Date(supplier.updatedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
