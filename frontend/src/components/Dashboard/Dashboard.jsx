import React from 'react';
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
  AlertCircle
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const Dashboard = () => {
  const { businessData, language, userName } = useStore();
  const { totalSales, monthlyProfit, expenses, savings, savingsGoal, healthScore, recentTransactions } = businessData;

  const savingsPercentage = Math.round((savings / savingsGoal) * 100);

  // Business Health variables
  const healthColor = healthScore >= 80 ? "text-green-600" : healthScore >= 60 ? "text-yellow-600" : "text-red-600";
  const healthText = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Attention";
  const healthTextHindi = healthScore >= 80 ? "उत्कृष्ट" : healthScore >= 60 ? "अच्छा" : "ध्यान चाहिए";

  // Sample transactions data matching the reference structure
  const transactions = [
    {
      id: "1",
      type: "income",
      description: "Pickle Sale - Mrs. Sharma",
      descriptionHindi: "अचार बिक्री - श्रीमती शर्मा",
      amount: 450,
      date: "Today, 2:30 PM",
      category: "Sales"
    },
    {
      id: "2",
      type: "expense",
      description: "Raw Materials - Spices",
      descriptionHindi: "कच्चा माल - मसाले",
      amount: 280,
      date: "Today, 11:00 AM",
      category: "Materials"
    },
    {
      id: "3",
      type: "income",
      description: "Bulk Order - 20 Jars",
      descriptionHindi: "थोक ऑर्डर - 20 जार",
      amount: 2800,
      date: "Yesterday, 4:15 PM",
      category: "Sales"
    },
    {
      id: "4",
      type: "expense",
      description: "Packaging Supplies",
      descriptionHindi: "पैकेजिंग सामग्री",
      amount: 180,
      date: "Yesterday, 10:30 AM",
      category: "Materials"
    },
    {
      id: "5",
      type: "income",
      description: "Market Sale",
      descriptionHindi: "बाजार बिक्री",
      amount: 650,
      date: "2 days ago",
      category: "Sales"
    }
  ];

  // Fixed StatCard component
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

  // Updated TransactionItem component to match reference structure
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
              {language === 'hindi' ? transaction.descriptionHindi : transaction.description}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'hindi' ? transaction.description : transaction.descriptionHindi}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {transaction.category}
              </span>
              <span className="text-xs text-gray-500">{transaction.date}</span>
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
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">👩‍🍳</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getTranslation('welcome', language)}, {userName}! 🌸
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

      {/* Stats Grid - Updated with reference features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={language === 'hindi' ? 'आज की आय' : "Today's Income"}
          value="₹1,230"
          icon={IndianRupee}
          trend="up"
          trendValue="12"
          color="bg-blue-500"
          bgColor="bg-white"
        />
        <StatCard
          title={language === 'hindi' ? 'मासिक लाभ' : 'Monthly Profit'}
          value="₹8,450"
          icon={TrendingUp}
          trend="up"
          trendValue="25"
          color="bg-green-500"
          bgColor="bg-white"
        />
        <StatCard
          title={language === 'hindi' ? 'कुल बचत' : 'Total Savings'}
          value="₹12,600"
          icon={Wallet}
          trend="up"
          trendValue="8"
          color="bg-purple-500"
          bgColor="bg-white"
        />
        <StatCard
          title={language === 'hindi' ? 'लक्ष्य प्रगति' : 'Goal Progress'}
          value="63%"
          icon={Target}
          trend="up"
          trendValue="15"
          color="bg-orange-500"
          bgColor="bg-white"
        />
      </div>

      {/* Business Health Score - Updated to match reference */}
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
              {language === 'hindi' ? 'कुल बिक्री' : 'Total Sales'}
            </p>
            <p className="text-2xl font-bold text-green-600">₹15,280</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'hindi' ? 'कुल खर्च' : 'Total Expenses'}
            </p>
            <p className="text-2xl font-bold text-red-600">₹6,830</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'hindi' ? 'शुद्ध लाभ' : 'Net Profit'}
            </p>
            <p className="text-2xl font-bold text-blue-600">₹8,450</p>
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
        {/* Recent Transactions - Updated to match reference */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {language === 'hindi' ? 'हाल के लेनदेन' : 'Recent Transactions'}
            </h3>
          </div>

          <div className="h-[400px] pr-4 overflow-y-auto">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="space-y-4">
          {/* Achievement Card - Very Light Pink */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 shadow-sm">
            <h3 className="text-lg font-bold text-pink-800 mb-2">🎉 {language === 'hindi' ? 'उपलब्धि अनलॉक!' : 'Achievement Unlocked!'}</h3>
            <p className="text-sm text-pink-700 mb-1">
              {language === 'hindi' 
                ? 'आपने अपने लक्ष्य के लिए ₹12,600 बचाए हैं!' 
                : "You've saved ₹12,600 towards your goal!"
              }
            </p>
            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-pink-300">
              <p className="text-sm text-pink-800">
                {language === 'hindi' 
                  ? 'अपनी सिलाई मशीन के लक्ष्य तक पहुँचने के लिए केवल ₹7,400 और! 🪡' 
                  : 'Only ₹7,400 more to reach your sewing machine goal! 🪡'
                }
              </p>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Sparkles size={20} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'hindi' ? 'एआई सिफारिशें' : 'AI Recommendations'}
              </h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-gray-900">
                  🌶️ {language === 'hindi' ? 'आचार की कीमत ₹20 बढ़ाएँ' : 'Increase pickle prices by ₹20'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {language === 'hindi' 
                    ? 'मार्केट विश्लेषण दिखाता है कि प्रीमियम आचार की मांग अधिक है' 
                    : 'Market analysis shows demand is high for premium pickles'
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-gray-900">
                  📦 {language === 'hindi' ? 'गर्मी के लिए आम का स्टॉक बढ़ाएँ' : 'Stock up on mango for summer'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {language === 'hindi' 
                    ? 'अगले महीने मांग में 40% वृद्धि का अनुमान' 
                    : 'Predicted 40% increase in demand next month'
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-gray-900">
                  💰 {language === 'hindi' ? 'आप इस सप्ताह ₹150 और बचा सकती हैं' : 'You can save ₹150 more this week'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {language === 'hindi' 
                    ? 'पैकेजिंग लागत 10% कम करके' 
                    : 'By reducing packaging costs by 10%'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;