import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SIDEBAR_TEXTS } from '../../config/texts';
import { ROUTES } from '../../config/constants';
import type { MenuItem } from '../../types/sidebar';
import {
  DashboardIcon,
  SettingsIcon,
  EmployeesIcon,
  WarehouseIcon,
  SuppliersIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ProcessIcon,
  DocumentIcon,
  CostCenterIcon,
  LogisticsIcon,
  RolesIcon,
  AuditIcon,
  CalculatorIcon,
  ServicesIcon,
} from '../common/Icons';
import { getCurrentUser } from '../../services/auth/authService';
import { CreditCardIcon } from 'lucide-react';

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    permission: ['view_administration'],
    icon: <DashboardIcon className="w-5 h-5" />,
  },
  {
    label: SIDEBAR_TEXTS.administration,
    permission: ['view_administration', 'view_roles'],
    icon: <SettingsIcon className="w-5 h-5" />,
    subItems: [
      {
        label: SIDEBAR_TEXTS.generalSettings,
        path: ROUTES.GENERAL_SETTINGS,
        permission: ['view_administration'],
        icon: <SettingsIcon className="w-5 h-5" />,
      },
      {
        label: SIDEBAR_TEXTS.roles,
        path: ROUTES.ROLES,
        permission: ['view_roles'],
        icon: <RolesIcon className="w-5 h-5" />,
      },
      {
        label: SIDEBAR_TEXTS.auditLogs,
        path: ROUTES.AUDIT_LOGS,
        permission: ['view_administration'],
        icon: <AuditIcon className="w-5 h-5" />,
      },
    ],
  },
  {
    label: SIDEBAR_TEXTS.employees,
    path: ROUTES.EMPLOYEES,
    permission: ['view_employee'],
    icon: <EmployeesIcon className="w-5 h-5" />,
  },
  {
    label: SIDEBAR_TEXTS.costCenter,
    path: ROUTES.COST_CENTER,
    permission: ['view_cost_centers'],
    icon: <CostCenterIcon className="w-5 h-5" />,
  },
  {
    label: SIDEBAR_TEXTS.logistics,
    permission: ['view_warehouses', 'view_articles', 'view_suppliers'],
    icon: <LogisticsIcon className="w-5 h-5" />,
    subItems: [
      {
        label: SIDEBAR_TEXTS.warehouse,
        path: ROUTES.WAREHOUSE,
        permission: ['view_warehouses'],
        icon: <WarehouseIcon className="w-5 h-5" />,
      },
      {
        label: SIDEBAR_TEXTS.warehouseArticles,
        path: ROUTES.ARTICLES,
        permission: ['view_articles'],
        icon: <WarehouseIcon className="w-4 h-4" />,
      },
      {
        label: SIDEBAR_TEXTS.warehouseServices,
        path: ROUTES.SERVICES,
        permission: ['view_services'],
        icon: <ServicesIcon className="w-4 h-4" />,
      },
      {
        label: SIDEBAR_TEXTS.warehouseSuppliers,
        path: ROUTES.SUPPLIERS,
        permission: ['view_suppliers'],
        icon: <SuppliersIcon className="w-4 h-4" />,
      },
    ],
  },
  {
    label: SIDEBAR_TEXTS.process,
    permission: ['view_requirements'],
    icon: <ProcessIcon className="w-5 h-5" />,
    subItems: [
      {
        label: SIDEBAR_TEXTS.processRequirement,
        path: ROUTES.REQUIREMENTS,
        permission: ['view_requirements'],
        icon: <DocumentIcon className="w-4 h-4" />,
      },
      {
        label: SIDEBAR_TEXTS.quotation,
        path: ROUTES.QUOTATIONS,
        permission: ['view_quotations'],
        icon: <CalculatorIcon className="w-4 h-4" />,
      },
      {
        label: SIDEBAR_TEXTS.payments,
        path: ROUTES.PAYMENTS,
        permission: [],
        icon: <CreditCardIcon className="w-4 h-4" />,
      },
    ],
  },
  /* {
    label: SIDEBAR_TEXTS.processService,
    permission: ['view_requirements'],
    icon: <ProcessIcon className="w-5 h-5" />,
    subItems: [
      {
        label: SIDEBAR_TEXTS.processRequirement,
        path: ROUTES.REQUIREMENTS,
        permission: ['view_requirements'],
        icon: <DocumentIcon className="w-4 h-4" />,
      },
      {
        label: SIDEBAR_TEXTS.quotation,
        path: ROUTES.QUOTATIONS,
        permission: ['view_quotations'],
        icon: <CalculatorIcon className="w-4 h-4" />,
      },
      {
        label: SIDEBAR_TEXTS.payments,
        path: ROUTES.COMING_SOON,
        permission: [],
        icon: <CreditCardIcon className="w-4 h-4" />,
      },
    ],
  }, */
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar = ({ isOpen, onClose, onCollapse }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuItemsAllowed, setMenuItemsAllowed] = useState<MenuItem[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    const permissions = user?.role.permissions.map(
      permission => permission.name
    );

    // Función para verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasAnyPermission = (requiredPermissions: string[] | undefined) => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
      return requiredPermissions.some(permission =>
        permissions?.includes(permission)
      );
    };

    const filteredItems = menuItems
      .filter(item => hasAnyPermission(item.permission))
      .map(item => {
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter(subItem =>
            hasAnyPermission(subItem.permission)
          );
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      });

    setMenuItemsAllowed(filteredItems);
  }, []);

  const toggleSubmenu = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path) ? prev.filter(item => item !== path) : [...prev, path]
    );
  };

  const handleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapse(newCollapsedState);
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div
          onClick={handleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 z-10 hidden lg:block cursor-pointer"
        >
          <ChevronLeftIcon
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </div>
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
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
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
                    <div
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSubmenu(item.path!);
                      }}
                      className="p-1 rounded-md bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    >
                      <ChevronDownIcon
                        className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${expandedItems.includes(item.path!) ? 'rotate-180' : ''}`}
                      />
                    </div>
                  )}
                </NavLink>
              ) : (
                <div
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
                </div>
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
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
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
    </>
  );
};
