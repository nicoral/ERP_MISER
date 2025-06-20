import React, { useState } from 'react';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import { EyeIcon, EditIcon, TrashIcon } from '../../../components/common/Icons';
import { FormInput } from '../../../components/common/FormInput';
import {
  Table,
  type TableAction,
  type TableColumn,
} from '../../../components/common/Table';
import type { Article, ArticleFilters } from '../../../types/article';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { Modal } from '../../../components/common/Modal';
import { ArticleDetails } from './ArticleDetails';
import { useArticles, useDeleteArticle } from '../hooks/useArticle';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';

export const ArticleList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteArticleMutation = useDeleteArticle();

  const [filters, setFilters] = useState<ArticleFilters>({ code: '' });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Hook con datos y estados automáticos de React Query
  const { data, isLoading, isFetching } = useArticles(page, 10, filters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ code: '' });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (data?.totalPages ?? 1)) return;
    setPage(newPage);
  };

  const handleCreate = () => navigate(ROUTES.ARTICLE_CREATE);
  const handleEdit = (id: number) =>
    navigate(ROUTES.ARTICLE_EDIT.replace(':id', id.toString()));

  const handleDelete = async (article: Article) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el artículo ${article.name}?`
      )
    ) {
      try {
        await deleteArticleMutation.mutateAsync(article.id);
        showSuccess(
          'Eliminado',
          `Artículo ${article.name} eliminado correctamente`
        );
      } catch {
        showError('Error', 'No se pudo eliminar el artículo');
      }
    }
  };

  const columns: TableColumn<Article>[] = [
    { header: WAREHOUSE_TEXTS.articles.table.columns.id, accessor: 'id' },
    { header: WAREHOUSE_TEXTS.articles.table.columns.code, accessor: 'code' },
    { header: WAREHOUSE_TEXTS.articles.table.columns.name, accessor: 'name' },
    {
      header: WAREHOUSE_TEXTS.articles.table.columns.line,
      accessor: 'line',
    },
    { header: WAREHOUSE_TEXTS.articles.table.columns.shelf, accessor: 'shelf' },
    { header: WAREHOUSE_TEXTS.articles.table.columns.type, accessor: 'type' },
    {
      header: WAREHOUSE_TEXTS.articles.table.columns.status,
      render: (art: Article) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            art.active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {art.active
            ? WAREHOUSE_TEXTS.articles.table.status.active
            : WAREHOUSE_TEXTS.articles.table.status.inactive}
        </span>
      ),
    },
  ];

  const actions: TableAction<Article>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: WAREHOUSE_TEXTS.articles.table.actions.view,
      onClick: (article: Article) => {
        setSelectedArticle(article);
        setShowDetailsModal(true);
      },
    },
    ...(hasPermission('update_articles')
      ? [
          {
            icon: <EditIcon className="w-5 h-5 text-blue-600" />,
            label: WAREHOUSE_TEXTS.articles.table.actions.edit,
            onClick: (article: Article) => handleEdit(article.id),
          },
        ]
      : []),
    ...(hasPermission('delete_articles')
      ? [
          {
            icon: <TrashIcon className="w-5 h-5 text-red-600" />,
            label: 'Eliminar',
            onClick: (article: Article) => handleDelete(article),
          },
        ]
      : []),
  ];

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {WAREHOUSE_TEXTS.articles.title}
        </h2>
        {hasPermission('create_articles') && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 w-fit"
          >
            {WAREHOUSE_TEXTS.articles.buttons.create}
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex justify-between w-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md"
        >
          <span>{WAREHOUSE_TEXTS.articles.filters.title}</span>
          <svg
            className={`w-5 h-5 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="code"
                name="code"
                label={WAREHOUSE_TEXTS.articles.filters.code}
                value={filters.code}
                onChange={handleFilterChange}
                placeholder={WAREHOUSE_TEXTS.articles.filters.codePlaceholder}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {WAREHOUSE_TEXTS.articles.filters.clear}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Article>
          columns={columns}
          data={data?.data ?? []}
          keyField="id"
          loading={isLoading || isFetching || deleteArticleMutation.isPending}
          pagination={{
            page: page,
            totalPages: data?.totalPages ?? 1,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          pageSize={10}
        />
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`📦 ${selectedArticle?.name ?? ''}`}
      >
        {selectedArticle && <ArticleDetails article={selectedArticle} />}
      </Modal>
    </div>
  );
};
