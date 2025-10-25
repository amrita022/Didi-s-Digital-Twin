import React from 'react';
import { 
  Home, 
  Mic, 
  BarChart3, 
  IndianRupee, 
  Calendar, 
  PiggyBank, 
  Settings,
  Menu,
  X,
  Star
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const Sidebar = () => {
  const { 
    language, 
    sidebarOpen, 
    setSidebarOpen,
    userName 
  } = useStore();

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user display name
  const displayName = userName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: Home, label: getTranslation('dashboard', language) },
    { id: 'voice', path: '/voice-assistant', icon: Mic, label: getTranslation('voiceAssistant', language) },
    { id: 'analytics', path: '/analytics', icon: BarChart3, label: getTranslation('businessAnalytics', language) },
    { id: 'pricing', path: '/pricing', icon: IndianRupee, label: getTranslation('pricingAdvisor', language) },
    { id: 'demand', path: '/demand', icon: Calendar, label: getTranslation('demandPredictions', language) },
    { id: 'savings', path: '/savings', icon: PiggyBank, label: getTranslation('savingsGoals', language) },
    { id: 'demo', path: '/demo', icon: Star, label: language === 'hindi' ? 'रेखा की कहानी' : 'Rekha\'s Story' },
    { id: 'settings', path: '/settings', icon: Settings, label: getTranslation('settings', language) },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out z-50
        flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌸</span>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-lg">Didi's Digital Twin</h1>
              <p className="text-gray-500 text-sm">AI Business Advisor</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation - Takes up available space */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2
                  transition-all duration-200 text-left
                  ${active 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer - Sticky at bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm font-semibold truncate">
                  {displayName}
                </p>
                <p className="text-gray-600 text-xs truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;