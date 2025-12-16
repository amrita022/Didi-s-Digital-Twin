import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Package,
  IndianRupee,
  Sparkles,
  Cloud,
  Cloudy,
  CloudRain,
  Sun,
  Snowflake
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';
import { GlowingCard } from '../ui/glowing-card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Helper function to map festival names to translation keys
const getFestivalKey = (festival) => {
  const festivalMap = {
    'New Year': 'newYear',
    "Valentine's Day": 'valentinesDay',
    'Holi': 'holi',
    'Wedding Season': 'weddingSeason',
    'Navratri/Dussehra': 'navratriDussehra',
    'Diwali': 'diwali'
  };
  return festivalMap[festival] || festival;
};

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
  }, [user, language]);
  const fetchPredictions = async () => {
    try {
      setLoading(true);
      // Add useProphet=true to use Meta's Prophet AI and pass language parameter
      const response = await fetch(`${API_URL}/api/demand-predictions?userId=${user.uid}&useProphet=true&language=${language}`);
      const data = await response.json();
      
      if (data.success) {
        setPredictions(data);
      } else {
        setError(data.error || getTranslation('failedLoadPredictions', language));
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(getTranslation('failedLoadPredictions', language));
    } finally {
      setLoading(false);
    }
  };
  const getDemandColor = (demand) => {
    switch (demand) {
      case 'very-high': return 'text-rose-400 bg-rose-900/30 border-rose-500/50';
      case 'high': return 'text-rose-300 bg-rose-900/20 border-rose-500/40';
      case 'medium': return 'text-rose-200 bg-rose-900/10 border-rose-500/30';
      case 'low': return 'text-gray-400 bg-gray-800/30 border-gray-700';
      default: return 'text-gray-400 bg-gray-800/30 border-gray-600';
    }
  };

  const getDemandLabel = (demand, lang) => {
    switch (demand) {
      case 'very-high': return getTranslation('veryHigh', lang);
      case 'high': return getTranslation('high', lang);
      case 'medium': return getTranslation('medium', lang);
      case 'low': return getTranslation('low', lang);
      default: return demand;
    }
  };

  const getWeatherIcon = (weather) => {
    const icons = {
      'Cold': Snowflake,
      'Cool': Cloud,
      'Warm': Sun,
      'Hot': Sun,
      'Very Hot': Sun,
      'Rainy': CloudRain,
      'Pleasant': Cloudy,
      'Monsoon': CloudRain
    };
    return icons[weather] || Cloudy;
  };

  // Rose-only palette mapping for month card parts
  const getRosePalette = (demand) => {
    switch (demand) {
      case 'very-high':
        return {
          icon: 'text-[#881337]', // deep rose
          title: 'text-[#9f1239]',
          detail: 'text-[#be123c]'
        };
      case 'high':
        return {
          icon: 'text-[#9f1239]',
          title: 'text-[#be123c]',
          detail: 'text-[#e11d48]'
        };
      case 'medium':
        return {
          icon: 'text-[#be123c]',
          title: 'text-[#e11d48]',
          detail: 'text-[#f43f5e]'
        };
      case 'low':
      default:
        return {
          icon: 'text-[#e11d48]',
          title: 'text-[#f43f5e]',
          detail: 'text-[#fb7185]'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-500">{getTranslation('loadingPredictions', language)}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-800/70 pb-4 mb-6">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <Calendar size={28} strokeWidth={1.75} className="text-rose-500/90 relative top-[1px]" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">{getTranslation('demandPredictionsTitle', language)}</h1>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {predictions?.alert && (
        <GlowingCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle size={24} className="text-rose-400" />
            <h2 className="text-xl font-bold text-white">{getTranslation('thisMonthAlert', language)}</h2>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-300">{predictions.alert.message}</p>
          </div>
        </GlowingCard>
      )}
      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictions?.predictions?.map((prediction, index) => {
          const WeatherIcon = getWeatherIcon(prediction.weather);
          return (
            <GlowingCard key={index} className="p-6 relative">
              {/* Prophet AI Badge on Card */}
              {/* Removed AI tag on month card */}
              
              {/* Month Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Calendar size={32} className="text-gray-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">{prediction.month} {prediction.year}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{getTranslation(prediction.season.toLowerCase(), language) || prediction.season}</span>
                      <span>•</span>
                      <WeatherIcon size={14} />
                      <span>{getTranslation(prediction.weather.toLowerCase(), language) || prediction.weather}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getDemandColor(prediction.demand)}`}>
                  <TrendingUp size={14} />
                  <span>{getDemandLabel(prediction.demand, language)}</span>
                </div>
              </div>
              
              {/* Festival Badge */}
              {prediction.festival && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <Sparkles size={14} className="mr-1" />
                    {getTranslation(getFestivalKey(prediction.festival), language)}
                  </span>
                </div>
              )}
              
              {/* Revenue Prediction */}
              <div className="bg-rose-900/20 rounded-lg p-4 mb-4 border border-rose-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">{getTranslation('aiPredictedRevenue', language)}</span>
                  <span className="text-xs text-rose-300 font-medium">{getTranslation(prediction.confidence, language)} {getTranslation('confidence', language)}</span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <IndianRupee size={24} className="text-rose-300" />
                    <span className="text-3xl font-bold text-rose-300">
                      {prediction.predictedRevenue?.toLocaleString('en-IN') || 
                       Math.round((prediction.expectedRevenue.min + prediction.expectedRevenue.max) / 2).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {getTranslation('range', language)}: ₹{prediction.expectedRevenue.min.toLocaleString('en-IN')} - ₹{prediction.expectedRevenue.max.toLocaleString('en-IN')}
                  </div>
                </div>
                <p className="text-xs text-gray-400 bg-gray-800/50 rounded p-2">{prediction.reasoning}</p>
              </div>
              
              {/* Stock Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white">
                  <Package size={18} />
                  <h4 className="font-bold">{getTranslation('restockProfitAnalysis', language)}</h4>
                </div>
                {prediction.stockRecommendations?.map((stock, idx) => {
                  // Translate product name if it's in Hindi
                  const productName = getTranslation(stock.item, language) || stock.item;
                  return (
                  <GlowingCard key={idx} className="p-4 opacity-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg text-white">{productName}</span>
                      <span className="px-2 py-1 bg-rose-500 text-white rounded-full text-xs font-bold">
                        {getTranslation('stock', language)} {stock.recommendedStock} {getTranslation('pcs', language)}
                      </span>
                    </div>
                    
                    {/* Financial Breakdown */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-rose-900/20 rounded-lg p-2 border border-rose-500/30">
                        <div className="flex items-center space-x-1 text-xs text-rose-300 font-medium mb-1">
                          <IndianRupee size={12} />
                          <span>{getTranslation('investment', language)}</span>
                        </div>
                        <div className="text-sm font-bold text-rose-300">₹{stock.investmentNeeded?.toLocaleString('en-IN') || (stock.recommendedStock * stock.avgPrice * 0.65).toFixed(0)}</div>
                      </div>
                      <div className="bg-rose-900/30 rounded-lg p-2 border border-rose-500/30">
                        <div className="flex items-center space-x-1 text-xs text-rose-300 font-medium mb-1">
                          <TrendingUp size={12} />
                          <span>{getTranslation('profit', language)}</span>
                        </div>
                        <div className="text-sm font-bold text-rose-300">₹{stock.expectedProfit?.toLocaleString('en-IN') || (stock.expectedRevenue * 0.35).toFixed(0)}</div>
                      </div>
                    </div>
                    
                    {/* Revenue & Margin */}
                    <div className="flex items-center justify-between text-xs bg-rose-900/20 rounded p-2 border border-rose-500/30">
                      <div>
                        <span className="text-gray-400">{getTranslation('revenue', language)}: </span>
                        <span className="font-bold text-rose-300">₹{stock.expectedRevenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">{getTranslation('margin', language)}: </span>
                        <span className="font-bold text-rose-300">{stock.profitMargin || '35%'}</span>
                      </div>
                    </div>
                    
                    {/* Avg Price Info */}
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {getTranslation('avgSellingPrice', language)}: ₹{stock.avgPrice.toLocaleString('en-IN')}/{getTranslation('perMonth', language)}
                    </div>
                  </GlowingCard>
                  );
                })}
              </div>
            </GlowingCard>
          );
        })}
      </div>
      {/* Seasonal Calendar - Reference Guide */}
      <GlowingCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{getTranslation('seasonalRefGuide', language)}</h2>
          <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">{getTranslation('generalPatternsOnly', language)}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { month: getTranslation('monthJan', language), season: 'winter', weather: 'cold', demand: 'low', icon: Snowflake },
            { month: getTranslation('monthFeb', language), season: 'winter', weather: 'cool', demand: 'low', icon: Cloud },
            { month: getTranslation('monthMar', language), season: 'spring', weather: 'warm', demand: 'high', icon: Sun },
            { month: getTranslation('monthApr', language), season: 'summer', weather: 'hot', demand: 'very-high', icon: Sun },
            { month: getTranslation('monthMay', language), season: 'summer', weather: 'veryHot', demand: 'very-high', icon: Sun },
            { month: getTranslation('monthJun', language), season: 'monsoon', weather: 'monsoon', demand: 'high', icon: CloudRain },
            { month: getTranslation('monthJul', language), season: 'monsoon', weather: 'rainy', demand: 'medium', icon: CloudRain },
            { month: getTranslation('monthAug', language), season: 'monsoon', weather: 'rainy', demand: 'low', icon: CloudRain },
            { month: getTranslation('monthSep', language), season: 'autumn', weather: 'pleasant', demand: 'medium', icon: Cloudy },
            { month: getTranslation('monthOct', language), season: 'autumn', weather: 'pleasant', demand: 'high', icon: Sparkles },
            { month: getTranslation('monthNov', language), season: 'festive', weather: 'cool', demand: 'very-high', icon: Sparkles },
            { month: getTranslation('monthDec', language), season: 'winter', weather: 'cold', demand: 'very-high', icon: Sparkles },
          ].map((month, idx) => {
            const MonthIcon = month.icon;
            return (
              <div key={idx} className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-gray-700 hover:border-rose-500/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <MonthIcon size={20} className="text-white" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDemandColor(month.demand)}`}>
                    {getDemandLabel(month.demand, language)}
                  </span>
                </div>
                <h3 className="font-bold text-white">{month.month}</h3>
                <p className="text-xs text-gray-400">{getTranslation(month.weather, language) || month.weather}</p>
              </div>
            );
          })}
        </div>
      </GlowingCard>
      {/* Market Insights */}
      <GlowingCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">{getTranslation('marketInsights', language)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-500/30">
              <TrendingUp size={24} className="text-rose-300" />
            </div>
            <h3 className="font-bold text-white mb-2">
              {predictions?.marketInsights?.weddingSeason?.title || getTranslation('weddingSeason', language)}
            </h3>
            <p className="text-sm text-gray-300">
              {predictions?.marketInsights?.weddingSeason?.description || getTranslation('weddingSeasonDesc', language)}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-500/30">
              <Sparkles size={24} className="text-rose-300" />
            </div>
            <h3 className="font-bold text-white mb-2">
              {predictions?.marketInsights?.festive?.title || getTranslation('festiveTitle', language)}
            </h3>
            <p className="text-sm text-gray-300">
              {predictions?.marketInsights?.festive?.description || getTranslation('festiveDesc', language)}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-500/30">
              <Package size={24} className="text-rose-300" />
            </div>
            <h3 className="font-bold text-white mb-2">
              {predictions?.marketInsights?.stockPlanning?.title || getTranslation('stockPlanning', language)}
            </h3>
            <p className="text-sm text-gray-300">
              {predictions?.marketInsights?.stockPlanning?.description || getTranslation('stockPlanDesc', language)}
            </p>
          </div>
        </div>
      </GlowingCard>
    </div>
  );
};
export default DemandPredictions;
