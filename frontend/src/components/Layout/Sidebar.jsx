// In your src/components/Layout/Sidebar.jsx
import React from 'react';
import { 
  Home, Mic, BarChart3, IndianRupee, Calendar, 
  PiggyBank, Settings, Menu, X, Star, LogOut, Bell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';
// Import Aceternity components
import { 
  Sidebar as AcernitySidebar, 
  SidebarBody, 
  SidebarLink,
  useSidebar
} from '../ui/AcernitySidebar';

const SidebarContent = () => {
  const { 
    language, 
    sidebarOpen, 
    setSidebarOpen,
    userName,
    setLanguage
  } = useStore();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = useSidebar();

  const displayName = userName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: <Home size={20} className="text-white" />, label: getTranslation('dashboard', language) },
    { id: 'voice', path: '/voice-assistant', icon: <Mic size={20} className="text-white" />, label: getTranslation('voiceAssistant', language) },
    { id: 'analytics', path: '/analytics', icon: <BarChart3 size={20} className="text-white" />, label: getTranslation('businessAnalytics', language) },
    { id: 'pricing', path: '/pricing', icon: <IndianRupee size={20} className="text-white" />, label: getTranslation('pricingAdvisor', language) },
    { id: 'demand', path: '/demand', icon: <Calendar size={20} className="text-white" />, label: getTranslation('demandPredictions', language) },
    { id: 'savings', path: '/savings', icon: <PiggyBank size={20} className="text-white" />, label: getTranslation('savingsGoals', language) },
    { id: 'demo', path: '/demo', icon: <Star size={20} className="text-white" />, label: getTranslation('whyChooseUs', language) },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <SidebarBody className="justify-between gap-10" data-tts-ignore="true">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Logo - Only show when sidebar is open */}
        {open && (
          <div className="flex items-center space-x-3 mb-6">
            <img src="/logo.jpg" alt="Didi's Digital Sathi" className="w-12 h-12 object-contain rounded-lg" />
            <div>
              <h1 className="text-white font-bold text-lg">Didi's Digital Sathi</h1>
              <p className="text-gray-400 text-sm">AI Business Advisor</p>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className={`${open ? 'mt-8' : 'mt-4'} flex flex-col gap-2`}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 cursor-pointer ${open ? 'justify-start gap-2 w-full' : 'justify-center h-10 w-10 mx-auto'}`}
              title={!open ? item.label : undefined}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {open && (
                <span className="text-gray-100 text-sm group-hover/sidebar:translate-x-1 transition duration-150">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer - User Profile, Language Toggle, Settings, Logout */}
      {open && (
        <div className="space-y-4">
          {/* User Profile */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {displayName}
                </p>
                <p className="text-gray-300 text-xs truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Settings & Logout Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Settings size={16} />
              <span>{getTranslation('settings', language)}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              <span>{language === 'marathi' ? 'लॉगआउट' : (language === 'hindi' ? 'लॉगआउट' : 'Logout')}</span>
            </button>
          </div>
        </div>
      )}
    </SidebarBody>
  );
};

const Sidebar = () => {
  const { 
    sidebarOpen, 
    setSidebarOpen
  } = useStore();

  return (
    <AcernitySidebar open={sidebarOpen} setOpen={setSidebarOpen}>
      <SidebarContent />
    </AcernitySidebar>
  );
};

export default Sidebar;