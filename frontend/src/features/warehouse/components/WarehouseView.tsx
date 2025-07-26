import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWarehouse } from '../hooks/useWarehouse';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/ui/card';
import { ROUTES } from '../../../config/constants';
import {
  ChevronLeft,
  Building2,
  MapPin,
  DollarSign,
  User,
  Calendar,
  Edit,
  Fuel,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { hasPermission } from '../../../utils/permissions';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';

export const WarehouseView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: warehouse, isLoading, error } = useWarehouse(Number(id));

  const handleEdit = () => {
    navigate(ROUTES.WAREHOUSE_EDIT.replace(':id', id!));
  };

  const getStatusColor = (active: boolean) => {
    return active
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Activo' : 'Inactivo';
  };

  const getFuelStockStatus = (
    currentStock: number,
    minStock: number,
    maxStock: number
  ) => {
    if (currentStock <= minStock) {
      return {
        text: 'Stock Bajo',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: <TrendingDown className="w-4 h-4" />,
      };
    } else if (currentStock >= maxStock) {
      return {
        text: 'Stock Alto',
        color:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: <TrendingUp className="w-4 h-4" />,
      };
    } else {
      return {
        text: 'Stock Normal',
        color:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Almacén no encontrado</p>
      </div>
    );
  }

  const fuelStockStatus = warehouse.warehouseFuelStock
    ? getFuelStockStatus(
        warehouse.warehouseFuelStock.currentStock,
        warehouse.warehouseFuelStock.minStock,
        warehouse.warehouseFuelStock.maxStock
      )
    : null;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(ROUTES.WAREHOUSE)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {warehouse.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Almacén #{warehouse.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <span
            className={`px-2 sm:px-3 py-1 inline-flex text-xs sm:text-sm font-semibold rounded-full ${getStatusColor(
              warehouse.active
            )}`}
          >
            {getStatusText(warehouse.active)}
          </span>

          {hasPermission('update_warehouse') && (
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Información General */}
      <Card className="p-3 sm:p-6 w-full">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Información General
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">
              {warehouse.name}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">{warehouse.address}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Valoración:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">
              ${warehouse.valued.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado:
              </span>
            </div>
            <span
              className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                warehouse.active
              )}`}
            >
              {getStatusText(warehouse.active)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Contratación:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {new Date(warehouse.hireDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {warehouse.dismissalDate && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Despido:
                </span>
              </div>
              <p className="text-gray-900 dark:text-white">
                {new Date(warehouse.dismissalDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Gerente */}
      <Card className="p-3 sm:p-6 w-full">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Gerente del Almacén
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={warehouse.manager.imageUrl} />
              <AvatarFallback className="text-lg">
                {warehouse.manager.firstName.charAt(0)}
                {warehouse.manager.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {warehouse.manager.firstName} {warehouse.manager.lastName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {warehouse.manager.position}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Área:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {warehouse.manager.area}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {warehouse.manager.email}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teléfono:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {warehouse.manager.phone}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado:
                </span>
                <span
                  className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                    warehouse.manager.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {warehouse.manager.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Control de Combustible */}
      {warehouse.warehouseFuelStock && (
        <Card className="p-3 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Fuel className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Control de Combustible
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              {fuelStockStatus && (
                <span
                  className={`px-3 py-1 inline-flex items-center space-x-1 text-sm font-semibold rounded-full ${fuelStockStatus.color}`}
                >
                  {fuelStockStatus.icon}
                  <span>{fuelStockStatus.text}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock Actual:
              </span>
              <div className="flex items-center space-x-2">
                <Fuel className="w-5 h-5 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {warehouse.warehouseFuelStock.currentStock}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  galones
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock Mínimo:
              </span>
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {warehouse.warehouseFuelStock.minStock}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  galones
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock Máximo:
              </span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {warehouse.warehouseFuelStock.maxStock}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  galones
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Capacidad del Tanque:
              </span>
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {warehouse.warehouseFuelStock.tankCapacity}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  galones
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progreso del stock */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nivel de Stock
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(
                  (warehouse.warehouseFuelStock.currentStock /
                    warehouse.warehouseFuelStock.tankCapacity) *
                    100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((warehouse.warehouseFuelStock.currentStock / warehouse.warehouseFuelStock.tankCapacity) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 galones</span>
              <span>{warehouse.warehouseFuelStock.tankCapacity} galones</span>
            </div>
          </div>
        </Card>
      )}

      {/* Información de Auditoría */}
      <Card className="p-3 sm:p-6 w-full">
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
              {new Date(warehouse.createdAt).toLocaleDateString('es-ES', {
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
              {new Date(warehouse.updatedAt).toLocaleDateString('es-ES', {
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
