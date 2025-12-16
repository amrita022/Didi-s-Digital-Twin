
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  Loader,
  IndianRupee,
  Clock,
  Store,
  Sparkles,
  PartyPopper,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';
import { GlowingCard } from '../ui/glowing-card';
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
          <div className="bg-neutral-900 border border-gray-800 rounded-xl p-6 max-w-md">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-center text-rose-400 font-bold mb-2">Error</h3>
            <p className="text-center text-gray-300 text-sm">
              {this.state.error?.message || 'An error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700"
            >
              Refresh Page
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
      setError(language === 'english' ? 'Please login' : 'कृपया लॉगिन करें');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching pricing recommendations for:', user.uid, 'Language:', language);
      
      const response = await fetch(`http://localhost:5002/api/pricing-recommendations?userId=${user.uid}&language=${language}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Pricing API Response:', data);
      
      if (data.success) {
        setPricingData(data);
        setError(null);
      } else {
        setError(data.error || (language === 'english' ? 'Failed to fetch recommendations' : 'सिफारिशें प्राप्त नहीं कर सके'));
      }
    } catch (err) {
      console.error('❌ Error fetching pricing recommendations:', err);
      setError(language === 'english' 
        ? 'Cannot connect to server. Please ensure server is running.'
        : 'सर्वर से कनेक्ट नहीं हो पा रहा है। कृपया सुनिश्चित करें कि सर्वर चल रहा है।');
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
      setError(language === 'english' ? 'Please login' : 'कृपया लॉगिन करें');
    }
  }, [user, language]);
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
    const level = priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'medium';
    const styles = {
      high: 'bg-rose-600/15 text-rose-400 border-rose-600/30',
      medium: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
      low: 'bg-rose-400/10 text-rose-200 border-rose-400/20'
    };
    const text = {
      high: getTranslation('highPriority', language),
      medium: getTranslation('mediumPriority', language),
      low: getTranslation('lowPriority', language)
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[level]}`}>
        {text[level]}
      </span>
    );
  };
  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertTriangle className="h-5 w-5 text-rose-500" />;
    if (priority === 'medium') return <ArrowUp className="h-5 w-5 text-rose-400" />;
    return <CheckCircle className="h-5 w-5 text-rose-300" />;
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-300">{getTranslation('analyzingPricing', language)}</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-neutral-900 border border-gray-800 rounded-xl p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <p className="text-center text-gray-200 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchPricingRecommendations();
            }}
            className="w-full bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700"
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
        <div className="bg-neutral-900 border border-gray-800 rounded-xl p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <p className="text-center text-gray-200 mb-4">{getTranslation('noDataAvailable', language)}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchPricingRecommendations();
            }}
            className="w-full bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700"
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
      <div className="pb-4 mb-6 border-b border-gray-800/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-rose-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {getTranslation('pricingAdvisorTitle', language)}
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                {getTranslation('pricingAdvisorSubtitle', language)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* AI Insight Banner */}
      {insights && ((insights.totalPotentialIncrease || 0) > 0 || (insights.potentialIncrease || 0) > 0) && (
        <div className="bg-neutral-900 rounded-xl p-5 text-gray-100 border border-gray-800">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 flex-shrink-0 mt-1 text-rose-400" />
            <div>
              <h3 className="font-bold text-lg mb-1 text-rose-300">
                {getTranslation('pricingInsights', language)}
              </h3>
              <p className="text-sm text-gray-300">
                {insights.message || getTranslation('pricingRecommendationsAvailable', language)}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* No Data Message */}
      {products.length === 0 && (
        <div className="bg-neutral-900 border border-gray-800 rounded-xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-100 mb-2">
            {getTranslation('noDataAvailable', language)}
          </h3>
          <p className="text-gray-400 mb-4">
            {getTranslation('notEnoughSalesData', language)}
          </p>
          <p className="text-sm text-gray-500">
            {getTranslation('continueAddingTransactions', language)}
          </p>
        </div>
      )}
      {/* Products List */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, index) => {
            try {
              // Safely extract all values with defaults
              const rawName = product?.name || product?.itemName || 'Unknown';
              // Translate product name if it's in Hindi
              const name = getTranslation(rawName, language) || rawName;
              const currentPrice = Number(product?.currentPrice) || 0;
              const suggestedPrice = Number(product?.suggestedPrice) || 0;
              const totalSales = Number(product?.totalSales) || 0;
              const percentDiff = Number(product?.percentDifference) || 0;
              const potentialIncrease = Number(product?.potentialMonthlyIncrease) || 0;
              const reason = product?.reason || getTranslation('noDataAvailable', language);
              const priority = product?.priority || 'low';
              return (
              <div key={index} className="bg-neutral-900 rounded-xl p-4 shadow-sm border border-gray-800 hover:border-gray-700 transition-colors h-full overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityIcon(priority)}
                      <h3 className="font-bold text-xl text-gray-100">{name}</h3>
                      {getPriorityBadge(priority)}
                    </div>
                    <GlowingCard className="p-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-200 font-medium mb-0.5">{reason}</p>
                        {potentialIncrease > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <TrendingUp className="h-4 w-4 text-rose-400" />
                            <span className="text-sm text-rose-400 font-semibold">
                              {getTranslation('potentialProfitIncrease', language)}: ₹{potentialIncrease.toLocaleString('en-IN')}/{getTranslation('perMonth', language)}
                            </span>
                          </div>
                        )}
                      </div>
                    </GlowingCard>
                  </div>
                  <div className="flex flex-col gap-3 min-w-0">
                    <GlowingCard className="inline-flex w-full items-center justify-between gap-3 px-3 py-3 rounded-md overflow-hidden box-border">
                      <span className="text-xs text-gray-400">{getTranslation('currentPrice', language)}</span>
                      <span className="text-sm font-semibold text-gray-100">₹{currentPrice.toLocaleString('en-IN')}</span>
                    </GlowingCard>
                    <div className="w-full p-3 rounded-md bg-rose-500/10 border border-rose-500/20 box-border">
                      <p className="text-xs text-gray-400 mb-1">{getTranslation('aiSuggestion', language)}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-rose-400">₹{Math.round(suggestedPrice).toLocaleString('en-IN')}</p>
                        {percentDiff > 0 && (
                          <span className="text-xs text-rose-400 font-semibold">+{Math.round(percentDiff)}%</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full p-3 rounded-md bg-rose-500/10 border border-rose-500/20 box-border">
                      <p className="text-xs text-gray-400 mb-1">{getTranslation('potentialProfit', language)}</p>
                      <p className="text-sm font-semibold text-rose-400">₹{potentialIncrease.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{getTranslation('perMonth', language)}</p>
                    </div>
                    <GlowingCard className="inline-flex w-full items-center justify-between gap-3 px-3 py-3 rounded-md overflow-hidden box-border">
                      <span className="text-xs text-gray-400">{getTranslation('sales', language)}</span>
                      <span className="text-sm font-semibold text-gray-100">{totalSales}</span>
                    </GlowingCard>
                  </div>
                </div>
              </div>
              );
            } catch (itemError) {
              console.error(`❌ Error rendering product ${index}:`, itemError, product);
              return (
                <div key={index} className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 rounded-xl p-4">
                  <p className="text-gray-300 text-sm">
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
        <GlowingCard className="p-4 shadow-sm">
          <h3 className="font-bold text-lg text-gray-100 mb-3">
            {getTranslation('profitMarginAnalysis', language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.currentMargin !== undefined && (
              <div className="p-3 bg-neutral-800 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-400 mb-1">{getTranslation('currentMargin', language)}</p>
                <p className="text-2xl font-bold text-gray-100">{insights.currentMargin}%</p>
              </div>
            )}
            {insights.suggestedMargin !== undefined && (
              <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <p className="text-xs text-gray-400 mb-1">{getTranslation('suggestedMargin', language)}</p>
                <p className="text-2xl font-bold text-rose-400">{insights.suggestedMargin}%</p>
              </div>
            )}
            <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <p className="text-xs text-gray-400 mb-1">{getTranslation('additionalProfitPerMonth', language)}</p>
              <p className="text-2xl font-bold text-rose-400">
                ₹{(insights.potentialIncrease || insights.totalPotentialIncrease || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </GlowingCard>
      )}
      {/* Pricing Tips */}
      <GlowingCard className="p-6 text-gray-100">
        <h2 className="text-xl font-bold mb-4 text-rose-300">
          {getTranslation('pricingTips', language)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlowingCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="h-4 w-4 text-rose-400" />
              <h3 className="font-bold text-gray-100">{getTranslation('rawMaterialCost', language)}</h3>
            </div>
            <p className="text-sm text-gray-400">
              {getTranslation('rawMaterialCostDesc', language)}
            </p>
          </GlowingCard>
          <GlowingCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-rose-400" />
              <h3 className="font-bold text-gray-100">{getTranslation('laborAndTime', language)}</h3>
            </div>
            <p className="text-sm text-gray-400">
              {getTranslation('laborAndTimeDesc', language)}
            </p>
          </GlowingCard>
          <GlowingCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Store className="h-4 w-4 text-rose-400" />
              <h3 className="font-bold text-gray-100">{getTranslation('marketResearch', language)}</h3>
            </div>
            <p className="text-sm text-gray-400">
              {getTranslation('marketResearchDesc', language)}
            </p>
          </GlowingCard>
          <GlowingCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-rose-400" />
              <h3 className="font-bold text-gray-100">{getTranslation('qualityValue', language)}</h3>
            </div>
            <p className="text-sm text-gray-400">
              {getTranslation('qualityValueDesc', language)}
            </p>
          </GlowingCard>
          <GlowingCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PartyPopper className="h-4 w-4 text-rose-400" />
              <h3 className="font-bold text-gray-100">{getTranslation('seasonalPricing', language)}</h3>
            </div>
            <p className="text-sm text-gray-400">
              {getTranslation('seasonalPricingDesc', language)}
            </p>
          </GlowingCard>
          <GlowingCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-rose-400" />
              <h3 className="font-bold text-gray-100">{getTranslation('customerFeedback', language)}</h3>
            </div>
            <p className="text-sm text-gray-400">
              {getTranslation('customerFeedbackDesc', language)}
            </p>
          </GlowingCard>
        </div>
      </GlowingCard>
    </div>
    );
  } catch (renderError) {
    console.error('❌ Render error:', renderError);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-center text-red-700 font-bold mb-2">Render Error</h3>
          <p className="text-center text-red-600 text-sm mb-4">
            {renderError.message || 'An error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Refresh Page
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
