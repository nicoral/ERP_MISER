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
            article.imageUrl || article.imageUrl === ''
              ? defaultAvatar
              : article.imageUrl
          }
          alt={article.name}
          className="w-32 h-32 object-contain"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.code}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.code}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.name}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.name}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.unitOfMeasure}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.unitOfMeasure}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.type}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.type}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.line}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.line}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.shelf}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.shelf}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.rotationClassification}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.rotationClassification}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.brand}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.brand.name}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.minStock}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.minStock}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.maxStock}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {article.maxStock}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.warehouseArticles}
          </p>
          <div className="mt-2 space-y-2">
            {article.warehouseArticles.map((warehouseStock, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <span className="text-sm text-gray-900 dark:text-white">
                  {warehouseStock.warehouse.name}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {warehouseStock.stock} {article.unitOfMeasure}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {WAREHOUSE_TEXTS.articles.form.fields.active}
          </p>
          <p className="mt-1">
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
  );
};
