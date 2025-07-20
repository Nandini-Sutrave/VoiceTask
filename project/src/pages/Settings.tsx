import { useState, useEffect } from 'react';
import { Bell, UserCircle, Moon, Speaker, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notificationsEnabled') === 'true'
  );
  const [voiceEnabled, setVoiceEnabled] = useState(
    localStorage.getItem('voiceEnabled') !== 'false'
  );
  const [voiceSpeed, setVoiceSpeed] = useState(
    parseInt(localStorage.getItem('voiceSpeed') || '1')
  );
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    
    // Request notification permission if enabled
    if (notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);
  
  useEffect(() => {
    localStorage.setItem('voiceEnabled', voiceEnabled.toString());
  }, [voiceEnabled]);
  
  useEffect(() => {
    localStorage.setItem('voiceSpeed', voiceSpeed.toString());
  }, [voiceSpeed]);
  
  const handleToggleNotifications = () => {
    if (!notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          toast.success('Notifications enabled');
        } else {
          toast.error('Notification permission denied');
        }
      });
    } else {
      setNotificationsEnabled(!notificationsEnabled);
      toast.success(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled');
    }
  };
  
  const handleToggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    toast.success(voiceEnabled ? 'Voice input disabled' : 'Voice input enabled');
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // In a real app, this would call an API to change the password
    toast.success('Password updated successfully');
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account and application preferences
        </p>
      </div>
      
      {/* Account settings */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary-500" />
          Account Settings
        </h2>
        
        <div className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="flex">
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="input bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
              <button className="ml-2 btn-ghost border border-gray-300 dark:border-gray-700">
                Change
              </button>
            </div>
          </div>
          
          {/* Password change */}
          <form onSubmit={handlePasswordChange}>
            <h3 className="text-md font-medium mb-3">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div className="pt-2">
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </div>
          </form>
          
          {/* Account actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={logout} className="text-error-600 dark:text-error-400 font-medium hover:text-error-700 dark:hover:text-error-300">
              Sign out
            </button>
          </div>
        </div>
      </div>
      
      {/* App preferences */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary-500" />
          App Preferences
        </h2>
        
        <div className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Dark Mode
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Toggle between light and dark theme
              </p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input
                type="checkbox"
                name="theme"
                id="theme"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="theme"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enable browser notifications for reminders
              </p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input
                type="checkbox"
                name="notifications"
                id="notifications"
                checked={notificationsEnabled}
                onChange={handleToggleNotifications}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="notifications"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notificationsEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          {/* Voice */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Speaker className="h-4 w-4" />
                Voice Input
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enable voice input for task creation
              </p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input
                type="checkbox"
                name="voice"
                id="voice"
                checked={voiceEnabled}
                onChange={handleToggleVoice}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="voice"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  voiceEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          {/* Voice speed */}
          {voiceEnabled && (
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              <h3 className="font-medium text-sm mb-2">Voice Recognition Speed</h3>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Data management */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        
        <div className="space-y-4">
          <button className="w-full text-left flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Export all data</span>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </button>
          
          <button className="w-full text-left flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Delete account</span>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* CSS for toggle switch */}
      <style jsx="true">{`
        .toggle-checkbox:checked {
          right: 0;
          transform: translateX(100%);
          border-color: white;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #4f46e5;
        }
      `}</style>
    </div>
  );
};

export default Settings;