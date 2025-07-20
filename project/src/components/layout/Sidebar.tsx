import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, BarChart2, Settings, X, Mic } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navLinks = [
    { to: '/', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/tasks', icon: <CheckSquare className="h-5 w-5" />, label: 'Tasks' },
    { to: '/analytics', icon: <BarChart2 className="h-5 w-5" />, label: 'Analytics' },
    { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary-600" />
            <span className="font-semibold text-lg">VoiceTask</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
              end={link.to === '/'}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-3">
            <h4 className="font-medium text-primary-700 dark:text-primary-300 flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Assistant
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Press the mic button to add tasks using your voice
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;