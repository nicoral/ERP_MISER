import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../config/constants';
import { HEADER_TEXTS } from '../../config/texts';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../services/auth/authService';

// Componente separado para el menú de usuario
const UserMenu = ({
  isOpen,
  onClose,
  onLogout,
  onToggleTheme,
  theme,
  navigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  theme: string;
  navigate: ReturnType<typeof useNavigate>;
}) =>
  isOpen ? (
    <div
      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-1 z-50"
      role="menu"
      aria-label="Menú de usuario"
    >
      <button
        onClick={() => {
          navigate(ROUTES.PROFILE);
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        role="menuitem"
      >
        {HEADER_TEXTS.profile}
      </button>
      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        role="menuitem"
      >
        {HEADER_TEXTS.options}
      </button>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      <button
        onClick={() => {
          onToggleTheme();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 rounded-md"
        role="menuitem"
      >
        {theme === 'dark' ? (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>{HEADER_TEXTS.themeLight}</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <span>{HEADER_TEXTS.themeDark}</span>
          </>
        )}
      </button>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      <button
        onClick={onLogout}
        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        role="menuitem"
      >
        {HEADER_TEXTS.logout}
      </button>
    </div>
  ) : null;

export const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };
  const user = getCurrentUser();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {HEADER_TEXTS.systemName}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(open => !open)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200 ${isUserMenuOpen ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm">{user?.firstName?.[0]}</span>
                )}
              </div>
              <span className="text-sm">{user?.firstName}</span>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <UserMenu
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              onLogout={handleLogout}
              onToggleTheme={toggleTheme}
              theme={theme}
              navigate={navigate}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
