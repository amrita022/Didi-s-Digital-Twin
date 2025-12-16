import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant';
import BusinessAnalytics from './components/Analytics/BusinessAnalytics';
import PricingAdvisor from './components/Pricing/PricingAdvisor';
import DemandPredictions from './components/Demand/DemandPredictions';
import SavingsGoals from './components/Savings/SavingsGoals';
import Settings from './components/Settings/Settings';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs';
import useStore from './store/useStore'; // Remove { } - default export
import { useAuth } from './hooks/useAuth';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// Main Layout Component for authenticated routes
const MainLayout = ({ children }) => {
  React.useEffect(() => {
    // Initialize CSS variable
    document.documentElement.style.setProperty('--sidebar-width', '300px');
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width, 300px)' }} className="transition-all duration-300 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useStore();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isLoggedIn, authView, loading } = useAuth();

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

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={!isLoggedIn ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/signup" 
          element={!isLoggedIn ? <Signup /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/voice-assistant" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <VoiceAssistant />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <BusinessAnalytics />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <PricingAdvisor />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/demand" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DemandPredictions />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/savings" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <SavingsGoals />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/demo" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <WhyChooseUs />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;