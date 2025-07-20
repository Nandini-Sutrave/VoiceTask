import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Mic } from 'lucide-react';

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Simple header with theme toggle */}
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-primary-600" />
          <span className="font-semibold text-lg">VoiceTask</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>
      </header>
      
      {/* Auth content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>
      
      {/* Simple footer */}
      <footer className="py-4 px-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} VoiceTask. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;