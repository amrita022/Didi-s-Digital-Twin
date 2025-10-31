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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const DemandPredictions = () => {
  const { user } = useAuth();
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
      const response = await fetch(`${API_URL}/api/demand-predictions?userId=${user.uid}`);
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
    switch (demand) {
      case 'very-high': return 'बहुत अधिक';
      case 'high': return 'अधिक';
      case 'medium': return 'मध्यम';
      case 'low': return 'कम';
      default: return demand;
    }
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
              <h1 className="text-2xl font-bold">Demand Predictions</h1>
              <p className="text-white/90">मौसम और त्योहारों के आधार पर मांग का पूर्वानुमान</p>
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
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
                <span className="text-sm text-gray-600">Expected Revenue</span>
                <span className="text-xs text-green-600 font-medium">{prediction.confidence} confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <IndianRupee size={20} className="text-green-600" />
                <span className="text-2xl font-bold text-green-700">
                  {prediction.expectedRevenue.min.toLocaleString('en-IN')} - {prediction.expectedRevenue.max.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">{prediction.reasoning}</p>
            </div>

            {/* Stock Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[#3A2B4D]">
                <Package size={18} />
                <h4 className="font-bold">Stock Recommendations</h4>
              </div>
              {prediction.stockRecommendations?.map((stock, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{stock.item}</span>
                    <span className="text-sm font-bold text-[#3B7A6D]">
                      Stock {stock.recommendedStock} pieces
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Avg Price: ₹{stock.avgPrice.toLocaleString('en-IN')}</span>
                    <span>Expected: ₹{stock.expectedRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Seasonal Calendar - All 12 Months */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">Seasonal Calendar (Full Year)</h2>
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
            <h3 className="font-bold text-[#3A2B4D] mb-2">Wedding Season</h3>
            <p className="text-sm text-gray-600">
              Dec & Apr-May see highest demand for लहंगा and साड़ी
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} className="text-orange-600" />
            </div>
            <h3 className="font-bold text-[#3A2B4D] mb-2">Festive Period</h3>
            <p className="text-sm text-gray-600">
              Diwali (Nov) boosts sales by 120% compared to regular months
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-[#3A2B4D] mb-2">Stock Planning</h3>
            <p className="text-sm text-gray-600">
              Order inventory 1 month before peak seasons for best pricing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandPredictions;
