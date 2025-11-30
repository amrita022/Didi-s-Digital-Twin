import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Package,
  RefreshCw,
  IndianRupee,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const DemandPredictions = () => {
  const { user } = useAuth();
  const { language } = useStore();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      fetchPredictions();
    }
  }, [user]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      // Add useProphet=true to use Meta's Prophet AI
      const response = await fetch(`${API_URL}/api/demand-predictions?userId=${user.uid}&useProphet=true`);
      const data = await response.json();
      
      if (data.success) {
        setPredictions(data);
      } else {
        setError(data.error || 'Failed to load predictions');
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'very-high': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getDemandLabel = (demand) => {
    const labels = {
      'very-high': getTranslation('veryHigh', language),
      'high': getTranslation('high', language),
      'medium': getTranslation('medium', language),
      'low': getTranslation('low', language)
    };
    return labels[demand] || demand;
  };

  const getWeatherIcon = (weather) => {
    const icons = {
      'Cold': '❄️',
      'Cool': '🌤️',
      'Warm': '☀️',
      'Hot': '🌞',
      'Very Hot': '🔥',
      'Rainy': '🌧️',
      'Pleasant': '🌸',
      'Monsoon': '☔'
    };
    return icons[weather] || '🌤️';
  };

  const getSeasonIcon = (season) => {
    const icons = {
      'Winter': '❄️',
      'Spring': '🌸',
      'Summer': '☀️',
      'Monsoon': '🌧️',
      'Autumn': '🍂',
      'Festive': '🪔'
    };
    return icons[season] || '📅';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B7A6D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3B7A6D] to-[#3A2B4D] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar size={32} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">Demand Predictions</h1>
                {predictions?.model === 'prophet_real_data' && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/30 rounded-full text-sm font-medium border border-purple-300/50">
                    <Sparkles size={14} />
                    Prophet AI
                  </span>
                )}
              </div>
              <p className="text-white/90">{getTranslation('demandForecast', language)}</p>
            </div>
          </div>
          <button
            onClick={fetchPredictions}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Refresh predictions"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {predictions?.alert && (
        <div className={`rounded-xl p-6 text-white ${
          predictions.alert.type === 'high' 
            ? 'bg-gradient-to-r from-[#C85D3A] to-[#EBAE82]' 
            : 'bg-gradient-to-r from-[#EBAE82] to-[#F5D5A8]'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-bold">This Month Alert</h2>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm">{predictions.alert.message}</p>
          </div>
        </div>
      )}

     

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictions?.predictions?.map((prediction, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border-2 border-purple-200 relative">
            {/* Prophet AI Badge on Card */}
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full text-xs font-medium text-purple-700 border border-purple-300">
                <Sparkles size={12} />
                AI
              </span>
            </div>
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getSeasonIcon(prediction.season)}</span>
                <div>
                  <h3 className="text-xl font-bold text-[#3A2B4D]">{prediction.month} {prediction.year}</h3>
                  <p className="text-sm text-gray-600">{prediction.season} • {getWeatherIcon(prediction.weather)} {prediction.weather}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getDemandColor(prediction.demand)}`}>
                <TrendingUp size={14} />
                <span>{getDemandLabel(prediction.demand)}</span>
              </div>
            </div>

            {/* Festival Badge */}
            {prediction.festival && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                  <Sparkles size={14} className="mr-1" />
                  {prediction.festival}
                </span>
              </div>
            )}

            {/* Revenue Prediction */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">AI Predicted Revenue</span>
                <span className="text-xs text-green-600 font-medium">{prediction.confidence} confidence</span>
              </div>
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <IndianRupee size={24} className="text-green-600" />
                  <span className="text-3xl font-bold text-green-700">
                    {prediction.predictedRevenue?.toLocaleString('en-IN') || 
                     Math.round((prediction.expectedRevenue.min + prediction.expectedRevenue.max) / 2).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Range: ₹{prediction.expectedRevenue.min.toLocaleString('en-IN')} - ₹{prediction.expectedRevenue.max.toLocaleString('en-IN')}
                </div>
              </div>
              <p className="text-xs text-gray-600 bg-white/50 rounded p-2">{prediction.reasoning}</p>
            </div>

            {/* Stock Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[#3A2B4D]">
                <Package size={18} />
                <h4 className="font-bold">Restock & Profit Analysis</h4>
              </div>
              {prediction.stockRecommendations?.map((stock, idx) => (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-[#3B7A6D] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-gray-900">{stock.item}</span>
                    <span className="px-2 py-1 bg-[#3B7A6D] text-white rounded-full text-xs font-bold">
                      Stock {stock.recommendedStock} pcs
                    </span>
                  </div>
                  
                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                      <div className="text-xs text-blue-600 font-medium mb-1">💰 Investment</div>
                      <div className="text-sm font-bold text-blue-700">₹{stock.investmentNeeded?.toLocaleString('en-IN') || (stock.recommendedStock * stock.avgPrice * 0.65).toFixed(0)}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                      <div className="text-xs text-green-600 font-medium mb-1">📈 Profit</div>
                      <div className="text-sm font-bold text-green-700">₹{stock.expectedProfit?.toLocaleString('en-IN') || (stock.expectedRevenue * 0.35).toFixed(0)}</div>
                    </div>
                  </div>
                  
                  {/* Revenue & Margin */}
                  <div className="flex items-center justify-between text-xs bg-gradient-to-r from-emerald-50 to-green-50 rounded p-2 border border-green-200">
                    <div>
                      <span className="text-gray-600">Revenue: </span>
                      <span className="font-bold text-green-700">₹{stock.expectedRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Margin: </span>
                      <span className="font-bold text-green-600">{stock.profitMargin || '35%'}</span>
                    </div>
                  </div>
                  
                  {/* Avg Price Info */}
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Avg selling price: ₹{stock.avgPrice.toLocaleString('en-IN')}/piece
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Seasonal Calendar - Reference Guide */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#3A2B4D]">Seasonal Reference Guide</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">General patterns only</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { month: 'Jan', season: 'Winter', weather: 'Cold', demand: 'low', icon: '❄️' },
            { month: 'Feb', season: 'Winter', weather: 'Cool', demand: 'low', icon: '🌤️' },
            { month: 'Mar', season: 'Spring', weather: 'Warm', demand: 'high', icon: '☀️' },
            { month: 'Apr', season: 'Summer', weather: 'Hot', demand: 'very-high', icon: '🌞' },
            { month: 'May', season: 'Summer', weather: 'Very Hot', demand: 'very-high', icon: '🔥' },
            { month: 'Jun', season: 'Monsoon', weather: 'Monsoon', demand: 'high', icon: '🌧️' },
            { month: 'Jul', season: 'Monsoon', weather: 'Rainy', demand: 'medium', icon: '☔' },
            { month: 'Aug', season: 'Monsoon', weather: 'Rainy', demand: 'low', icon: '🌧️' },
            { month: 'Sep', season: 'Autumn', weather: 'Pleasant', demand: 'medium', icon: '🍂' },
            { month: 'Oct', season: 'Autumn', weather: 'Pleasant', demand: 'high', icon: '🪔' },
            { month: 'Nov', season: 'Festive', weather: 'Cool', demand: 'very-high', icon: '🪔' },
            { month: 'Dec', season: 'Winter', weather: 'Cold', demand: 'very-high', icon: '💍' },
          ].map((month, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{month.icon}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDemandColor(month.demand)}`}>
                  {getDemandLabel(month.demand)}
                </span>
              </div>
              <h3 className="font-bold text-[#3A2B4D]">{month.month}</h3>
              <p className="text-xs text-gray-600">{month.weather}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">Market Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-[#3A2B4D] mb-2">
              {predictions?.marketInsights?.weddingSeason?.title || 'Wedding Season'}
            </h3>
            <p className="text-sm text-gray-600">
              {predictions?.marketInsights?.weddingSeason?.description || 'Dec & Apr-May see highest demand for लहंगा and साड़ी'}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} className="text-orange-600" />
            </div>
            <h3 className="font-bold text-[#3A2B4D] mb-2">
              {predictions?.marketInsights?.festive?.title || 'Festive Period'}
            </h3>
            <p className="text-sm text-gray-600">
              {predictions?.marketInsights?.festive?.description || 'Diwali (Nov) boosts sales by 120% compared to regular months'}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-[#3A2B4D] mb-2">
              {predictions?.marketInsights?.stockPlanning?.title || 'Stock Planning'}
            </h3>
            <p className="text-sm text-gray-600">
              {predictions?.marketInsights?.stockPlanning?.description || 'Order inventory 1 month before peak seasons for best pricing'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandPredictions;
