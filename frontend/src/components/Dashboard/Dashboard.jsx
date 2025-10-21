import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const Dashboard = () => {
  const { businessData, language } = useStore();
  const { totalSales, monthlyProfit, expenses, savings, savingsGoal, healthScore, recentTransactions } = businessData;

  const savingsPercentage = Math.round((savings / savingsGoal) * 100);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
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
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          transaction.type === 'sale' 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          {transaction.type === 'sale' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
        <div>
          <p className="font-medium text-[#3A2B4D]">{transaction.description}</p>
          <p className="text-sm text-gray-500">{transaction.date}</p>
        </div>
      </div>
      <div className={`font-bold ${
        transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === 'sale' ? '+' : '-'}₹{transaction.amount}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">👩‍🍳</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getTranslation('welcome', language)}, {useStore.getState().userName}! 🌸
            </h1>
            <p className="text-gray-600">
              {language === 'hindi' 
                ? 'आज आपके व्यापार के लिए कुछ अच्छे सुझाव हैं' 
                : 'Here are some great insights for your business today'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Business Health Score */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {getTranslation('businessHealth', language)}
          </h2>
          <div className="flex items-center space-x-2">
            <Sparkles size={20} className="text-blue-500" />
            <span className="text-2xl font-bold text-blue-600">{healthScore}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {language === 'hindi' 
            ? 'आपका व्यापार अच्छी तरह चल रहा है!' 
            : 'Your business is doing great!'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={getTranslation('totalSales', language)}
          value={`₹${totalSales.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="12"
          color="bg-blue-500"
          bgColor="bg-white"
        />
        <StatCard
          title={getTranslation('monthlyProfit', language)}
          value={`₹${monthlyProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
          trendValue="8"
          color="bg-green-500"
          bgColor="bg-white"
        />
        <StatCard
          title={getTranslation('expenses', language)}
          value={`₹${expenses.toLocaleString()}`}
          icon={TrendingDown}
          trend="down"
          trendValue="5"
          color="bg-red-500"
          bgColor="bg-white"
        />
        <StatCard
          title={getTranslation('savings', language)}
          value={`₹${savings.toLocaleString()}`}
          icon={PiggyBank}
          trend="up"
          trendValue="15"
          color="bg-purple-500"
          bgColor="bg-white"
        />
      </div>

      {/* Savings Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {getTranslation('savingsProgress', language)}
          </h2>
          <span className="text-sm text-gray-600">{savingsPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${savingsPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>₹{savings.toLocaleString()}</span>
          <span>₹{savingsGoal.toLocaleString()}</span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {getTranslation('recentTransactions', language)}
        </h2>
        <div className="space-y-2">
          {recentTransactions.slice(0, 5).map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{getTranslation('aiInsights', language)}</h2>
        </div>
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {language === 'hindi' 
                ? 'आपके आचार की कीमत ₹120 प्रति जार रखने से आपकी कमाई 50% बढ़ सकती है' 
                : 'Pricing your pickles at ₹120 per jar could increase your earnings by 50%'
              }
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {language === 'hindi' 
                ? 'गर्मियों में आचार की मांग बढ़ेगी - अभी से तैयारी शुरू करें' 
                : 'Pickle demand will increase in summer - start preparing now'
              }
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {language === 'hindi' 
                ? 'प्रतिदिन ₹100 बचाने से 6 महीने में नई सिलाई मशीन खरीद सकती हैं' 
                : 'Saving ₹100 daily will help you buy a new sewing machine in 6 months'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
