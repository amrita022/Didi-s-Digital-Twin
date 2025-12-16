import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  IndianRupee,
  Wallet,
  Target,
  AlertCircle,
  Edit3,
  RefreshCw,
  Bell,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
import AddDashboardDataModal from './AddDashboardDataModal';
import Reminders from '../Reminders/Reminders';
import { GlowingCard } from '../ui/glowing-card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const Dashboard = () => {
  const { uid, loading: authLoading, user } = useAuth();
  const { language, userName } = useStore();
  
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);

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
  
  const healthText = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Attention";
  const healthTextHindi = healthScore >= 80 ? "उत्कृष्ट" : healthScore >= 60 ? "अच्छा" : "ध्यान चाहिए";

  const StatCard = ({ title, value, icon, trend, trendValue }) => (
    <GlowingCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-rose-500/20">
          {React.createElement(icon, { size: 24, className: "text-rose-400" })}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-rose-400' : 'text-gray-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="text-sm font-medium">{trendValue}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </GlowingCard>
  );

  const TransactionItem = ({ transaction }) => {
    if (!transaction) return null;
    
    const transactionDate = transaction.date ? new Date(transaction.date) : new Date();
    const formattedDate = transactionDate.toLocaleDateString(language === 'hindi' ? 'hi-IN' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const description = transaction.description || transaction.descriptionHindi || 'No description';
    const category = transaction.category || 'general';
    const amount = transaction.amount || 0;
    const type = transaction.type || 'expense';
    
    return (
      <GlowingCard className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              type === "income" 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/20 text-rose-400"
            }`}>
              {type === "income" ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {description}
              </p>
              {transaction.descriptionHindi && transaction.descriptionHindi !== description && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {transaction.descriptionHindi}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                  {category}
                </span>
                <span className="text-xs text-gray-500">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <p className={`text-lg font-bold whitespace-nowrap ${
              type === "income" ? "text-emerald-400" : "text-rose-400"
            }`}>
              {type === "income" ? "+" : "-"}₹{amount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </GlowingCard>
    );
  };

  return (
    <div className="space-y-6 bg-black rounded-xl p-6">
      {/* Welcome Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {language === 'hindi' 
              ? `नमस्ते, ${userName}!` 
              : `Namaste, ${userName}!`
            }
          </h1>
          <p className="text-gray-400 text-lg">
            {language === 'hindi' 
              ? 'आज आपके व्यापार के लिए कुछ अच्छे सुझाव हैं' 
              : 'Here are some great insights for your business today'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRemindersModal(true)}
            className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-neutral-800 to-neutral-900 hover:border-rose-500/50 border border-gray-700 text-white rounded-xl shadow transition-all duration-300"
            title={language === 'hindi' ? 'याददाश्त' : 'Reminders'}
          >
            <Bell size={20} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow transition-colors duration-200"
          >
            <Edit3 size={18} /> 
            {language === 'hindi' ? 'डेटा अपडेट करें' : 'Update Data'}
          </button>
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
        />
        <StatCard
          title={language === 'hindi' ? 'मासिक लाभ' : 'Monthly Profit'}
          value={`₹${monthlyProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend={monthlyProfit > 0 ? "up" : monthlyProfit < 0 ? "down" : null}
          trendValue="25"
        />
        <StatCard
          title={language === 'hindi' ? 'कुल बचत' : 'Total Savings'}
          value={`₹${totalSavings.toLocaleString()}`}
          icon={Wallet}
          trend={totalSavings > 0 ? "up" : null}
          trendValue="8"
        />
        <StatCard
          title={language === 'hindi' ? 'लक्ष्य प्रगति' : 'Goal Progress'}
          value={`${savingsPercentage}%`}
          icon={Target}
          trend={savingsPercentage > 50 ? "up" : null}
          trendValue="15"
        />
      </div>

      {/* Business Health Score */}
      <GlowingCard className="p-6 col-span-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-400" />
              {language === 'hindi' ? 'व्यापार स्वास्थ्य स्कोर' : 'Business Health Score'}
            </h2>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${healthScore >= 80 ? 'text-rose-400' : healthScore >= 60 ? 'text-rose-400' : 'text-rose-400'}`}>{healthScore}/100</p>
            <p className="text-sm text-gray-400">
              {language === 'hindi' ? healthTextHindi : healthText}
            </p>
          </div>
        </div>

        <div className="w-full bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full h-3 mb-6 border border-gray-700">
          <div 
            className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-rose-500 to-orange-500`}
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlowingCard className="p-4">
            <p className="text-sm text-gray-300 mb-1">
              {language === 'hindi' ? 'कुल बिक्री (सभी समय)' : 'Total Sales (All-Time)'}
            </p>
            <p className="text-2xl font-bold text-white">₹{allTimeSales.toLocaleString()}</p>
            </GlowingCard>
            <GlowingCard className="p-4">
            <p className="text-sm text-gray-300 mb-1">
              {language === 'hindi' ? 'कुल खर्च (सभी समय)' : 'Total Expenses (All-Time)'}
            </p>
              <p className="text-2xl font-bold text-white">₹{allTimeExpenses.toLocaleString()}</p>
            </GlowingCard>
            <GlowingCard className="p-4">
            <p className="text-sm text-gray-300 mb-1">
              {language === 'hindi' ? 'शुद्ध लाभ (सभी समय)' : 'Net Profit (All-Time)'}
            </p>
              <p className="text-2xl font-bold text-white">₹{allTimeProfit.toLocaleString()}</p>
            </GlowingCard>
          </div>
        </GlowingCard>

      {/* Two Column Layout for Recent Transactions and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <GlowingCard className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">
              {language === 'hindi' ? 'हाल के लेनदेन' : 'Recent Transactions'}
            </h3>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentTransactions.map((transaction, index) => (
                  <TransactionItem 
                    key={transaction._id || transaction.id || `txn-${index}`} 
                    transaction={transaction} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-600 mb-3" size={40} />
                <p className="text-gray-400">
                  {language === 'hindi' ? 'अभी तक कोई लेनदेन नहीं' : 'No transactions yet'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {language === 'hindi' 
                    ? 'यहाँ देखने के लिए अपना पहला लेनदेन जोड़ें' 
                    : 'Add your first transaction to see it here'}
                </p>
              </div>
            )}
          </div>
        </GlowingCard>

        {/* AI Insights Panel */}
        <div className="space-y-4">
          {/* Achievement Card */}
          <GlowingCard className="p-6 shadow-lg">
            <h3 className="text-lg font-bold text-rose-300 mb-2">
              Achievement Unlocked!
            </h3>
            <p className="text-sm text-rose-200 mb-1">
              {language === 'hindi' 
                ? `आपने अपने लक्ष्य के लिए ₹${totalSavings.toLocaleString()} बचाए हैं!` 
                : `You've saved ₹${totalSavings.toLocaleString()} towards your goal!`
              }
            </p>
            <GlowingCard className="p-3">
              <p className="text-sm text-rose-200">
                {language === 'hindi' 
                  ? `${goalName} के लक्ष्य तक पहुँचने के लिए केवल ₹${(savingsGoal - totalSavings).toLocaleString()} और!` 
                  : `Only ₹${(savingsGoal - totalSavings).toLocaleString()} more to reach your ${goalName} goal!`
                }
              </p>
            </GlowingCard>
          </GlowingCard>

          {/* AI Recommendations */}
          <GlowingCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                  <Sparkles size={20} className="text-rose-400" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {language === 'hindi' ? 'एआई सिफारिशें' : 'AI Recommendations'}
                </h2>
              </div>
              {dashboard?.aiInsights && dashboard.aiInsights.some(i => i.model === 'prophet_ai') && (
                <span className="flex items-center gap-1 px-3 py-1 bg-rose-500/20 rounded-full text-xs font-medium text-rose-300 border border-rose-500/50">
                  <Sparkles size={12} />
                  Prophet AI
                </span>
              )}
            </div>
            <div className="space-y-3">
              {dashboard?.aiInsights && dashboard.aiInsights.length > 0 ? (
                dashboard.aiInsights.map((insight, index) => (
                  <GlowingCard 
                    key={`ai-insight-${index}`} 
                    className="p-4"
                  >
                    <p className={`text-sm font-bold mb-1 text-rose-300`}>{insight.title}</p>
                    <p className="text-sm text-gray-300">{insight.message}</p>
                  </GlowingCard>
                ))
              ) : (
                <>
                  <GlowingCard className="p-3">
                    <p className="text-sm font-medium text-gray-300">
                      {language === 'hindi' ? 'लेनदेन जोड़ें AI insights के लिए' : 'Add transactions to get AI insights'}
                    </p>
                  </GlowingCard>
                </>
              )}
            </div>
          </GlowingCard>
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

      {/* Reminders Modal */}
      {showRemindersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Bell size={24} className="text-rose-400" />
                <h2 className="text-2xl font-bold text-white">
                  {language === 'hindi' ? 'याददाश्त और सुझाव' : 'Reminders & Nudges'}
                </h2>
              </div>
              <button
                onClick={() => setShowRemindersModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Reminders />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;