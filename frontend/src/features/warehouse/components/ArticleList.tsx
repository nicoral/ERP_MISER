import React, { useEffect, useState } from 'react';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import { EyeIcon, EditIcon, TrashIcon } from '../../../components/common/Icons';
import { getArticles, getArticle } from '../../../services/api/articleService';
import { FormInput } from '../../../components/common/FormInput';
import {
  Table,
  type TableAction,
  type TableColumn,
} from '../../../components/common/Table';
import type { Article } from '../../../types/article';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { Modal } from '../../../components/common/Modal';
import { ArticleDetails } from './ArticleDetails';

export const ArticleList = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    code: '',
    name: '',
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      setIsFiltering(true);
      const response = await getArticles(1, pagination.pageSize);
      setArticles(response.data);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      });
      setIsFiltering(false);
    })();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = async () => {
    setIsFiltering(true);
    setPagination(prev => ({ ...prev, page: 1 }));
    const response = await getArticles(1, pagination.pageSize, filters);
    setArticles(response.data);
    setPagination(prev => ({
      ...prev,
      total: response.total,
      totalPages: response.totalPages,
    }));
    setIsFiltering(false);
  };

  const clearFilters = async () => {
    setFilters({ code: '', name: '' });
    setIsFiltering(true);
    const response = await getArticles(1, pagination.pageSize);
    setArticles(response.data);
    setPagination({
      page: response.page,
      pageSize: response.pageSize,
      total: response.total,
      totalPages: response.totalPages,
    });
    setIsFiltering(false);
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setIsFiltering(true);
    if (filters.code || filters.name) {
      newPage = 1;
    }
    const response = await getArticles(newPage, pagination.pageSize, filters);
    setArticles(response.data);
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
    setIsFiltering(false);
  };

  const handleViewArticle = async (article: Article) => {
    try {
      const fullArticle = await getArticle(article.id);
      setSelectedArticle(fullArticle);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching article details:', error);
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
      onClick: handleViewArticle,
    },
    {
      icon: <EditIcon className="w-5 h-5 text-blue-600" />,
      label: WAREHOUSE_TEXTS.articles.table.actions.edit,
      onClick: (article: Article) => {
        navigate(
          ROUTES.WAREHOUSE_ARTICLE_EDIT.replace(':id', article.id.toString())
        );
      },
    },
    {
      icon: <TrashIcon className="w-5 h-5 text-red-600" />,
      label: WAREHOUSE_TEXTS.articles.table.actions.delete,
      onClick: () => {},
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {WAREHOUSE_TEXTS.articles.title}
        </h2>
        <button
          onClick={() => navigate(ROUTES.WAREHOUSE_ARTICLE_CREATE)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {WAREHOUSE_TEXTS.articles.buttons.create}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded-md"
        >
          <span className="font-medium text-base">
            {WAREHOUSE_TEXTS.articles.filters.title}
          </span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
              <FormInput
                id="name"
                name="name"
                label={WAREHOUSE_TEXTS.articles.filters.name}
                value={filters.name}
                onChange={handleFilterChange}
                placeholder={WAREHOUSE_TEXTS.articles.filters.namePlaceholder}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {WAREHOUSE_TEXTS.articles.filters.clear}
              </button>
              <button
                onClick={applyFilters}
                disabled={isFiltering}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isFiltering
                  ? WAREHOUSE_TEXTS.articles.filters.filtering
                  : WAREHOUSE_TEXTS.articles.filters.apply}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Article>
          columns={columns}
          data={articles}
          keyField="id"
          loading={isFiltering}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            onPageChange: (newPage: number) => handlePageChange(newPage),
          }}
          actions={actions}
          pageSize={pagination.pageSize}
        />
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={WAREHOUSE_TEXTS.articles.details.title}
      >
        {selectedArticle && <ArticleDetails article={selectedArticle} />}
      </Modal>
    </div>
  );
};
