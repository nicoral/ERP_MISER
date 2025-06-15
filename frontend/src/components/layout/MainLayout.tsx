import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Sidebar />
      <main className="pt-16 pl-64 transition-all duration-300 h-full">
        <div className="p-6 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
