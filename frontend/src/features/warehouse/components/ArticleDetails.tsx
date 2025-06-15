import React from 'react';
import type { Article } from '../../../types/article';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import defaultAvatar from '../../../assets/default-avatar.png';

type Props = {
  article: Article;
};

export const ArticleDetails: React.FC<Props> = ({ article }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <img
          src={
            article.imageUrl && article.imageUrl !== ''
              ? article.imageUrl
              : defaultAvatar
          }
          alt={article.name}
          className="w-32 h-32 object-contain"
        />
      </div>

      {/* Información General */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Información General</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🆔 {WAREHOUSE_TEXTS.articles.form.fields.code}:{' '}
              <span className="text-gray-900 dark:text-white">
                {article.code}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📛 {WAREHOUSE_TEXTS.articles.form.fields.name}:{' '}
              <span className="text-gray-900 dark:text-white">
                {article.name}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📏 {WAREHOUSE_TEXTS.articles.form.fields.unit}:{' '}
              <span className="text-gray-900 dark:text-white">
                {article.unitOfMeasure}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔤 {WAREHOUSE_TEXTS.articles.form.fields.type}:{' '}
              <span className="text-gray-900 dark:text-white">
                {article.type}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📦 {WAREHOUSE_TEXTS.articles.form.fields.line}:{' '}
              <span className="text-gray-900 dark:text-white">
                {article.line}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🗂 {WAREHOUSE_TEXTS.articles.form.fields.shelf}:{' '}
              <span className="text-gray-900 dark:text-white">
                {article.shelf}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔄 {WAREHOUSE_TEXTS.articles.form.fields.rotation}:{' '}
              <span className="text-gray-900 dark:text-white">
                {article.rotationClassification}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🏷 {WAREHOUSE_TEXTS.articles.form.fields.brand}:{' '}
              <span className="text-gray-900 dark:text-white">
                {article.brand.name}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Inventario */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Inventario</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              🔢{WAREHOUSE_TEXTS.articles.form.fields.minStock}
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {article.minStock}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              🔢 {WAREHOUSE_TEXTS.articles.form.fields.maxStock}
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {article.maxStock}
            </p>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          {article.warehouseArticles.map((warehouseStock, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
            >
              <span className="text-sm text-gray-900 dark:text-white">
                📍{warehouseStock.warehouse.name}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {warehouseStock.stock} {article.unitOfMeasure}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuración */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Configuración</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📶 {WAREHOUSE_TEXTS.articles.form.fields.active}:{' '}
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  article.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {article.active
                  ? WAREHOUSE_TEXTS.articles.table.status.active
                  : WAREHOUSE_TEXTS.articles.table.status.inactive}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
