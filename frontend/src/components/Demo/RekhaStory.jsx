import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Star,
  Gift,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const RekhaStory = () => {
  const { language, demoMode, storyProgress, updateStoryProgress } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const storySteps = [
    {
      id: 1,
      title: language === 'hindi' ? 'रेखा की शुरुआत' : 'Rekha\'s Beginning',
      description: language === 'hindi' 
        ? 'रेखा एक आचार विक्रेता हैं। वह ₹80 प्रति जार कीमत पर आचार बेचती हैं, लेकिन उनकी कमाई केवल ₹2,500 प्रति माह है।' 
        : 'Rekha is a pickle seller. She sells pickles at ₹80 per jar, but her monthly earnings are only ₹2,500.',
      image: '👩‍🍳',
      earnings: 2500,
      price: 80,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 2,
      title: language === 'hindi' ? 'समस्या की पहचान' : 'Problem Identified',
      description: language === 'hindi' 
        ? 'AI ने पाया कि रेखा अपने आचार को 45% कम कीमत पर बेच रही हैं। बाजार में समान गुणवत्ता के आचार ₹120-150 में बिकते हैं।' 
        : 'AI found that Rekha is selling her pickles 45% below market price. Similar quality pickles sell for ₹120-150 in the market.',
      image: '🤔',
      earnings: 2500,
      price: 80,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 3,
      title: language === 'hindi' ? 'कीमत सुधार' : 'Price Correction',
      description: language === 'hindi' 
        ? 'रेखा ने AI के सुझाव के अनुसार अपनी कीमत ₹120 प्रति जार कर दी। अब उनकी कमाई ₹3,750 प्रति माह हो गई।' 
        : 'Rekha increased her price to ₹120 per jar as suggested by AI. Now her monthly earnings increased to ₹3,750.',
      image: '💰',
      earnings: 3750,
      price: 120,
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 4,
      title: language === 'hindi' ? 'मांग पूर्वानुमान' : 'Demand Prediction',
      description: language === 'hindi' 
        ? 'AI ने भविष्यवाणी की कि गर्मियों में आचार की मांग 40% बढ़ेगी। रेखा ने अतिरिक्त स्टॉक तैयार किया।' 
        : 'AI predicted that pickle demand would increase by 40% in summer. Rekha prepared additional stock.',
      image: '📈',
      earnings: 4500,
      price: 120,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 5,
      title: language === 'hindi' ? 'बचत योजना' : 'Savings Plan',
      description: language === 'hindi' 
        ? 'रेखा ने प्रतिदिन ₹100 बचाना शुरू किया। 6 महीने में उन्होंने ₹18,000 बचाए और नई सिलाई मशीन खरीदी।' 
        : 'Rekha started saving ₹100 daily. In 6 months, she saved ₹18,000 and bought a new sewing machine.',
      image: '🏦',
      earnings: 6000,
      price: 120,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 6,
      title: language === 'hindi' ? 'सफलता की कहानी' : 'Success Story',
      description: language === 'hindi' 
        ? 'आज रेखा ₹8,000 प्रति माह कमाती हैं। उनकी बेटी कॉलेज जाती है। वह एक सफल उद्यमी बन गई हैं!' 
        : 'Today Rekha earns ₹8,000 per month. Her daughter goes to college. She has become a successful entrepreneur!',
      image: '🎓',
      earnings: 8000,
      price: 120,
      color: 'from-green-600 to-emerald-500'
    }
  ];

  const currentStory = storySteps.find(step => step.id === currentStep);

  const nextStep = () => {
    if (currentStep < storySteps.length) {
      setCurrentStep(currentStep + 1);
      updateStoryProgress(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetStory = () => {
    setCurrentStep(1);
    setIsPlaying(false);
    setShowCelebration(false);
  };

  const playStory = () => {
    setIsPlaying(true);
    // Auto-play through story
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= storySteps.length) {
          setIsPlaying(false);
          setShowCelebration(true);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const pauseStory = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    if (currentStep === storySteps.length) {
      setShowCelebration(true);
    }
  }, [currentStep, storySteps.length]);

  if (!demoMode) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3A2B4D] to-[#3B7A6D] rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Star size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'hindi' ? 'रेखा की कहानी' : 'Rekha\'s Story'}
            </h1>
            <p className="text-white/90">
              {language === 'hindi' 
                ? 'एक आचार विक्रेता की सफलता की कहानी' 
                : 'A pickle seller\'s success story'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Story Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#3A2B4D]">
            {language === 'hindi' ? 'कहानी की प्रगति' : 'Story Progress'}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={isPlaying ? pauseStory : playStory}
              className="flex items-center space-x-2 px-4 py-2 bg-[#3B7A6D] text-white rounded-lg hover:bg-[#2D5F52] transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={resetStory}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw size={16} />
              <span>{language === 'hindi' ? 'रिसेट' : 'Reset'}</span>
            </button>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-[#3B7A6D] to-[#D9A441] h-3 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / storySteps.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{language === 'hindi' ? 'चरण' : 'Step'} {currentStep} / {storySteps.length}</span>
          <span>{Math.round((currentStep / storySteps.length) * 100)}%</span>
        </div>
      </div>

      {/* Current Story Step */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">{currentStory.image}</div>
          <h2 className="text-2xl font-bold text-[#3A2B4D] mb-2">
            {currentStory.title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {currentStory.description}
          </p>
        </div>

        {/* Earnings Display */}
        <div className={`bg-gradient-to-r ${currentStory.color} rounded-xl p-6 text-white mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-bold mb-2">
                {language === 'hindi' ? 'मासिक कमाई' : 'Monthly Earnings'}
              </h3>
              <div className="text-3xl font-bold">₹{currentStory.earnings.toLocaleString()}</div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">
                {language === 'hindi' ? 'प्रति जार कीमत' : 'Price per Jar'}
              </h3>
              <div className="text-3xl font-bold">₹{currentStory.price}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            <ArrowLeft size={16} />
            <span>{language === 'hindi' ? 'पिछला' : 'Previous'}</span>
          </button>
          
          <button
            onClick={nextStep}
            disabled={currentStep === storySteps.length}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              currentStep === storySteps.length
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#3B7A6D] text-white hover:bg-[#2D5F52]'
            }`}
          >
            <span>{language === 'hindi' ? 'अगला' : 'Next'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Key Learnings */}
      <div className="bg-gradient-to-r from-[#EBAE82] to-[#D9A441] rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">
          {language === 'hindi' ? 'मुख्य सीख' : 'Key Learnings'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target size={20} />
              <h3 className="font-bold">
                {language === 'hindi' ? 'सही कीमत' : 'Right Pricing'}
              </h3>
            </div>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'बाजार अनुसंधान करके सही कीमत तय करें' 
                : 'Set the right price through market research'
              }
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={20} />
              <h3 className="font-bold">
                {language === 'hindi' ? 'मांग पूर्वानुमान' : 'Demand Forecasting'}
              </h3>
            </div>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'मौसम और त्योहारों के अनुसार योजना बनाएं' 
                : 'Plan according to seasons and festivals'
              }
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Gift size={20} />
              <h3 className="font-bold">
                {language === 'hindi' ? 'नियमित बचत' : 'Regular Savings'}
              </h3>
            </div>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'प्रतिदिन थोड़ा-थोड़ा बचाने से बड़े लक्ष्य पूरे होते हैं' 
                : 'Small daily savings lead to big achievements'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#3A2B4D] mb-4">
              {language === 'hindi' ? 'बधाई हो रेखा दीदी!' : 'Congratulations Rekha Didi!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'hindi' 
                ? 'आपने अपने सपने को सच कर दिया है! आपकी कमाई ₹2,500 से ₹8,000 प्रति माह हो गई है।' 
                : 'You have made your dream come true! Your earnings have increased from ₹2,500 to ₹8,000 per month.'
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 px-6 py-3 bg-[#3B7A6D] text-white rounded-lg hover:bg-[#2D5F52] transition-colors"
              >
                {language === 'hindi' ? 'बंद करें' : 'Close'}
              </button>
              <button
                onClick={resetStory}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {language === 'hindi' ? 'फिर से देखें' : 'Watch Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekhaStory;
