import React from 'react';
import type { Role } from '../../../types/user';

interface RoleDetailsProps {
  role: Role;
}

const RoleDetails: React.FC<RoleDetailsProps> = ({ role }) => {
  return (
    <div className="bg-background text-text rounded-lg shadow-md p-6 max-w-xl mx-auto">
      <header className="mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-primary mb-2">{role.name}</h2>
        <p className="text-secondary text-base">{role.description}</p>
      </header>
      <section>
        <h3 className="text-lg font-semibold mb-3 text-secondary">
          Permisos asignados
        </h3>
        {role.permissions.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2">
            {role.permissions.map(perm => (
              <li key={perm.id} className="rounded px-3 py-2 shadow-sm ">
                <span className="block text-sm text-secondary">
                  {perm.description}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Este rol no tiene permisos asignados.
          </p>
        )}
      </section>
    </div>
  );
};

export default RoleDetails;
