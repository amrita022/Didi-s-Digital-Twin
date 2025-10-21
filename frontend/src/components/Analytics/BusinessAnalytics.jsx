import React from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const BusinessAnalytics = () => {
  const { businessData, language } = useStore();

  // Sample data for charts
  const incomeExpenseData = [
    { month: 'Jan', income: 2500, expenses: 1700, profit: 800 },
    { month: 'Feb', income: 3200, expenses: 1900, profit: 1300 },
    { month: 'Mar', income: 4100, expenses: 2100, profit: 2000 },
    { month: 'Apr', income: 3800, expenses: 1800, profit: 2000 },
    { month: 'May', income: 4500, expenses: 2200, profit: 2300 },
    { month: 'Jun', income: 5200, expenses: 2400, profit: 2800 },
  ];

  const categorySpendingData = [
    { name: language === 'hindi' ? 'कच्चा माल' : 'Raw Materials', value: 1200, color: '#C85D3A' },
    { name: language === 'hindi' ? 'पैकेजिंग' : 'Packaging', value: 400, color: '#EBAE82' },
    { name: language === 'hindi' ? 'परिवहन' : 'Transport', value: 300, color: '#3B7A6D' },
    { name: language === 'hindi' ? 'अन्य' : 'Others', value: 200, color: '#3A2B4D' },
  ];

  const profitTrendData = [
    { month: 'Jan', profit: 800 },
    { month: 'Feb', profit: 1300 },
    { month: 'Mar', profit: 2000 },
    { month: 'Apr', profit: 2000 },
    { month: 'May', profit: 2300 },
    { month: 'Jun', profit: 2800 },
  ];

  const COLORS = ['#C85D3A', '#EBAE82', '#3B7A6D', '#3A2B4D', '#D9A441'];

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className={`flex items-center space-x-1 ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-[#3A2B4D] mb-1">{value}</h3>
      <p className="text-[#3B7A6D] text-sm">{title}</p>
    </div>
  );

  const handleExport = () => {
    // In a real app, this would generate and download a PDF/Excel file
    alert(language === 'hindi' ? 'रिपोर्ट डाउनलोड हो रही है...' : 'Downloading report...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3A2B4D]">
            {getTranslation('businessAnalytics', language)}
          </h1>
          <p className="text-[#3B7A6D] text-sm">
            {language === 'hindi' 
              ? 'आपके व्यापार का विस्तृत विश्लेषण' 
              : 'Detailed analysis of your business'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-[#3B7A6D] text-white rounded-lg hover:bg-[#2D5F52] transition-colors"
          >
            <Download size={16} />
            <span>{getTranslation('exportReport', language)}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Printer size={16} />
            <span>{getTranslation('printReport', language)}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={language === 'hindi' ? 'कुल आय' : 'Total Income'}
          value="₹32,100"
          change={15}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title={language === 'hindi' ? 'कुल खर्च' : 'Total Expenses'}
          value="₹12,100"
          change={-8}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title={language === 'hindi' ? 'शुद्ध लाभ' : 'Net Profit'}
          value="₹20,000"
          change={25}
          icon={TrendingUp}
          color="bg-[#D9A441]"
        />
        <StatCard
          title={language === 'hindi' ? 'लाभ मार्जिन' : 'Profit Margin'}
          value="62%"
          change={12}
          icon={Calendar}
          color="bg-[#3B7A6D]"
        />
      </div>

      {/* Income vs Expenses Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">
          {getTranslation('incomeVsExpenses', language)}
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#3A2B4D', fontSize: 12 }}
                axisLine={{ stroke: '#3A2B4D' }}
              />
              <YAxis 
                tick={{ fill: '#3A2B4D', fontSize: 12 }}
                axisLine={{ stroke: '#3A2B4D' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                formatter={(value, name) => [`₹${value}`, name === 'income' ? 'Income' : 'Expenses']}
                labelStyle={{ color: '#3A2B4D' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#3B7A6D"
                fill="#3B7A6D"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#C85D3A"
                fill="#C85D3A"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-wise Spending */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">
            {getTranslation('categorySpending', language)}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpendingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySpendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Profit Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">
            {getTranslation('monthlyTrend', language)}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#3A2B4D', fontSize: 12 }}
                  axisLine={{ stroke: '#3A2B4D' }}
                />
                <YAxis 
                  tick={{ fill: '#3A2B4D', fontSize: 12 }}
                  axisLine={{ stroke: '#3A2B4D' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Profit']}
                  labelStyle={{ color: '#3A2B4D' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="profit" 
                  fill="#D9A441"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-[#3A2B4D] to-[#3B7A6D] rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">
          {language === 'hindi' ? 'मुख्य अंतर्दृष्टि' : 'Key Insights'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-2">
              {language === 'hindi' ? 'सकारात्मक प्रवृत्ति' : 'Positive Trend'}
            </h3>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'आपकी आय में 25% की वृद्धि हुई है। यह प्रवृत्ति जारी रखें!' 
                : 'Your income has increased by 25%. Keep up this trend!'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-2">
              {language === 'hindi' ? 'खर्च प्रबंधन' : 'Expense Management'}
            </h3>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'आपके खर्चों में 8% की कमी आई है। बहुत अच्छा!' 
                : 'Your expenses have decreased by 8%. Great job!'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalytics;
