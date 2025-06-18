import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useState } from 'react';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setIsSidebarOpen(open => !open);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          onCollapse={handleToggleSidebar}
        />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
