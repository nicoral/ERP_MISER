import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
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
import { ServiceForm } from './features/service/components/ServiceForm';
import { ServiceDetails } from './features/service/components/ServiceDetails';
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
import { setNavigate } from './services/api/httpInterceptor';
import { useEffect } from 'react';
import ComingSoon from './pages/ComingSoon';
import { PaymentList } from './features/payment/components/PaymentList';
import { PaymentDetails } from './features/payment/components/PaymentDetails';
import { EntryPartList } from './features/entryPart/EntryPartList';
import { EntryPartForm } from './features/entryPart/EntryPartForm';
import { EntryPartDetails } from './features/entryPart/EntryPartDetails';

const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
          <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
          <Route path={ROUTES.COMING_SOON} element={<ComingSoon />} />
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
          <Route path={`${ROUTES.SERVICES}/create`} element={<ServiceForm />} />
          <Route
            path={`${ROUTES.SERVICES}/edit/:id`}
            element={<ServiceForm />}
          />
          <Route path={`${ROUTES.SERVICES}/:id`} element={<ServiceDetails />} />
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
          <Route
            path={ROUTES.REQUIREMENTS_ARTICLES}
            element={<RequirementsArticlesRoute />}
          />
          <Route
            path={ROUTES.REQUIREMENTS_SERVICES}
            element={<RequirementsServicesRoute />}
          />
          <Route
            path={ROUTES.REQUIREMENTS_ARTICLES_CREATE}
            element={<RequirementArticlesFormRoute />}
          />
          <Route
            path={ROUTES.REQUIREMENTS_SERVICES_CREATE}
            element={<RequirementServicesFormRoute />}
          />
          <Route
            path={ROUTES.REQUIREMENTS_ARTICLES_DETAILS}
            element={<RequirementArticlesDetailsRoute />}
          />
          <Route
            path={ROUTES.REQUIREMENTS_SERVICES_DETAILS}
            element={<RequirementServicesDetailsRoute />}
          />
          <Route
            path={ROUTES.REQUIREMENTS_ARTICLES_EDIT}
            element={<RequirementArticlesEditRoute />}
          />
          <Route
            path={ROUTES.REQUIREMENTS_SERVICES_EDIT}
            element={<RequirementServicesEditRoute />}
          />
          <Route
            path={ROUTES.GENERAL_SETTINGS}
            element={<GeneralSettingsForm />}
          />
          <Route path={ROUTES.PAYMENTS} element={<PaymentList />} />
          <Route path={ROUTES.PAYMENT_DETAILS} element={<PaymentDetails />} />
          <Route path={ROUTES.ENTRY_PARTS} element={<EntryPartList />} />
          <Route path={ROUTES.ENTRY_PART_CREATE} element={<EntryPartForm />} />
          <Route
            path={ROUTES.ENTRY_PART_DETAILS}
            element={<EntryPartDetails />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

const RequirementsArticlesRoute = () => <RequirementList type="ARTICLE" />;
const RequirementsServicesRoute = () => <RequirementList type="SERVICE" />;
const RequirementArticlesFormRoute = () => <RequirementForm type="ARTICLE" />;
const RequirementServicesFormRoute = () => <RequirementForm type="SERVICE" />;
const RequirementArticlesDetailsRoute = () => (
  <RequirementDetails type="ARTICLE" />
);
const RequirementServicesDetailsRoute = () => (
  <RequirementDetails type="SERVICE" />
);
const RequirementArticlesEditRoute = () => <RequirementForm type="ARTICLE" />;
const RequirementServicesEditRoute = () => <RequirementForm type="SERVICE" />;

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
