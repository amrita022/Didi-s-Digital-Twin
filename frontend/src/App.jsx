import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant';
import BusinessAnalytics from './components/Analytics/BusinessAnalytics';
import PricingAdvisor from './components/Pricing/PricingAdvisor';
import DemandPredictions from './components/Demand/DemandPredictions';
import SavingsGoals from './components/Savings/SavingsGoals';
import Settings from './components/Settings/Settings';
import RekhaStory from './components/Demo/RekhaStory';
import useStore from './store/useStore';

function App() {
  const { currentPage, sidebarOpen, demoMode } = useStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'voice':
        return <VoiceAssistant />;
      case 'analytics':
        return <BusinessAnalytics />;
      case 'pricing':
        return <PricingAdvisor />;
      case 'demand':
        return <DemandPredictions />;
      case 'savings':
        return <SavingsGoals />;
      case 'settings':
        return <Settings />;
      case 'demo':
        return <RekhaStory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {renderPage()}
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;