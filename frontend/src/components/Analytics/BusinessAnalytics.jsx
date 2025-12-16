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
  Bar,
  LabelList
} from 'recharts';
import { 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Lightbulb  
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';
import { fetchAnalytics } from '../../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';

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
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('❌ Failed to load analytics:', error);
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

  // Different shades of rose/pink that match the dashboard theme
  const ROSE_COLORS = ['#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337'];

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-rose-500/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className={`flex items-center space-x-1 ${
          change >= 0 ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );

  const handleExport = () => {
    alert(language === 'hindi' ? 'रिपोर्ट डाउनलोड हो रही है...' : 'Downloading report...');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">
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
          <h1 className="text-2xl font-bold text-white">
            {getTranslation('businessAnalytics', language)}
          </h1>
          <p className="text-gray-400 text-sm">
            {language === 'hindi' 
              ? 'आपके व्यापार का विस्तृत विश्लेषण' 
              : 'Detailed analysis of your business'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
          >
            <Download size={16} />
            <span>{getTranslation('exportReport', language)}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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
          color="bg-rose-500"
        />
        <StatCard
          title={language === 'hindi' ? 'कुल खर्च' : 'Total Expenses'}
          value={`₹${keyMetrics.totalExpenses.toLocaleString()}`}
          change={keyMetrics.expensesChange}
          icon={TrendingDown}
          color="bg-rose-500"
        />
        <StatCard
          title={language === 'hindi' ? 'शुद्ध लाभ' : 'Net Profit'}
          value={`₹${keyMetrics.netProfit.toLocaleString()}`}
          change={keyMetrics.profitChange}
          icon={TrendingUp}
          color="bg-rose-500"
        />
        <StatCard
          title={language === 'hindi' ? 'लाभ मार्जिन' : 'Profit Margin'}
          value={`${keyMetrics.profitMargin}%`}
          change={keyMetrics.marginChange}
          icon={Calendar}
          color="bg-rose-500"
        />
      </div>

      {/* Income vs Expenses Chart */}
      {incomeExpenseData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('incomeVsExpenses', language)}</CardTitle>
            <CardDescription>
              {language === 'hindi' ? 'पिछले 6 महीनों के लिए कुल आय और खर्च' : 'Showing total income and expenses for the last 6 months'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={incomeExpenseData}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              >
                <CartesianGrid vertical={false} stroke="#404040" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white shadow-lg text-sm">
                          <p className="font-medium">{payload[0].payload.month}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>
                              {entry.name}: ₹{entry.value.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  dataKey="expenses"
                  type="natural"
                  fill="#ef4444"
                  fillOpacity={0.4}
                  stroke="#ef4444"
                  stackId="a"
                />
                <Area
                  dataKey="income"
                  type="natural"
                  fill="#fb7185"
                  fillOpacity={0.5}
                  stroke="#fb7185"
                  strokeWidth={2}
                  stackId="a"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium text-white">
              {language === 'hindi' ? 'इस महीने 5.2% ऊपर ट्रेंडिंग' : 'Trending up by 5.2% this month'} <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-gray-400 leading-none">
              {language === 'hindi' ? 'पिछले 6 महीनों के लिए कुल आय और खर्च दिखा रहा है' : 'Showing total income and expenses for the last 6 months'}
            </div>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-wise Spending */}
        {categorySpendingData.length > 0 && (
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>{getTranslation('categorySpending', language)}</CardTitle>
              <CardDescription>
                {language === 'hindi' ? 'जनवरी - जून 2024' : 'January - June 2024'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white shadow-lg text-sm">
                            <p className="font-medium">{payload[0].payload.name}</p>
                            <p>₹{payload[0].value.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ROSE_COLORS[index % ROSE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium text-white">
                {language === 'hindi' ? 'इस महीने 5.2% ऊपर ट्रेंडिंग' : 'Trending up by 5.2% this month'} <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-gray-400 leading-none">
                {language === 'hindi' ? 'पिछले 6 महीनों के लिए कुल खर्च दिखा रहा है' : 'Showing total spending for the last 6 months'}
              </div>
            </CardFooter>
          </Card>
        )}

        {/* Monthly Profit Trend */}
        {profitTrendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation('monthlyTrend', language)}</CardTitle>
              <CardDescription>
                {language === 'hindi' ? 'जनवरी - जून 2024' : 'January - June 2024'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={profitTrendData}
                  margin={{ top: 20, left: 12, right: 12, bottom: 12 }}
                >
                  <CartesianGrid vertical={false} stroke="#404040" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fill: '#d1d5db', fontSize: 12 }}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white shadow-lg text-sm">
                            <p className="font-medium">{payload[0].payload.month}</p>
                            <p className="text-[#fb7185]">
                              Profit: ₹{payload[0].value.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="profit" fill="#fb7185" radius={8}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-white"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium text-white">
                {language === 'hindi' ? 'इस महीने 5.2% ऊपर ट्रेंडिंग' : 'Trending up by 5.2% this month'} <TrendingUp className="h-4 w-4 text-[#fb7185]" />
              </div>
              <div className="text-gray-400 leading-none">
                {language === 'hindi' ? 'पिछले 6 महीनों के लिए कुल लाभ दिखा रहा है' : 'Showing total profit for the last 6 months'}
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-rose-500" />
              {language === 'hindi' ? 'मुख्य अंतर्दृष्टि' : 'Key Insights'}
            </CardTitle>
            <CardDescription>
              {language === 'hindi' 
                ? 'आपके व्यापार के लिए AI-संचालित सिफारिशें' 
                : 'AI-powered recommendations for your business'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="group p-4 bg-gray-900/30 rounded-lg border border-gray-800 hover:border-rose-500/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg ${
                      insight.type === 'warning' 
                        ? 'bg-yellow-500/10 border border-yellow-500/20' 
                        : insight.type === 'positive' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'bg-rose-500/10 border border-rose-500/20'
                    }`}>
                      {insight.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      ) : insight.type === 'positive' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Lightbulb className="h-4 w-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {language === 'hindi' ? insight.title.hi : insight.title.en}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {language === 'hindi' ? insight.message.hi : insight.message.en}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessAnalytics;