import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout/MainLayout';
import { ROUTES } from './config/constants';
import { EmployeeList } from './features/employees/components/EmployeeList';
import { EmployeeForm } from './features/employees/components/EmployeeForm';
import { Administration } from './pages/Administration';
import { Warehouse } from './pages/Warehouse';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/common/PrivateRoute';

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
                <Route path={ROUTES.ADMINISTRATION} element={<Administration />} />
                <Route path={ROUTES.EMPLOYEES} element={<EmployeeList />} />
                <Route path={ROUTES.EMPLOYEE_CREATE} element={<EmployeeForm />} />
                <Route path={ROUTES.EMPLOYEE_EDIT} element={<EmployeeForm />} />
                <Route path={ROUTES.WAREHOUSE} element={<Warehouse />} />
                <Route path={ROUTES.WAREHOUSE_ARTICLES} element={<div>Artículos</div>} />
                <Route path={ROUTES.WAREHOUSE_SERVICES} element={<div>Servicios</div>} />
                <Route path={ROUTES.WAREHOUSE_SUPPLIERS} element={<div>Proveedores</div>} />
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
