import type {
  TableColumn,
  TableAction,
  TablePaginationProps,
  TableProps,
} from '../../types/table';
import { useEffect, useState } from 'react';

function getPaginationItems(current: number, total: number) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }
  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  return rangeWithDots;
}

function TableSkeleton({
  rows = 10,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-4">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function renderCell<T>(col: TableColumn<T>, row: T) {
  if (col.render) {
    return col.render(row);
  }
  let value = '';
  if (col.accessor) {
    const accessor = col.accessor;

    if (typeof accessor === 'string' && accessor.includes('.')) {
      const [parent, child] = accessor.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parentObj = row[parent as keyof T] as Record<string, any>;
      value = parentObj?.[child] as string;
    } else {
      value = row[accessor as keyof T] as string;
    }

    const accessor2 = col.accessor2;

    if (accessor2) {
      if (typeof accessor2 === 'string' && accessor2.includes('.')) {
        const [parent, child] = accessor2.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parentObj = row[parent as keyof T] as Record<string, any>;
        value += ` ${parentObj?.[child] as string}`;
      } else {
        value += ` ${row[accessor2 as keyof T] as string}`;
      }
    }
    return value;
  }
  return 'No value';
}

export function Table<T>({
  columns,
  data,
  keyField,
  loading = false,
  pagination,
  actions,
  pageSize = 10,
}: TableProps<T>) {
  // Simple mobile detection (can be improved with a custom hook)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640); // Tailwind 'sm'
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile stacked view
  if (isMobile) {
    return (
      <div className="p-2">
        {loading ? (
          <div>
            {Array.from({ length: pageSize }).map((_, idx) => (
              <div
                key={idx}
                className="mb-6 max-w-md mx-auto p-4 rounded-xl shadow-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                {columns.map((_col, cidx) => (
                  <div
                    key={cidx}
                    className="flex justify-between items-center py-1"
                  >
                    <span className="font-semibold text-gray-400 dark:text-gray-500 w-1/2">
                      &nbsp;
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 h-4 w-1/3 rounded" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          (data || []).map((row, rowIdx) => (
            <div
              key={String(row[keyField]) || rowIdx}
              className="mb-6 max-w-md mx-auto p-4 rounded-xl shadow-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            >
              {columns.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className="flex justify-between items-center py-1"
                >
                  <span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">
                    {col.header}:
                  </span>
                  <span className="text-gray-900 dark:text-white text-base font-medium text-right break-words max-w-[60%]">
                    {renderCell(col, row)}
                  </span>
                </div>
              ))}
              {actions && actions.length > 0 && (
                <div className="flex justify-center gap-4 mt-4">
                  {actions
                    .filter(action => !action.isHidden?.(row))
                    .map((action, aIdx) => {
                      const isDisabled =
                        typeof action.disabled === 'function'
                          ? action.disabled(row)
                          : (action.disabled ?? false);

                      return (
                        <button
                          key={aIdx}
                          onClick={() => action.onClick(row)}
                          title={action.label}
                          className="p-2 rounded transition-colors hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading || isDisabled}
                        >
                          {typeof action.icon === 'function'
                            ? action.icon(row)
                            : action.icon}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          ))
        )}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-4">
            {/* Simple mobile pagination */}
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="mx-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {'<'}
            </button>
            <span className="mx-2 text-gray-700 dark:text-gray-300">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
              className="mx-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {'>'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={
                    (col.isKey !== false
                      ? 'table-cell '
                      : 'table-cell md:hidden lg:table-cell ') +
                    (col.className ||
                      'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider')
                  }
                >
                  {col.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <TableSkeleton
                rows={pageSize}
                columns={
                  columns.length + (actions && actions.length > 0 ? 1 : 0)
                }
              />
            ) : (
              (data || []).map((row, rowIdx) => (
                <tr key={String(row[keyField]) || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={
                        (col.isKey !== false
                          ? 'table-cell '
                          : 'table-cell md:hidden lg:table-cell ') +
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'
                      }
                    >
                      {renderCell(col, row)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex items-center space-x-2">
                        {actions
                          .filter(action => !action.isHidden?.(row))
                          .map((action, aIdx) => {
                            const isDisabled =
                              typeof action.disabled === 'function'
                                ? action.disabled(row)
                                : (action.disabled ?? false);

                            return (
                              <button
                                key={aIdx}
                                onClick={() => action.onClick(row)}
                                title={action.label}
                                className="p-2 rounded transition-colors hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || isDisabled}
                              >
                                {typeof action.icon === 'function'
                                  ? action.icon(row)
                                  : action.icon}
                              </button>
                            );
                          })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {'<'}
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {'>'}
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div />
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="mx-1 inline-flex items-center px-2 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  &laquo;
                </button>
                {getPaginationItems(pagination.page, pagination.totalPages).map(
                  (item, idx) =>
                    item === '...' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="mx-1 px-3 py-2 text-gray-400 dark:text-gray-500 select-none"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => pagination.onPageChange(Number(item))}
                        className={`mx-1 inline-flex items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200
                          ${
                            item === pagination.page
                              ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-200 shadow-md'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }
                        `}
                        disabled={item === pagination.page || loading}
                      >
                        {item}
                      </button>
                    )
                )}
                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={
                    pagination.page === pagination.totalPages || loading
                  }
                  className="mx-1 inline-flex items-center px-2 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  &raquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { TableColumn, TableAction, TablePaginationProps, TableProps };
