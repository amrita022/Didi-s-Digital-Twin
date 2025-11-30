import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  Loader
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PricingAdvisor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-center text-red-700 font-bold mb-2">त्रुटि हुई</h3>
            <p className="text-center text-red-600 text-sm">
              {this.state.error?.message || 'कुछ गलत हो गया'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              पेज रीफ्रेश करें
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PricingAdvisor = () => {
  const { user } = useAuth();
  const { language } = useStore();
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState(null);
  const [error, setError] = useState(null);

  const fetchPricingRecommendations = async () => {
    if (!user?.uid) {
      console.log('⏳ Waiting for user authentication...');
      setLoading(false);
      setError('कृपया लॉगिन करें');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching pricing recommendations for:', user.uid);
      
      const response = await fetch(`http://localhost:5002/api/pricing-recommendations?userId=${user.uid}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Pricing API Response:', data);
      
      if (data.success) {
        setPricingData(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('❌ Error fetching pricing recommendations:', err);
      setError('सर्वर से कनेक्ट नहीं हो पा रहा है। कृपया सुनिश्चित करें कि सर्वर चल रहा है।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 Auth state:', { user: user?.uid, loading });
    if (user?.uid) {
      fetchPricingRecommendations();
    } else if (user === null) {
      setLoading(false);
      setError('कृपया लॉगिन करें');
    }
  }, [user]);

  // Safety: ensure products is always an array with proper validation
  let products = [];
  let insights = {};
  
  try {
    if (pricingData && typeof pricingData === 'object') {
      products = Array.isArray(pricingData.products) ? pricingData.products : [];
      insights = pricingData.insights || {};
    }
  } catch (err) {
    console.error('❌ Error parsing pricing data:', err);
    products = [];
    insights = {};
  }

  console.log('🔍 Render state:', { 
    loading, 
    error, 
    productsCount: products.length, 
    hasInsights: !!insights.totalPotentialIncrease 
  });

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { text: getTranslation('highPriority', language), color: 'bg-red-100 text-red-700 border-red-300' },
      medium: { text: getTranslation('mediumPriority', language), color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      low: { text: getTranslation('lowPriority', language), color: 'bg-green-100 text-green-700 border-green-300' }
    };
    const badge = badges[priority] || badges.medium;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (priority === 'medium') return <ArrowUp className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{getTranslation('analyzingPricing', language)}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-center text-red-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchPricingRecommendations();
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            {getTranslation('tryAgain', language)}
          </button>
        </div>
      </div>
    );
  }

  // Final safety check before rendering
  if (!pricingData && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-center text-yellow-700 mb-4">{getTranslation('noDataAvailable', language)}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchPricingRecommendations();
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            {getTranslation('loadData', language)}
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getTranslation('pricingAdvisorTitle', language)}
        </h1>
        <p className="text-gray-600">
          {getTranslation('pricingAdvisorSubtitle', language)}
        </p>
      </div>

      {/* AI Insight Banner */}
      {insights && ((insights.totalPotentialIncrease || 0) > 0 || (insights.potentialIncrease || 0) > 0) && (
        <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">
                💡 {getTranslation('pricingInsights', language)}
              </h3>
              <p className="text-sm">
                {insights.message || getTranslation('pricingRecommendationsAvailable', language)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {products.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {getTranslation('noDataAvailable', language)}
          </h3>
          <p className="text-gray-600 mb-4">
            {getTranslation('notEnoughSalesData', language)}
          </p>
          <p className="text-sm text-gray-500">
            {getTranslation('continueAddingTransactions', language)}
          </p>
        </div>
      )}

      {/* Products List */}
      {products.length > 0 && (
        <div className="space-y-4">
          {products.map((product, index) => {
            try {
              // Safely extract all values with defaults
              const name = product?.name || product?.itemName || 'अज्ञात';
              const currentPrice = Number(product?.currentPrice) || 0;
              const suggestedPrice = Number(product?.suggestedPrice) || 0;
              const totalSales = Number(product?.totalSales) || 0;
              const percentDiff = Number(product?.percentDifference) || 0;
              const potentialIncrease = Number(product?.potentialMonthlyIncrease) || 0;
              const reason = product?.reason || 'कोई कारण नहीं';
              const priority = product?.priority || 'low';

              return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getPriorityIcon(priority)}
                      <h3 className="font-bold text-xl text-gray-900">
                        {name}
                      </h3>
                      {getPriorityBadge(priority)}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">{getTranslation('currentPrice', language)}</p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{currentPrice.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {totalSales} {getTranslation('sales', language)}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">{getTranslation('aiSuggestion', language)}</p>
                        <p className="text-xl font-bold text-green-600">
                          ₹{Math.round(suggestedPrice).toLocaleString('en-IN')}
                        </p>
                        {percentDiff > 0 && (
                          <p className="text-xs text-green-600 mt-1 font-semibold">
                            +{Math.round(percentDiff)}% {getTranslation('increase', language)}
                          </p>
                        )}
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">{getTranslation('potentialProfit', language)}</p>
                        <p className="text-xl font-bold text-blue-600">
                          ₹{potentialIncrease.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getTranslation('perMonth', language)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {reason}
                        </p>
                        {potentialIncrease > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600 font-semibold">
                              {getTranslation('potentialProfitIncrease', language)}: ₹{potentialIncrease.toLocaleString('en-IN')}/{getTranslation('perMonth', language)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            } catch (itemError) {
              console.error(`❌ Error rendering product ${index}:`, itemError, product);
              return (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-700 text-sm">
                    आइटम #{index + 1} लोड करने में त्रुटि
                  </p>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Profit Calculator */}
      {insights && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            💰 {getTranslation('profitMarginAnalysis', language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.currentMargin !== undefined && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{getTranslation('currentMargin', language)}</p>
                <p className="text-3xl font-bold text-gray-900">{insights.currentMargin}%</p>
              </div>
            )}
            {insights.suggestedMargin !== undefined && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">{getTranslation('suggestedMargin', language)}</p>
                <p className="text-3xl font-bold text-green-600">{insights.suggestedMargin}%</p>
              </div>
            )}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">{getTranslation('additionalProfitPerMonth', language)}</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{(insights.potentialIncrease || insights.totalPotentialIncrease || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tips */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">
          📚 {getTranslation('pricingTips', language)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">💵 {getTranslation('rawMaterialCost', language)}</h3>
            <p className="text-sm">
              {getTranslation('rawMaterialCostDesc', language)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">⏰ {getTranslation('laborAndTime', language)}</h3>
            <p className="text-sm">
              {getTranslation('laborAndTimeDesc', language)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">🏪 {getTranslation('marketResearch', language)}</h3>
            <p className="text-sm">
              {getTranslation('marketResearchDesc', language)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">✨ {getTranslation('qualityValue', language)}</h3>
            <p className="text-sm">
              {getTranslation('qualityValueDesc', language)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">🎉 {getTranslation('seasonalPricing', language)}</h3>
            <p className="text-sm">
              {getTranslation('seasonalPricingDesc', language)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">💬 {getTranslation('customerFeedback', language)}</h3>
            <p className="text-sm">
              {getTranslation('customerFeedbackDesc', language)}
            </p>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (renderError) {
    console.error('❌ Render error:', renderError);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-center text-red-700 font-bold mb-2">रेंडर त्रुटि</h3>
          <p className="text-center text-red-600 text-sm mb-4">
            {renderError.message || 'कुछ गलत हो गया'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            पेज रीफ्रेश करें
          </button>
        </div>
      </div>
    );
  }
};

const PricingAdvisorWithErrorBoundary = () => (
  <ErrorBoundary>
    <PricingAdvisor />
  </ErrorBoundary>
);

export default PricingAdvisorWithErrorBoundary;