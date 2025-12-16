import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign,
  Brain,
  BarChart3,
  Zap,
  Globe,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import useStore from '../../store/useStore';
import { GlowingCard } from '../ui/glowing-card';

const WhyChooseUs = () => {
  const { language } = useStore();

  const features = [
    {
      icon: Brain,
      title: language === 'hindi' ? 'AI-संचालित अंतर्दृष्टि' : 'AI-Powered Insights',
      description: language === 'hindi' 
        ? 'Prophet AI और मशीन लर्निंग के साथ सटीक मांग पूर्वानुमान और बिक्री पूर्वानुमान प्राप्त करें'
        : 'Get accurate demand forecasting and sales predictions with Prophet AI and machine learning',
      color: 'from-purple-500 to-pink-500',
      stat: language === 'hindi' ? '95% सटीकता' : '95% Accuracy'
    },
    {
      icon: DollarSign,
      title: language === 'hindi' ? 'स्मार्ट प्राइसिंग' : 'Smart Pricing',
      description: language === 'hindi'
        ? 'XGBoost मॉडल के साथ इष्टतम मूल्य निर्धारण - औसतन 45% मुनाफा बढ़ाएं'
        : 'Optimal pricing with XGBoost models - increase profits by 45% on average',
      color: 'from-green-500 to-emerald-500',
      stat: language === 'hindi' ? '45% मुनाफा वृद्धि' : '45% Profit Increase'
    },
    {
      icon: BarChart3,
      title: language === 'hindi' ? 'वास्तविक समय विश्लेषण' : 'Real-Time Analytics',
      description: language === 'hindi'
        ? 'अपने व्यापार के प्रदर्शन को तुरंत देखें - आय, खर्च, मुनाफा और बचत'
        : 'See your business performance instantly - income, expenses, profit, and savings',
      color: 'from-blue-500 to-cyan-500',
      stat: language === 'hindi' ? '24/7 निगरानी' : '24/7 Monitoring'
    },
    {
      icon: Zap,
      title: language === 'hindi' ? 'वॉइस कमांड' : 'Voice Commands',
      description: language === 'hindi'
        ? '11 भारतीय भाषाओं में वॉइस कमांड - बस बोलें और लेनदेन दर्ज करें'
        : 'Voice commands in 11 Indian languages - just speak and record transactions',
      color: 'from-orange-500 to-rose-500',
      stat: language === 'hindi' ? '11 भाषाएं' : '11 Languages'
    },
    {
      icon: Clock,
      title: language === 'hindi' ? 'समय बचाएं' : 'Save Time',
      description: language === 'hindi'
        ? 'ऑटोमेटेड रिमाइंडर और नजर - त्योहारों और मौसमी रुझानों के लिए तैयार रहें'
        : 'Automated reminders and nudges - stay prepared for festivals and seasonal trends',
      color: 'from-indigo-500 to-purple-500',
      stat: language === 'hindi' ? '80% समय बचत' : '80% Time Saved'
    },
    {
      icon: Shield,
      title: language === 'hindi' ? 'सुरक्षित और निजी' : 'Secure & Private',
      description: language === 'hindi'
        ? 'आपका डेटा सुरक्षित है - एंड-टू-एंड एन्क्रिप्शन और निजी डेटा संरक्षण'
        : 'Your data is secure - end-to-end encryption and private data protection',
      color: 'from-teal-500 to-green-500',
      stat: language === 'hindi' ? '100% सुरक्षित' : '100% Secure'
    }
  ];

  const benefits = [
    {
      number: '3x',
      title: language === 'hindi' ? 'मुनाफा बढ़ाएं' : 'Increase Profits',
      description: language === 'hindi'
        ? 'स्मार्ट प्राइसिंग और मांग पूर्वानुमान के साथ अपने मुनाफे को 3 गुना बढ़ाएं'
        : 'Triple your profits with smart pricing and demand forecasting'
    },
    {
      number: '50%',
      title: language === 'hindi' ? 'समय बचाएं' : 'Save Time',
      description: language === 'hindi'
        ? 'ऑटोमेटेड रिपोर्टिंग और वॉइस कमांड के साथ प्रतिदिन 2+ घंटे बचाएं'
        : 'Save 2+ hours daily with automated reporting and voice commands'
    },
    {
      number: '95%',
      title: language === 'hindi' ? 'सटीक पूर्वानुमान' : 'Accurate Predictions',
      description: language === 'hindi'
        ? 'AI-संचालित पूर्वानुमान 95% सटीकता के साथ मांग और बिक्री का अनुमान लगाते हैं'
        : 'AI-powered predictions forecast demand and sales with 95% accuracy'
    }
  ];

  const testimonials = [
    {
      name: language === 'hindi' ? 'प्रिया शर्मा' : 'Priya Sharma',
      business: language === 'hindi' ? 'कपड़े की दुकान' : 'Clothing Store',
      quote: language === 'hindi'
        ? 'इस ऐप ने मेरी कमाई ₹5,000 से ₹15,000 प्रति माह कर दी! AI प्राइसिंग सुझाव बेहद मददगार हैं।'
        : 'This app increased my earnings from ₹5,000 to ₹15,000 per month! The AI pricing suggestions are incredibly helpful.',
      improvement: '+200%'
    },
    {
      name: language === 'hindi' ? 'राजेश कुमार' : 'Rajesh Kumar',
      business: language === 'hindi' ? 'आचार व्यवसाय' : 'Pickle Business',
      quote: language === 'hindi'
        ? 'मौसमी पूर्वानुमान ने मुझे त्योहारों के लिए पहले से तैयार रहने में मदद की। बिक्री 60% बढ़ गई!'
        : 'Seasonal predictions helped me prepare in advance for festivals. Sales increased by 60%!',
      improvement: '+60%'
    },
    {
      name: language === 'hindi' ? 'मीना देवी' : 'Meena Devi',
      business: language === 'hindi' ? 'हस्तशिल्प' : 'Handicrafts',
      quote: language === 'hindi'
        ? 'वॉइस कमांड सुविधा बेहद आसान है। मैं बस बोलती हूं और सब कुछ दर्ज हो जाता है। समय की बहुत बचत!'
        : 'The voice command feature is so easy. I just speak and everything gets recorded. Saves so much time!',
      improvement: '80%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles size={32} className="text-white" />
            <h1 className="text-4xl md:text-5xl font-bold">
              {language === 'hindi' ? 'हमें क्यों चुनें?' : 'Why Choose Us?'}
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
            {language === 'hindi'
              ? 'AI-संचालित डिजिटल सहायक जो आपके छोटे व्यापार को बड़ा बनाता है'
              : 'AI-powered digital assistant that transforms your small business into a big success'}
          </p>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <GlowingCard
            key={index}
            className="p-6"
          >
            <div className="text-5xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent mb-3">
              {benefit.number}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
            <p className="text-gray-400 text-sm">{benefit.description}</p>
          </GlowingCard>
        ))}
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {language === 'hindi' ? 'शक्तिशाली सुविधाएं' : 'Powerful Features'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <GlowingCard
                key={index}
                className="p-6 hover:shadow-lg hover:shadow-rose-500/20 group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-medium">
                    {feature.stat}
                  </span>
                  <ArrowRight size={16} className="text-gray-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                </div>
              </GlowingCard>
            );
          })}
        </div>
      </div>

      {/* Success Stories / Testimonials */}
      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-8 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp size={28} className="text-rose-400" />
          <h2 className="text-3xl font-bold text-white">
            {language === 'hindi' ? 'सफलता की कहानियां' : 'Success Stories'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <GlowingCard
              key={index}
              className="p-6"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-xs text-gray-400">{testimonial.business}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4 italic">"{testimonial.quote}"</p>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-green-400 font-bold text-sm">{testimonial.improvement}</span>
                <span className="text-gray-400 text-xs">
                  {language === 'hindi' ? 'सुधार' : 'improvement'}
                </span>
              </div>
            </GlowingCard>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-rose-600 to-orange-500 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          {language === 'hindi' 
            ? 'अपने व्यापार को आज ही बढ़ाएं' 
            : 'Grow Your Business Today'}
        </h2>
        <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
          {language === 'hindi'
            ? 'हजारों व्यापारियों के साथ जुड़ें जो पहले से ही AI की शक्ति का उपयोग करके अपने मुनाफे को बढ़ा रहे हैं'
            : 'Join thousands of business owners who are already increasing their profits using the power of AI'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
            <div className="text-2xl font-bold">10,000+</div>
            <div className="text-sm">{language === 'hindi' ? 'सक्रिय उपयोगकर्ता' : 'Active Users'}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
            <div className="text-2xl font-bold">₹50Cr+</div>
            <div className="text-sm">{language === 'hindi' ? 'कुल बिक्री' : 'Total Sales Tracked'}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
            <div className="text-2xl font-bold">4.8★</div>
            <div className="text-sm">{language === 'hindi' ? 'उपयोगकर्ता रेटिंग' : 'User Rating'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;

