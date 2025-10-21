import React from 'react';
import { Menu, Bell, Settings, LogOut } from 'lucide-react';
import useStore from "../../store/useStore";
import { getTranslation } from '../../utils/translations';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { 
    language, 
    userName, 
    setSidebarOpen, 
    setCurrentPage 
  } = useStore();

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      useStore.getState().setIsLoggedIn(false);
      useStore.getState().setAuthView('login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900">
              {getTranslation('welcome', language)}, {userName}! 🌸
            </h1>
            <p className="text-gray-600 text-sm">
              {language === 'hindi' 
                ? 'आपका व्यापार कैसा चल रहा है?' 
                : 'How is your business doing today?'
              }
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-700" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setCurrentPage('settings')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings size={20} className="text-gray-700" />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          {/* Language Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => useStore.getState().setLanguage('english')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === 'english' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => useStore.getState().setLanguage('hindi')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === 'hindi' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              हिं
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;