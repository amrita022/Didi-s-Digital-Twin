// In your src/components/Layout/Sidebar.jsx
import React from 'react';
import { 
  Home, Mic, BarChart3, IndianRupee, Calendar, 
  PiggyBank, Settings, Menu, X, Star
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
    userName 
  } = useStore();

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = useSidebar();

  const displayName = userName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: <Home size={20} className="text-white" />, label: getTranslation('dashboard', language) },
    { id: 'voice', path: '/voice-assistant', icon: <Mic size={20} className="text-white" />, label: getTranslation('voiceAssistant', language) },
    { id: 'analytics', path: '/analytics', icon: <BarChart3 size={20} className="text-white" />, label: getTranslation('businessAnalytics', language) },
    { id: 'pricing', path: '/pricing', icon: <IndianRupee size={20} className="text-white" />, label: getTranslation('pricingAdvisor', language) },
    { id: 'demand', path: '/demand', icon: <Calendar size={20} className="text-white" />, label: getTranslation('demandPredictions', language) },
    { id: 'savings', path: '/savings', icon: <PiggyBank size={20} className="text-white" />, label: getTranslation('savingsGoals', language) },
    { id: 'demo', path: '/demo', icon: <Star size={20} className="text-white" />, label: language === 'hindi' ? 'रेखा की कहानी' : 'Rekha\'s Story' },
    { id: 'settings', path: '/settings', icon: <Settings size={20} className="text-white" />, label: getTranslation('settings', language) },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <SidebarBody className="justify-between gap-10">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Logo - Only show when sidebar is open */}
        {open && (
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">DS</span>
            </div>
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

      {/* Footer - User Profile - Only show when sidebar is open */}
      {open && (
        <div>
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