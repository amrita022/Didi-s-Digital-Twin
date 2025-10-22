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
import { useAuth } from './hooks/useAuth'; // Import useAuth
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

function App() {
  const { currentPage, isLoggedIn, authView } = useStore();
  const { loading } = useAuth(); // Get loading state from useAuth

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

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if not logged in
  if (!isLoggedIn) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
          {authView === 'login' ? (
            <Login />
          ) : (
            <Signup />
          )}
        </div>
      </Router>
    );
  }

  // Show main app if logged in
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