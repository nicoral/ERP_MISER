import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout/MainLayout';
import { ROUTES } from './config/constants';
import { EmployeeForm } from './features/employees/components/EmployeeForm';
import { Administration } from './pages/Administration';
import { Warehouse } from './pages/Warehouse';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import { ArticleList } from './features/article/components/ArticleList';
import { ServiceList } from './features/service/components/ServiceList';
import { SupplierList } from './features/supplier/components/SupplierList';
import { Employees } from './pages/Employees';
import { RoleForm } from './features/administration/components/RoleForm';
import { WarehouseForm } from './features/warehouse/components/WarehouseForm';
import Profile from './pages/Profile';
import { ArticleForm } from './features/article/components/ArticleForm';
import { SupplierForm } from './features/supplier/components/SupplierForm';
import { CostCenterList } from './features/costCenter/components/costCenterList';
import { CostCenterForm } from './features/costCenter/components/costCenterForm';
import { CostCenterDetails } from './features/costCenter/components/CostCenterDetails';
import { RequirementForm } from './features/requirement/components/RequirementForm';
import { RequirementList } from './features/requirement/components/RequirementList';
import { RequirementDetails } from './features/requirement/components/RequirementDetails';
import { WelcomePage } from './pages/WelcomePage';
import { UserRolesForm } from './features/administration/components/UserRolesForm';
import { AuditLogForm } from './features/administration/components/AuditLogForm';
import { GeneralSettingsForm } from './features/administration/components/GeneralSettingsForm';
import Unauthorized from './pages/Unauthorized';
import { Quotations } from './pages/Quotations';
import { QuotationDetails } from './features/quotation/components/QuotationDetails';
import { QuotationEdit } from './pages/QuotationEdit';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
          <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.ADMINISTRATION} element={<Administration />} />
          <Route path={ROUTES.ROLES} element={<UserRolesForm />} />
          <Route path={ROUTES.ROLE_CREATE} element={<RoleForm />} />
          <Route path={ROUTES.ROLE_EDIT} element={<RoleForm />} />
          <Route path={ROUTES.AUDIT_LOGS} element={<AuditLogForm />} />
          <Route path={ROUTES.EMPLOYEES} element={<Employees />} />
          <Route path={ROUTES.EMPLOYEE_CREATE} element={<EmployeeForm />} />
          <Route path={ROUTES.EMPLOYEE_EDIT} element={<EmployeeForm />} />
          <Route path={ROUTES.WAREHOUSE} element={<Warehouse />} />
          <Route path={ROUTES.WAREHOUSE_CREATE} element={<WarehouseForm />} />
          <Route path={ROUTES.WAREHOUSE_EDIT} element={<WarehouseForm />} />
          <Route path={ROUTES.ARTICLES} element={<ArticleList />} />
          <Route path={ROUTES.ARTICLE_CREATE} element={<ArticleForm />} />
          <Route path={ROUTES.ARTICLE_EDIT} element={<ArticleForm />} />
          <Route path={ROUTES.SERVICES} element={<ServiceList />} />
          <Route path={ROUTES.SUPPLIERS} element={<SupplierList />} />
          <Route path={ROUTES.SUPPLIERS_CREATE} element={<SupplierForm />} />
          <Route path={ROUTES.SUPPLIERS_EDIT} element={<SupplierForm />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.QUOTATIONS} element={<Quotations />} />
          <Route
            path={ROUTES.QUOTATION_DETAILS}
            element={<QuotationDetails />}
          />
          <Route path={ROUTES.QUOTATION_EDIT} element={<QuotationEdit />} />
          <Route path={ROUTES.COST_CENTER} element={<CostCenterList />} />
          <Route
            path={ROUTES.COST_CENTER_CREATE}
            element={<CostCenterForm />}
          />
          <Route path={ROUTES.COST_CENTER_EDIT} element={<CostCenterForm />} />
          <Route
            path={ROUTES.COST_CENTER_DETAILS}
            element={<CostCenterDetails />}
          />
          <Route path={ROUTES.REQUIREMENTS} element={<RequirementList />} />
          <Route
            path={ROUTES.REQUIREMENTS_DETAILS}
            element={<RequirementDetails />}
          />
          <Route
            path={ROUTES.REQUIREMENTS_CREATE}
            element={<RequirementForm />}
          />
          <Route path={ROUTES.REQUIREMENT_EDIT} element={<RequirementForm />} />
          <Route
            path={ROUTES.GENERAL_SETTINGS}
            element={<GeneralSettingsForm />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
