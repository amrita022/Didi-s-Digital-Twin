import React from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Star,
  Cloud,
  Sun,
  Droplets
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const DemandPredictions = () => {
  const { businessData, language } = useStore();
  const { demandPredictions } = businessData;

  const festivals = [
    { 
      name: language === 'hindi' ? 'होली' : 'Holi', 
      date: 'March 8', 
      demand: 'Very High', 
      color: 'bg-pink-500',
      icon: '🎨'
    },
    { 
      name: language === 'hindi' ? 'रामनवमी' : 'Ram Navami', 
      date: 'April 17', 
      demand: 'High', 
      color: 'bg-yellow-500',
      icon: '🕉️'
    },
    { 
      name: language === 'hindi' ? 'रक्षाबंधन' : 'Raksha Bandhan', 
      date: 'August 19', 
      demand: 'High', 
      color: 'bg-red-500',
      icon: '🪢'
    },
    { 
      name: language === 'hindi' ? 'दिवाली' : 'Diwali', 
      date: 'October 31', 
      demand: 'Very High', 
      color: 'bg-orange-500',
      icon: '🪔'
    },
  ];

  const weatherData = [
    { month: 'Jan', weather: 'Cold', icon: '❄️', demand: 'Low' },
    { month: 'Feb', weather: 'Cool', icon: '🌤️', demand: 'Medium' },
    { month: 'Mar', weather: 'Warm', icon: '☀️', demand: 'High' },
    { month: 'Apr', weather: 'Hot', icon: '🌞', demand: 'Very High' },
    { month: 'May', weather: 'Very Hot', icon: '🔥', demand: 'Very High' },
    { month: 'Jun', weather: 'Monsoon', icon: '🌧️', demand: 'High' },
  ];

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'Very High': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDemandIcon = (demand) => {
    switch (demand) {
      case 'Very High': return <TrendingUp size={16} className="text-red-600" />;
      case 'High': return <TrendingUp size={16} className="text-orange-600" />;
      case 'Medium': return <CheckCircle size={16} className="text-yellow-600" />;
      case 'Low': return <TrendingDown size={16} className="text-blue-600" />;
      default: return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const MonthCard = ({ month, demand, reason, weather, icon }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-bold text-[#3A2B4D]">{month}</h3>
            <p className="text-sm text-gray-600">{weather}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getDemandColor(demand)}`}>
          {getDemandIcon(demand)}
          <span>{demand}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600">{reason}</p>
    </div>
  );

  const FestivalCard = ({ festival }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl">{festival.icon}</span>
        <div>
          <h3 className="font-bold text-[#3A2B4D]">{festival.name}</h3>
          <p className="text-sm text-gray-600">{festival.date}</p>
        </div>
      </div>
      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
        festival.demand === 'Very High' ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'
      }`}>
        <Star size={14} />
        <span>{festival.demand} Demand</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3B7A6D] to-[#3A2B4D] rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Calendar size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {getTranslation('demandPredictions', language)}
            </h1>
            <p className="text-white/90">
              {language === 'hindi' 
                ? 'मौसम और त्योहारों के अनुसार मांग का पूर्वानुमान' 
                : 'Demand forecasting based on seasons and festivals'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Current Month Alert */}
      <div className="bg-gradient-to-r from-[#C85D3A] to-[#EBAE82] rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle size={24} />
          <h2 className="text-xl font-bold">
            {language === 'hindi' ? 'इस महीने का अलर्ट' : 'This Month Alert'}
          </h2>
        </div>
        <div className="bg-white/20 rounded-lg p-4">
          <p className="text-sm">
            {language === 'hindi' 
              ? 'मार्च में होली के कारण आचार की मांग बहुत अधिक होगी। अभी से अतिरिक्त स्टॉक तैयार करना शुरू करें।' 
              : 'Pickle demand will be very high in March due to Holi. Start preparing extra stock now.'
            }
          </p>
        </div>
      </div>

      {/* Seasonal Calendar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">
          {getTranslation('seasonalCalendar', language)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weatherData.map((month, index) => (
            <MonthCard
              key={index}
              month={month.month}
              demand={month.demand}
              reason={language === 'hindi' 
                ? `${month.weather} मौसम में आचार की मांग ${month.demand.toLowerCase()} होती है`
                : `Pickle demand is ${month.demand.toLowerCase()} in ${month.weather.toLowerCase()} weather`
              }
              weather={month.weather}
              icon={month.icon}
            />
          ))}
        </div>
      </div>

      {/* Festival Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">
          {getTranslation('festivalAlerts', language)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {festivals.map((festival, index) => (
            <FestivalCard key={index} festival={festival} />
          ))}
        </div>
      </div>

      {/* Stock Recommendations */}
      <div className="bg-gradient-to-r from-[#3A2B4D] to-[#3B7A6D] rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">
          {getTranslation('stockRecommendations', language)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-2 flex items-center">
              <CheckCircle size={16} className="mr-2" />
              {language === 'hindi' ? 'तत्काल कार्य' : 'Immediate Action'}
            </h3>
            <ul className="text-sm space-y-1">
              <li>• {language === 'hindi' ? 'होली के लिए 50% अतिरिक्त स्टॉक तैयार करें' : 'Prepare 50% extra stock for Holi'}</li>
              <li>• {language === 'hindi' ? 'मार्च में कीमत 20% बढ़ाएं' : 'Increase prices by 20% in March'}</li>
              <li>• {language === 'hindi' ? 'अतिरिक्त कर्मचारी रखें' : 'Hire additional staff'}</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-2 flex items-center">
              <Calendar size={16} className="mr-2" />
              {language === 'hindi' ? 'भविष्य की योजना' : 'Future Planning'}
            </h3>
            <ul className="text-sm space-y-1">
              <li>• {language === 'hindi' ? 'गर्मियों के लिए विशेष आचार तैयार करें' : 'Prepare special pickles for summer'}</li>
              <li>• {language === 'hindi' ? 'दिवाली के लिए पहले से तैयारी शुरू करें' : 'Start preparing early for Diwali'}</li>
              <li>• {language === 'hindi' ? 'नए स्वाद विकसित करें' : 'Develop new flavors'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">
          {getTranslation('marketInsights', language)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-[#3A2B4D] mb-2">
              {language === 'hindi' ? 'बढ़ती मांग' : 'Growing Demand'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'hindi' 
                ? 'स्थानीय बाजार में आचार की मांग 25% बढ़ी है' 
                : 'Pickle demand has increased by 25% in local market'
              }
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Cloud size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-[#3A2B4D] mb-2">
              {language === 'hindi' ? 'मौसमी प्रभाव' : 'Seasonal Impact'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'hindi' 
                ? 'गर्मियों में मांग 40% अधिक होती है' 
                : 'Demand is 40% higher in summer'
              }
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star size={24} className="text-yellow-600" />
            </div>
            <h3 className="font-bold text-[#3A2B4D] mb-2">
              {language === 'hindi' ? 'गुणवत्ता मूल्य' : 'Quality Value'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'hindi' 
                ? 'गुणवत्ता वाले आचार 30% अधिक मूल्य पर बिकते हैं' 
                : 'Quality pickles sell at 30% higher price'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandPredictions;
