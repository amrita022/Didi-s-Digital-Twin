import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  IndianRupee,
  Wallet,
  Target,
  AlertCircle,
  Edit3,
  Plus,
  RefreshCw
} from 'lucide-react';
//import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
// import { getTranslation } from '../../utils/translations';
import AddDashboardDataModal from './AddDashboardDataModal';
// import AddTransactionModal from './AddTransactionModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const Dashboard = () => {
  const { uid, loading: authLoading, user } = useAuth();
  const { language } = useStore();
  
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    if (uid) {
      console.log('Refreshing dashboard...');
      fetchDashboardData(uid);
    }
  };

  // Listen for custom 'refreshDashboard' events from voice assistant
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Dashboard refresh event received');
      if (uid) {
        fetchDashboardData(uid);
      }
    };

    window.addEventListener('refreshDashboard', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, [uid]);

  // Sync user with MongoDB
  useEffect(() => {
    const syncUser = async () => {
      if (!uid || !user?.email) return;
      
      try {
        const res = await fetch(`${API_URL}/api/user/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: uid, 
            email: user.email 
          })
        });
        
        if (!res.ok) throw new Error('User sync failed');
        console.log('User synced with MongoDB');
      } catch (error) {
        console.error('User sync error:', error);
      }
    };

    if (!authLoading && uid) {
      syncUser();
    }
  }, [authLoading, uid, user]);

  // Fetch dashboard data
  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      console.log("Fetching dashboard for userId:", userId);
      
      const res = await fetch(`${API_URL}/api/dashboard?userId=${userId}`);
      
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await res.json();
      console.log("Raw API Response:", data);
      
      if (data.success) {
        console.log("Dashboard data received:", data.data);
        console.log("Total Savings from API:", data.data.totalSavings);
        console.log("Goal Target from API:", data.data.goalTarget);
        console.log("Goal Name from API:", data.data.goalName);
        setDashboard(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      console.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && uid) {
      fetchDashboardData(uid);
    }
  }, [authLoading, uid]);

  // Handle saving dashboard updates
  const handleSave = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: uid,
          ...formData
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        console.log("Dashboard updated successfully!");
        fetchDashboardData(uid);
        setShowModal(false);
      } else {
        throw new Error(data.error || 'Save failed');
      }
    } catch (error) {
      console.error("Error saving dashboard:", error);
      console.error("Failed to save data");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!uid) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500">Please log in to view your dashboard</p>
      </div>
    );
  }

  // Extract values with fallbacks - USE SAVED VALUES FIRST!
  const totalSavings = dashboard?.totalSavings || 0;
  const savingsGoal = dashboard?.goalTarget || 25000;
  const goalName = dashboard?.goalName || 'Savings Goal';
  const todayIncome = dashboard?.todayIncome || 0;
  const totalSales = dashboard?.totalSales || 0; // Monthly sales for cards
  const expenses = dashboard?.monthlyExpenses || 0; // Monthly expenses for cards
  const monthlyProfit = dashboard?.monthlyProfit || 0; // Monthly profit for cards
  
  // Business Health Score - ALL-TIME TOTALS
  const allTimeSales = dashboard?.overview?.totalSales || 0;
  const allTimeExpenses = dashboard?.overview?.expenses || 0;
  const allTimeProfit = dashboard?.overview?.monthlyProfit || 0;
  const healthScore = dashboard?.overview?.healthScore || 0;

  // Debug logs
  console.log("🔍 Extracted Values:");
  console.log("  totalSavings:", totalSavings);
  console.log("  savingsGoal:", savingsGoal);
  console.log("  goalName:", goalName);
  console.log("  todayIncome:", todayIncome);
  console.log("  totalSales (monthly):", totalSales);
  console.log("  expenses (monthly):", expenses);
  console.log("  monthlyProfit:", monthlyProfit);
  console.log("  allTimeSales:", allTimeSales);
  console.log("  allTimeExpenses:", allTimeExpenses);
  console.log("  allTimeProfit:", allTimeProfit);
  console.log("  healthScore:", healthScore);
  console.log("  overview:", dashboard?.overview);

  const savingsPercentage = savingsGoal > 0 ? Math.round((totalSavings / savingsGoal) * 100) : 0;
  console.log("  savingsPercentage:", savingsPercentage);
  
  const healthColor = healthScore >= 80 ? "text-green-600" : healthScore >= 60 ? "text-yellow-600" : "text-red-600";
  const healthText = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Attention";
  const healthTextHindi = healthScore >= 80 ? "उत्कृष्ट" : healthScore >= 60 ? "अच्छा" : "ध्यान चाहिए";

  const StatCard = ({ title, value, icon, trend, trendValue, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {React.createElement(icon, { size: 24, className: "text-white" })}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="text-sm font-medium">{trendValue}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );

  const TransactionItem = ({ transaction }) => (
    <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-500/50 transition-all duration-300 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            transaction.type === "income" 
              ? "bg-green-100 text-green-600" 
              : "bg-red-100 text-red-600"
          }`}>
            {transaction.type === "income" ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownRight className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {transaction.description}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {transaction.descriptionHindi || transaction.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {transaction.category}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(transaction.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <p className={`text-lg font-bold ${
          transaction.type === "income" ? "text-green-600" : "text-red-600"
        }`}>
          {transaction.type === "income" ? "+" : "-"}₹{transaction.amount}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section with Edit and Refresh Buttons */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-3xl">👩‍🍳</span>
            </div>
            <div>
              <p className="text-gray-600">
                {language === 'hindi' 
                  ? 'आज आपके व्यापार के लिए कुछ अच्छे सुझाव हैं' 
                  : 'Here are some great insights for your business today'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow transition-colors"
              title={language === 'hindi' ? 'रीफ्रेश करें' : 'Refresh'}
            >
              <RefreshCw size={18} /> 
              {language === 'hindi' ? 'रीफ्रेश' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition-colors"
            >
              <Edit3 size={18} /> 
              {language === 'hindi' ? 'डेटा अपडेट करें' : 'Update Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={language === 'hindi' ? 'आज की आय' : "Today's Income"}
          value={`₹${todayIncome.toLocaleString()}`}
          icon={IndianRupee}
          trend={todayIncome > 0 ? "up" : null}
          trendValue="12"
          color="bg-blue-500"
          bgColor="bg-white"
        />
        <StatCard
          title={language === 'hindi' ? 'मासिक लाभ' : 'Monthly Profit'}
          value={`₹${monthlyProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend={monthlyProfit > 0 ? "up" : monthlyProfit < 0 ? "down" : null}
          trendValue="25"
          color="bg-green-500"
          bgColor="bg-white"
        />
        <StatCard
          title={language === 'hindi' ? 'कुल बचत' : 'Total Savings'}
          value={`₹${totalSavings.toLocaleString()}`}
          icon={Wallet}
          trend={totalSavings > 0 ? "up" : null}
          trendValue="8"
          color="bg-purple-500"
          bgColor="bg-white"
        />
        <StatCard
          title={language === 'hindi' ? 'लक्ष्य प्रगति' : 'Goal Progress'}
          value={`${savingsPercentage}%`}
          icon={Target}
          trend={savingsPercentage > 50 ? "up" : null}
          trendValue="15"
          color="bg-orange-500"
          bgColor="bg-white"
        />
      </div>

      {/* Business Health Score */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 col-span-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              {language === 'hindi' ? 'व्यापार स्वास्थ्य स्कोर' : 'Business Health Score'}
            </h2>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${healthColor}`}>{healthScore}/100</p>
            <p className="text-sm text-gray-600">
              {language === 'hindi' ? healthTextHindi : healthText}
            </p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              healthScore >= 80 ? 'bg-green-500' : healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'hindi' ? 'कुल बिक्री (सभी समय)' : 'Total Sales (All-Time)'}
            </p>
            <p className="text-2xl font-bold text-green-600">₹{allTimeSales.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'hindi' ? 'कुल खर्च (सभी समय)' : 'Total Expenses (All-Time)'}
            </p>
            <p className="text-2xl font-bold text-red-600">₹{allTimeExpenses.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'hindi' ? 'शुद्ध लाभ (सभी समय)' : 'Net Profit (All-Time)'}
            </p>
            <p className="text-2xl font-bold text-blue-600">₹{allTimeProfit.toLocaleString()}</p>
          </div>
        </div>

        {healthScore < 70 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {language === 'hindi' 
                  ? 'एआई सिफारिश: लाभ मार्जिन में सुधार के लिए अपनी मूल्य निर्धारण रणनीति की समीक्षा करें।'
                  : 'AI Recommendation: Review your pricing strategy to improve profit margins.'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout for Recent Transactions and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {language === 'hindi' ? 'हाल के लेनदेन' : 'Recent Transactions'}
            </h3>
          </div>

          <div className="h-[400px] pr-4 overflow-y-auto">
            {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction._id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add your first transaction to see it here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="space-y-4">
          {/* Achievement Card */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 shadow-sm">
            <h3 className="text-lg font-bold text-pink-800 mb-2">
              🎉 {language === 'hindi' ? 'उपलब्धि अनलॉक!' : 'Achievement Unlocked!'}
            </h3>
            <p className="text-sm text-pink-700 mb-1">
              {language === 'hindi' 
                ? `आपने अपने लक्ष्य के लिए ₹${totalSavings.toLocaleString()} बचाए हैं!` 
                : `You've saved ₹${totalSavings.toLocaleString()} towards your goal!`
              }
            </p>
            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-pink-300">
              <p className="text-sm text-pink-800">
                {language === 'hindi' 
                  ? `${goalName} के लक्ष्य तक पहुँचने के लिए केवल ₹${(savingsGoal - totalSavings).toLocaleString()} और! 🪡` 
                  : `Only ₹${(savingsGoal - totalSavings).toLocaleString()} more to reach your ${goalName} goal! 🪡`
                }
              </p>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Sparkles size={20} className="text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'hindi' ? 'एआई सिफारिशें' : 'AI Recommendations'}
                </h2>
              </div>
              {dashboard?.aiInsights && dashboard.aiInsights.some(i => i.model === 'prophet_ai') && (
                <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-full text-xs font-medium text-purple-700 border border-purple-300">
                  <Sparkles size={12} />
                  Prophet AI
                </span>
              )}
            </div>
            <div className="space-y-3">
              {dashboard?.aiInsights && dashboard.aiInsights.length > 0 ? (
                dashboard.aiInsights.map((insight, index) => (
                  <div 
                    key={`ai-insight-${index}`} 
                    className={`p-4 rounded-lg border ${
                      insight.model === 'prophet_ai'
                        ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200'
                        : insight.priority === 'high' 
                        ? 'bg-orange-50 border-orange-200' 
                        : insight.priority === 'medium'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <p className="text-sm font-bold text-gray-900 mb-1">{insight.title}</p>
                    <p className="text-sm text-gray-700">{insight.message}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-gray-900">
                      🌶️ {language === 'hindi' ? 'लेनदेन जोड़ें AI insights के लिए' : 'Add transactions to get AI insights'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Update Data Modal */}
      {showModal && (
        <AddDashboardDataModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          existingData={{
            totalSavings: totalSavings,
            goalTarget: savingsGoal,
            goalName: goalName,
            todayIncome: todayIncome,
            monthlyProfit: monthlyProfit,
            monthlyExpenses: expenses,
            totalSales: totalSales
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;