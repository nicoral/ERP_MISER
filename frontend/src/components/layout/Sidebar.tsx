import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SIDEBAR_TEXTS } from '../../config/texts';
import { ROUTES } from '../../config/constants';
import type { MenuItem } from '../../types/sidebar';
import {
  DashboardIcon,
  SettingsIcon,
  EmployeesIcon,
  WarehouseIcon,
  ServicesIcon,
  SuppliersIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ProcessIcon,
  DocumentIcon,
} from '../common/Icons';
import { getCurrentUser } from '../../services/auth/authService';

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    permission: 'view_administration',
    icon: <DashboardIcon className="w-5 h-5" />,
  },
  {
    label: SIDEBAR_TEXTS.administration,
    path: ROUTES.ADMINISTRATION,
    permission: 'view_administration',
    icon: <SettingsIcon className="w-5 h-5" />,
  },
  {
    label: SIDEBAR_TEXTS.employees,
    path: ROUTES.EMPLOYEES,
    permission: 'view_employees',
    icon: <EmployeesIcon className="w-5 h-5" />,
  },
  {
    label: SIDEBAR_TEXTS.process,
    icon: <ProcessIcon className="w-5 h-5" />,
    subItems: [
      {
        label: SIDEBAR_TEXTS.processRequirement,
        path: ROUTES.PROCESS_REQUIREMENT,
        icon: <DocumentIcon className="w-4 h-4" />,
      },
    ],
  },
  {
    label: SIDEBAR_TEXTS.warehouse,
    path: ROUTES.WAREHOUSE,
    permission: 'view_warehouses',
    icon: <WarehouseIcon className="w-5 h-5" />,
    subItems: [
      {
        label: SIDEBAR_TEXTS.warehouseArticles,
        path: ROUTES.WAREHOUSE_ARTICLES,
        permission: 'view_articles',
        icon: <WarehouseIcon className="w-4 h-4" />,
      },
      {
        label: SIDEBAR_TEXTS.warehouseServices,
        path: ROUTES.WAREHOUSE_SERVICES,
        permission: 'view_services',
        icon: <ServicesIcon className="w-4 h-4" />,
      },
      {
        label: SIDEBAR_TEXTS.warehouseSuppliers,
        path: ROUTES.WAREHOUSE_SUPPLIERS,
        permission: 'view_suppliers',
        icon: <SuppliersIcon className="w-4 h-4" />,
      },
    ],
  },
];

const user = getCurrentUser();
const permissions = user?.role.permissions.map(permission => permission.name);

const menuItemsAllowed = menuItems.filter(item =>
  item.permission ? permissions?.includes(item.permission) : true
);

export const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSubmenu = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path) ? prev.filter(item => item !== path) : [...prev, path]
    );
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
        >
          <ChevronLeftIcon
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
        <nav className="p-4 space-y-2">
          {menuItemsAllowed.map(item => (
            <div key={item.path || item.label}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                      isActive || expandedItems.includes(item.path!)
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div
                    className={`flex items-center ${isCollapsed ? 'w-full justify-center' : 'space-x-3'}`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {item.subItems && !isCollapsed && (
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSubmenu(item.path!);
                      }}
                      className="p-1 rounded-md bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <ChevronDownIcon
                        className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${expandedItems.includes(item.path!) ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 bg-transparent ${
                    expandedItems.includes(item.label)
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  <div
                    className={`flex items-center ${isCollapsed ? 'w-full justify-center' : 'space-x-3'}`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${expandedItems.includes(item.label) ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
              )}
              {item.subItems &&
                ((item.path && expandedItems.includes(item.path)) ||
                  (!item.path && expandedItems.includes(item.label))) &&
                !isCollapsed && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.subItems.map(subItem => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        {subItem.icon}
                        <span>{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </nav>
      </aside>
      <div
        className={`transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-64'}`}
      />
    </>
  );
};
