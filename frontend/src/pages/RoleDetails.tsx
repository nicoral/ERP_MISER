import React from 'react';
import { useRoleDetails } from '../features/administration/hooks/useRoleDetails';
import RoleDetailsView from '../features/administration/components/RoleDetailsView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';

const RoleDetails: React.FC = () => {
  const { role, employees, loading, error, updateEmployeeRole, refetch } =
    useRoleDetails();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onClose={() => {}} />;
  }

  if (!role) {
    return <ErrorBanner message="Rol no encontrado" onClose={() => {}} />;
  }

  return (
    <RoleDetailsView
      role={role}
      employees={employees}
      loading={loading}
      onUpdateRole={updateEmployeeRole}
      onRefetch={refetch}
    />
  );
};

export default RoleDetails;
