import React, { useState } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Calculator, 
  Target,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const PricingAdvisor = () => {
  const { businessData, language, updateBusinessData } = useStore();
  const { products } = businessData;
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  const calculateProfitMargin = (currentPrice, suggestedPrice) => {
    return Math.round(((suggestedPrice - currentPrice) / currentPrice) * 100);
  };

  const updateProductPrice = (productId, newPrice) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, currentPrice: parseInt(newPrice) }
        : product
    );
    updateBusinessData({ products: updatedProducts });
    setEditingProduct(null);
    setNewPrice('');
  };

  const ProductCard = ({ product }) => {
    const profitIncrease = calculateProfitMargin(product.currentPrice, product.suggestedPrice);
    const isEditing = editingProduct === product.id;

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#3A2B4D]">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.category}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {language === 'hindi' ? 'लाभ वृद्धि' : 'Profit Increase'}
              </span>
              <span className={`text-lg font-bold ${
                profitIncrease > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                +{profitIncrease}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              {getTranslation('currentPrices', language)}
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B7A6D] focus:border-transparent"
                  placeholder="Enter new price"
                />
                <button
                  onClick={() => updateProductPrice(product.id, newPrice)}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewPrice('');
                  }}
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#3A2B4D]">₹{product.currentPrice}</span>
                <button
                  onClick={() => {
                    setEditingProduct(product.id);
                    setNewPrice(product.currentPrice.toString());
                  }}
                  className="p-1 text-gray-500 hover:text-[#3B7A6D] transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              {getTranslation('suggestedPrices', language)}
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#3B7A6D]">₹{product.suggestedPrice}</span>
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">+₹{product.suggestedPrice - product.currentPrice}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator size={16} className="text-[#3B7A6D]" />
            <span className="font-medium text-[#3A2B4D]">
              {language === 'hindi' ? 'लाभ मार्जिन विश्लेषण' : 'Profit Margin Analysis'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">
                {language === 'hindi' ? 'वर्तमान मार्जिन' : 'Current Margin'}
              </span>
              <div className="font-bold text-[#3A2B4D]">45%</div>
            </div>
            <div>
              <span className="text-gray-600">
                {language === 'hindi' ? 'सुझाव मार्जिन' : 'Suggested Margin'}
              </span>
              <div className="font-bold text-green-600">65%</div>
            </div>
          </div>
        </div>

        {profitIncrease > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm text-green-800">
                {language === 'hindi' 
                  ? `₹${product.suggestedPrice} की कीमत रखने से आपकी कमाई ${profitIncrease}% बढ़ सकती है`
                  : `Pricing at ₹${product.suggestedPrice} could increase your earnings by ${profitIncrease}%`
                }
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CompetitorCard = ({ name, price, marketPosition }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-[#3A2B4D]">{name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          marketPosition === 'high' ? 'bg-red-100 text-red-600' :
          marketPosition === 'medium' ? 'bg-yellow-100 text-yellow-600' :
          'bg-green-100 text-green-600'
        }`}>
          {marketPosition === 'high' ? 'High' : marketPosition === 'medium' ? 'Medium' : 'Low'}
        </span>
      </div>
      <div className="text-2xl font-bold text-[#3A2B4D]">₹{price}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#EBAE82] to-[#D9A441] rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Target size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {getTranslation('pricingAdvisor', language)}
            </h1>
            <p className="text-white/90">
              {language === 'hindi' 
                ? 'अपने उत्पादों की सही कीमत तय करें और कमाई बढ़ाएं' 
                : 'Set the right prices for your products and increase earnings'
              }
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-[#3A2B4D] to-[#3B7A6D] rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <h2 className="text-xl font-bold">
            {language === 'hindi' ? 'AI सुझाव' : 'AI Recommendations'}
          </h2>
        </div>
        <div className="space-y-3">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle size={16} className="text-yellow-400" />
              <span className="font-medium">
                {language === 'hindi' ? 'महत्वपूर्ण सुझाव' : 'Important Suggestion'}
              </span>
            </div>
            <p className="text-sm">
              {language === 'hindi' 
                ? 'आप अपने उत्पादों को 45% कम कीमत पर बेच रहे हैं। सही कीमत रखकर आपकी कमाई दोगुनी हो सकती है।' 
                : 'You are selling your products 45% below market price. Setting the right price could double your earnings.'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm">
              {language === 'hindi' 
                ? 'स्थानीय बाजार में आपके उत्पादों की मांग अधिक है। आप सुरक्षित रूप से कीमत बढ़ा सकते हैं।' 
                : 'There is high demand for your products in the local market. You can safely increase prices.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Products Pricing */}
      <div>
        <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">
          {language === 'hindi' ? 'उत्पाद मूल्य निर्धारण' : 'Product Pricing'}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#3A2B4D] mb-6">
          {getTranslation('competitorPricing', language)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CompetitorCard 
            name={language === 'hindi' ? 'राम की दुकान' : 'Ram\'s Shop'} 
            price={150} 
            marketPosition="high" 
          />
          <CompetitorCard 
            name={language === 'hindi' ? 'सीता स्टोर' : 'Sita Store'} 
            price={120} 
            marketPosition="medium" 
          />
          <CompetitorCard 
            name={language === 'hindi' ? 'गीता मार्केट' : 'Geeta Market'} 
            price={100} 
            marketPosition="low" 
          />
        </div>
      </div>

      {/* Pricing Tips */}
      <div className="bg-gradient-to-r from-[#3B7A6D] to-[#3A2B4D] rounded-xl p-6 text-white">
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
