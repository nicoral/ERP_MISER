import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout/MainLayout';
import { ROUTES } from './config/constants';
import { EmployeeForm } from './features/employees/components/EmployeeForm';
import { Administration } from './pages/Administration';
import { Warehouse } from './pages/Warehouse';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import { ArticleList } from './features/warehouse/components/ArticleList';
import { ServiceList } from './features/warehouse/components/ServiceList';
import { SupplierList } from './features/warehouse/components/SupplierList';
import { Employees } from './pages/Employees';
import { RoleForm } from './features/administration/components/RoleForm';
import { WarehouseForm } from './features/warehouse/components/WarehouseForm';
import Profile from './pages/Profile';
import { ArticleForm } from './features/warehouse/components/ArticleForm';
import { SupplierForm } from './features/warehouse/components/SupplierForm';
import { CostCenterList } from './features/costCenter/components/costCenterList';
import { CostCenterForm } from './features/costCenter/components/costCenterForm';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route
                  path={ROUTES.ADMINISTRATION}
                  element={<Administration />}
                />
                <Route path={ROUTES.ROLES} element={<RoleForm />} />
                <Route path={ROUTES.ROLES_EDIT} element={<RoleForm />} />
                <Route path={ROUTES.EMPLOYEES} element={<Employees />} />
                <Route
                  path={ROUTES.EMPLOYEE_CREATE}
                  element={<EmployeeForm />}
                />
                <Route path={ROUTES.EMPLOYEE_EDIT} element={<EmployeeForm />} />
                <Route path={ROUTES.WAREHOUSE} element={<Warehouse />} />
                <Route
                  path={ROUTES.WAREHOUSE_CREATE}
                  element={<WarehouseForm />}
                />
                <Route
                  path={ROUTES.WAREHOUSE_EDIT}
                  element={<WarehouseForm />}
                />
                <Route
                  path={ROUTES.WAREHOUSE_ARTICLES}
                  element={<ArticleList />}
                />
                <Route
                  path={ROUTES.WAREHOUSE_ARTICLE_CREATE}
                  element={<ArticleForm />}
                />
                <Route
                  path={ROUTES.WAREHOUSE_ARTICLE_EDIT}
                  element={<ArticleForm />}
                />
                <Route
                  path={ROUTES.WAREHOUSE_SERVICES}
                  element={<ServiceList />}
                />
                <Route
                  path={ROUTES.WAREHOUSE_SUPPLIERS}
                  element={<SupplierList />}
                />
                <Route
                  path={ROUTES.WAREHOUSE_SUPPLIERS_CREATE}
                  element={<SupplierForm />}
                />
                <Route
                  path={ROUTES.WAREHOUSE_SUPPLIERS_EDIT}
                  element={<SupplierForm />}
                />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.COST_CENTER} element={<CostCenterList />} />
                <Route
                  path={ROUTES.COST_CENTER_CREATE}
                  element={<CostCenterForm />}
                />
                <Route
                  path={ROUTES.COST_CENTER_EDIT}
                  element={<CostCenterForm />}
                />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
