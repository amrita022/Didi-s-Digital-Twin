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
  Calendar
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';
import { fetchAnalytics } from '../../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

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
    <div className="bg-neutral-700 dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-gray-800">
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
          color="bg-emerald-500"
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
            <ChartContainer
              config={{
                income: { label: 'Income', color: 'var(--color-income)' },
                expenses: { label: 'Expenses', color: 'var(--color-expenses)' },
              }}
            >
              <AreaChart
                accessibilityLayer
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
                  fill="var(--color-expenses)"
                  fillOpacity={0.4}
                  stroke="var(--color-expenses)"
                  stackId="a"
                />
                <Area
                  dataKey="income"
                  type="natural"
                  fill="var(--color-income)"
                  fillOpacity={0.4}
                  stroke="var(--color-income)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
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
              <ChartContainer
                config={{
                  value: { label: 'Amount' },
                  category: { label: 'Category' },
                }}
                className="mx-auto aspect-square max-h-[280px]"
              >
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
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
              </ChartContainer>
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
              <ChartContainer
                config={{
                  profit: { label: 'Profit', color: 'var(--chart-1)' },
                }}
              >
                <BarChart
                  accessibilityLayer
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
                            <p className="text-emerald-400">
                              Profit: ₹{payload[0].value.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="profit" fill="var(--chart-1)" radius={8}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-white"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium text-white">
                {language === 'hindi' ? 'इस महीने 5.2% ऊपर ट्रेंडिंग' : 'Trending up by 5.2% this month'} <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-gray-400 leading-none">
                {language === 'hindi' ? 'पिछले 6 महीनों के लिए कुल लाभ दिखा रहा है' : 'Showing total profit for the last 6 months'}
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">
          {language === 'hindi' ? 'मुख्य अंतर्दृष्टि' : 'Key Insights'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className={`bg-white/10 rounded-lg p-4 ${
              insight.type === 'warning' ? 'border-l-4 border-yellow-400' : 
              insight.type === 'positive' ? 'border-l-4 border-emerald-400' : ''
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
