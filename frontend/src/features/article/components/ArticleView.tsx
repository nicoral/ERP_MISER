import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArticle } from '../hooks/useArticle';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/ui/card';
import { ROUTES } from '../../../config/constants';
import {
  ChevronLeft,
  Package,
  Tag,
  Ruler,
  RotateCcw,
  Building2,
  Edit,
  Download,
  FileText,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import { hasPermission } from '../../../utils/permissions';
import defaultAvatar from '../../../assets/default-avatar.png';

export const ArticleView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = useArticle(Number(id));

  const handleEdit = () => {
    navigate(ROUTES.ARTICLE_EDIT.replace(':id', id!));
  };

  const getStatusColor = (active: boolean) => {
    return active
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Activo' : 'Inactivo';
  };

  const getStockStatus = (
    stock: number,
    minStock: number,
    maxStock: number
  ) => {
    if (stock <= minStock) {
      return {
        text: 'Stock Bajo',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: <TrendingDown className="w-4 h-4" />,
      };
    } else if (stock >= maxStock) {
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

  const handleDownloadTechnicalSheet = () => {
    if (article?.technicalSheetUrl) {
      window.open(article.technicalSheetUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Artículo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(ROUTES.ARTICLES)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {article.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Código: {article.code}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <span
            className={`px-2 sm:px-3 py-1 inline-flex text-xs sm:text-sm font-semibold rounded-full ${getStatusColor(
              article.active
            )}`}
          >
            {getStatusText(article.active)}
          </span>

          {hasPermission('update_article') && (
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

      {/* Imagen del Artículo */}
      <Card className="p-3 sm:p-6 w-full">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Imagen del Artículo
          </h2>
        </div>

        <div className="flex justify-center">
          <img
            src={
              article.imageUrl && article.imageUrl !== ''
                ? article.imageUrl
                : defaultAvatar
            }
            alt={article.name}
            className="w-48 h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
          />
        </div>
      </Card>

      {/* Información General */}
      <Card className="p-3 sm:p-6 w-full">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Información General
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Código:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">
              {article.code}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">
              {article.name}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Ruler className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Unidad de Medida:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {article.unitOfMeasure}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">{article.type}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Clasificación de Rotación:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {article.rotationClassification}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Marca:
              </span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {article.brand?.name || 'Sin marca'}
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
                article.active
              )}`}
            >
              {getStatusText(article.active)}
            </span>
          </div>
        </div>
      </Card>

      {/* Ficha Técnica */}
      {article.technicalSheetUrl && (
        <Card className="p-3 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ficha Técnica
              </h2>
            </div>
            <Button
              onClick={handleDownloadTechnicalSheet}
              className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Ver Documento
            </Button>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Ficha técnica disponible
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Haz clic en "Ver Documento" para abrir la ficha técnica en una
              nueva pestaña.
            </p>
          </div>
        </Card>
      )}

      {/* Inventario por Almacén */}
      <Card className="p-3 sm:p-6 w-full">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Inventario por Almacén
          </h2>
        </div>

        <div className="space-y-4">
          {article.warehouseArticles.map((warehouseStock, index) => {
            const stockStatus = getStockStatus(
              warehouseStock.stock,
              warehouseStock.minStock,
              warehouseStock.maxStock
            );

            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {warehouseStock.warehouse.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Almacén #{warehouseStock.warehouse.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <span
                      className={`px-3 py-1 inline-flex items-center space-x-1 text-sm font-semibold rounded-full ${stockStatus.color}`}
                    >
                      {stockStatus.icon}
                      <span>{stockStatus.text}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stock Actual:
                    </span>
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {warehouseStock.stock}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {article.unitOfMeasure}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stock Mínimo:
                    </span>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {warehouseStock.minStock}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {article.unitOfMeasure}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stock Máximo:
                    </span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {warehouseStock.maxStock}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {article.unitOfMeasure}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ubicación:
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Línea:
                        </span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {warehouseStock.line || 'No especificado'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Estante:
                        </span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {warehouseStock.shelf || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso del stock */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nivel de Stock
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(
                        (warehouseStock.stock / warehouseStock.maxStock) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        warehouseStock.stock <= warehouseStock.minStock
                          ? 'bg-red-600'
                          : warehouseStock.stock >= warehouseStock.maxStock
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                      }`}
                      style={{
                        width: `${Math.min((warehouseStock.stock / warehouseStock.maxStock) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0 {article.unitOfMeasure}</span>
                    <span>
                      {warehouseStock.maxStock} {article.unitOfMeasure}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

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
              {new Date(article.createdAt).toLocaleDateString('es-ES', {
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
              {new Date(article.updatedAt).toLocaleDateString('es-ES', {
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
