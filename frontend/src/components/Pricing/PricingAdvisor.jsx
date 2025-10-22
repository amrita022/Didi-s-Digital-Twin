import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  IndianRupee
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const PricingAdvisor = () => {
  const { businessData, language, updateBusinessData } = useStore();
  const { products } = businessData;

  const pricingData = [
    {
      name: { en: "Mango Pickle (500g)", hi: "आम का अचार (500g)" },
      currentPrice: 120,
      suggestedPrice: 150,
      competitorPrice: 145,
      reason: { en: "Market demand is high, increase by ₹30", hi: "बाजार की मांग अधिक है, ₹30 बढ़ाएं" }
    },
    {
      name: { en: "Mixed Pickle (500g)", hi: "मिश्रित अचार (500g)" },
      currentPrice: 100,
      suggestedPrice: 130,
      competitorPrice: 125,
      reason: { en: "Premium quality justifies higher price", hi: "प्रीमियम गुणवत्ता उच्च कीमत को उचित ठहराती है" }
    },
    {
      name: { en: "Lemon Pickle (250g)", hi: "नींबू का अचार (250g)" },
      currentPrice: 60,
      suggestedPrice: 70,
      competitorPrice: 75,
      reason: { en: "Below market average, small increase recommended", hi: "बाजार औसत से नीचे, छोटी वृद्धि की सिफारिश" }
    }
  ];

  const applySuggestion = (index) => {
    const updatedProducts = products.map((product, i) => 
      i === index 
        ? { ...product, currentPrice: pricingData[index].suggestedPrice }
        : product
    );
    updateBusinessData({ products: updatedProducts });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === 'hindi' ? 'मूल्य निर्धारण सलाहकार' : 'Pricing Advisor'}
        </h1>
        <p className="text-gray-600">
          {language === 'hindi' 
            ? 'एआई-संचालित मूल्य निर्धारण सिफारिशें' 
            : 'AI-powered pricing recommendations'
          }
        </p>
      </div>

      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-6 w-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">
              💡 {language === 'hindi' ? 'मूल्य निर्धारण अंतर्दृष्टि' : 'Pricing Insight'}
            </h3>
            <p className="text-sm">
              {language === 'hindi' 
                ? "आप औसतन 25% कम कीमत लगा रहे हैं। कीमतें समायोजित करने से आपका मासिक लाभ ₹3,200 बढ़ सकता है!" 
                : "You're underpricing by an average of 25%. Adjusting prices can increase your monthly profit by ₹3,200!"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {pricingData.map((product, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {language === 'hindi' ? product.name.hi : product.name.en}
                </h3>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {language === 'hindi' ? 'वर्तमान मूल्य' : 'Current Price'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">₹{product.currentPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {language === 'hindi' ? 'एआई सुझाव' : 'AI Suggested'}
                    </p>
                    <p className="text-lg font-bold text-green-600">₹{product.suggestedPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {language === 'hindi' ? 'प्रतियोगी औसत' : 'Competitor Avg'}
                    </p>
                    <p className="text-lg font-bold text-gray-600">₹{product.competitorPrice}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-900">
                    {language === 'hindi' ? product.reason.hi : product.reason.en}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => applySuggestion(index)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {language === 'hindi' ? 'सुझाव लागू करें' : 'Apply Suggestion'}
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  {language === 'hindi' ? 'विवरण देखें' : 'View Details'}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>
                {language === 'hindi' 
                  ? `संभावित लाभ वृद्धि: ₹${(product.suggestedPrice - product.currentPrice) * 50}/माह`
                  : `Potential profit increase: ₹${(product.suggestedPrice - product.currentPrice) * 50}/month`
                }
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Profit Calculator */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg text-gray-900 mb-4">
          {language === 'hindi' ? 'लाभ मार्जिन कैलकुलेटर' : 'Profit Margin Calculator'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'hindi' ? 'वर्तमान मार्जिन' : 'Current Margin'}
            </p>
            <p className="text-2xl font-bold text-gray-900">32%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'hindi' ? 'सुझाया गया मार्जिन' : 'Suggested Margin'}
            </p>
            <p className="text-2xl font-bold text-green-600">45%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'hindi' ? 'अतिरिक्त लाभ/माह' : 'Extra Profit/Month'}
            </p>
            <p className="text-2xl font-bold text-blue-600">₹3,200</p>
          </div>
        </div>
      </div>

      {/* Pricing Tips */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">
          {language === 'hindi' ? 'मूल्य निर्धारण के टिप्स' : 'Pricing Tips'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-2">
              {language === 'hindi' ? 'कच्चे माल की लागत' : 'Raw Material Cost'}
            </h3>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'कच्चे माल की लागत का 2-3 गुना मूल्य रखें' 
                : 'Set price at 2-3 times the raw material cost'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-2">
              {language === 'hindi' ? 'श्रम लागत' : 'Labor Cost'}
            </h3>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'अपने समय और मेहनत का मूल्य भी जोड़ें' 
                : 'Add value for your time and effort'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-2">
              {language === 'hindi' ? 'बाजार अनुसंधान' : 'Market Research'}
            </h3>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'स्थानीय दुकानों की कीमतों की जांच करें' 
                : 'Check prices at local shops'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-2">
              {language === 'hindi' ? 'गुणवत्ता का मूल्य' : 'Quality Value'}
            </h3>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'अच्छी गुणवत्ता के लिए अधिक मूल्य मांगें' 
                : 'Charge more for good quality'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingAdvisor;