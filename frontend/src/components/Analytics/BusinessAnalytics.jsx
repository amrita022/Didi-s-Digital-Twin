import React, { useState, useEffect } from 'react';
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
import { fetchAnalytics } from '../../utils/api';

const BusinessAnalytics = () => {
  const { businessData, language, userId } = useStore();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data on component mount
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!userId) {
        console.log('⏳ Waiting for userId...', { userId });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📊 Fetching analytics for user:', userId);
        const data = await fetchAnalytics(userId);
        
        console.log('📊 Analytics response:', data);
        
        if (data.success) {
          console.log('✅ Analytics loaded successfully');
          setAnalyticsData(data);
        } else {
          console.error('❌ Analytics error:', data.error);
          setAnalyticsData(data); // Set it anyway to show empty state
        }
      } catch (error) {
        console.error('❌ Failed to load analytics:', error);
        // Set empty data to stop loading
        setAnalyticsData({
          success: false,
          last6MonthsData: [],
          keyMetrics: {
            totalIncome: 0,
            incomeChange: 0,
            totalExpenses: 0,
            expensesChange: 0,
            netProfit: 0,
            profitChange: 0,
            profitMargin: 0,
            marginChange: 0
          },
          categorySpending: [],
          monthlyProfitTrend: [],
          insights: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [userId]);

  // Use real data if available, otherwise show loading
  const incomeExpenseData = analyticsData?.last6MonthsData || [];
  const categorySpendingData = analyticsData?.categorySpending || [];
  const profitTrendData = analyticsData?.monthlyProfitTrend || [];
  const keyMetrics = analyticsData?.keyMetrics || {
    totalIncome: 0,
    incomeChange: 0,
    totalExpenses: 0,
    expensesChange: 0,
    netProfit: 0,
    profitChange: 0,
    profitMargin: 0,
    marginChange: 0
  };
  const insights = analyticsData?.insights || [];

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

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C85D3A] mx-auto"></div>
          <p className="mt-4 text-[#3B7A6D]">
            {language === 'hindi' ? 'विश्लेषण लोड हो रहा है...' : 'Loading analytics...'}
          </p>
        </div>
      </div>
    );
  }

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
          value={`₹${keyMetrics.totalIncome.toLocaleString()}`}
          change={keyMetrics.incomeChange}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title={language === 'hindi' ? 'कुल खर्च' : 'Total Expenses'}
          value={`₹${keyMetrics.totalExpenses.toLocaleString()}`}
          change={keyMetrics.expensesChange}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title={language === 'hindi' ? 'शुद्ध लाभ' : 'Net Profit'}
          value={`₹${keyMetrics.netProfit.toLocaleString()}`}
          change={keyMetrics.profitChange}
          icon={TrendingUp}
          color="bg-[#D9A441]"
        />
        <StatCard
          title={language === 'hindi' ? 'लाभ मार्जिन' : 'Profit Margin'}
          value={`${keyMetrics.profitMargin}%`}
          change={keyMetrics.marginChange}
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
          {insights.map((insight, index) => (
            <div key={index} className={`bg-white/10 rounded-lg p-4 ${
              insight.type === 'warning' ? 'border-l-4 border-yellow-400' : 
              insight.type === 'positive' ? 'border-l-4 border-green-400' : ''
            }`}>
              <h3 className="font-bold mb-2">
                {language === 'hindi' ? insight.title.hi : insight.title.en}
              </h3>
              <p className="text-sm">
                {language === 'hindi' ? insight.message.hi : insight.message.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalytics;
