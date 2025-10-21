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
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const Sidebar = () => {
  const { 
    language, 
    currentPage, 
    setCurrentPage, 
    sidebarOpen, 
    setSidebarOpen 
  } = useStore();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: getTranslation('dashboard', language) },
    { id: 'voice', icon: Mic, label: getTranslation('voiceAssistant', language) },
    { id: 'analytics', icon: BarChart3, label: getTranslation('businessAnalytics', language) },
    { id: 'pricing', icon: IndianRupee, label: getTranslation('pricingAdvisor', language) },
    { id: 'demand', icon: Calendar, label: getTranslation('demandPredictions', language) },
    { id: 'savings', icon: PiggyBank, label: getTranslation('savingsGoals', language) },
    { id: 'demo', icon: Star, label: language === 'hindi' ? 'रेखा की कहानी' : 'Rekha\'s Story' },
    { id: 'settings', icon: Settings, label: getTranslation('settings', language) },
  ];

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
        <nav className="flex-1 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2
                  transition-all duration-200 text-left
                  ${isActive 
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
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👩</span>
              </div>
              <div>
                <p className="text-gray-900 text-sm font-medium">Rekha Didi</p>
                <p className="text-gray-500 text-xs">Pickle Seller</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
