import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Mic,
  Brain,
  BarChart3,
  DollarSign,
  Globe,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  Star,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import useStore from '../../store/useStore';

const LandingPage = ({ onGetStarted }) => {
  const { language, setLanguage } = useStore();
  const [showAuth, setShowAuth] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = () => {
    setShowAuth(true);
    onGetStarted?.();
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-neutral-900 to-black text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                {language === 'hindi' ? 'दीदी का डिजिटल ट्विन' : "Didi's Digital Twin"}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">
                {language === 'hindi' ? 'सुविधाएं' : 'Features'}
              </a>
              <a href="#solution" className="text-gray-300 hover:text-white transition">
                {language === 'hindi' ? 'समाधान' : 'Solution'}
              </a>
              <a href="#success" className="text-gray-300 hover:text-white transition">
                {language === 'hindi' ? 'सफलता' : 'Success Stories'}
              </a>
              <button
                onClick={() => setLanguage(language === 'hindi' ? 'english' : 'hindi')}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition flex items-center space-x-2"
              >
                <Globe size={16} />
                <span>{language === 'hindi' ? 'English' : 'हिंदी'}</span>
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition font-semibold"
              >
                {language === 'hindi' ? 'साइन इन' : 'Sign In'}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden py-4 space-y-4"
            >
              <a href="#features" className="block text-gray-300 hover:text-white transition">
                {language === 'hindi' ? 'सुविधाएं' : 'Features'}
              </a>
              <a href="#solution" className="block text-gray-300 hover:text-white transition">
                {language === 'hindi' ? 'समाधान' : 'Solution'}
              </a>
              <a href="#success" className="block text-gray-300 hover:text-white transition">
                {language === 'hindi' ? 'सफलता' : 'Success Stories'}
              </a>
              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition font-semibold"
              >
                {language === 'hindi' ? 'शुरू करें' : 'Get Started'}
              </button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            <motion.div variants={fadeInUp} className="inline-block">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/30 text-rose-300 text-sm font-medium">
                {language === 'hindi' ? '🚀 AI-संचालित व्यापार सहायक' : '🚀 AI-Powered Business Assistant'}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-rose-200 to-orange-200 bg-clip-text text-transparent">
                {language === 'hindi' ? 'स्मार्ट व्यापार' : 'Smart Business'}
              </span>
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                {language === 'hindi' ? 'तुरंत वितरित' : 'Delivered Instantly'}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              {language === 'hindi'
                ? 'अपनी व्यापार रणनीति को AI-संचालित सटीकता के साथ उत्पादन-तैयार डिजिटल संपत्तियों में बदलें। संक्षिप्त से शानदार तक सेकंडों में, महीनों नहीं।'
                : 'Transform your business strategy into production-ready insights with AI-powered precision. From brief to brilliance in seconds, not months.'}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition font-bold text-lg flex items-center space-x-2 shadow-lg shadow-rose-500/50"
              >
                <span>{language === 'hindi' ? 'शुरू करें' : 'Get Started'}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
              </button>
              <button className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition font-bold text-lg border border-white/20">
                {language === 'hindi' ? 'और जानें' : 'Learn More'}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-12"
            >
              {[
                { value: '10,000+', label: language === 'hindi' ? 'सक्रिय उपयोगकर्ता' : 'Active Users' },
                { value: '₹50Cr+', label: language === 'hindi' ? 'कुल बिक्री' : 'Total Sales' },
                { value: '95%', label: language === 'hindi' ? 'सटीकता' : 'Accuracy' },
                { value: '11', label: language === 'hindi' ? 'भाषाएं' : 'Languages' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center space-y-6 mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold">
              {language === 'hindi' ? 'चुनौती' : 'The Challenge'}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'hindi'
                ? 'छोटे व्यापारियों को बड़ी समस्याओं का सामना करना पड़ता है'
                : 'Small business owners face big challenges'}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: TrendingUp,
                title: language === 'hindi' ? 'मूल्य निर्धारण की चुनौती' : 'Pricing Challenges',
                problem: language === 'hindi' 
                  ? 'सही कीमत तय करना मुश्किल है - बहुत अधिक और ग्राहक खो जाते हैं, बहुत कम और मुनाफा खो जाता है'
                  : 'Hard to set the right price - too high and lose customers, too low and lose profit'
              },
              {
                icon: BarChart3,
                title: language === 'hindi' ? 'मांग का अनुमान' : 'Demand Forecasting',
                problem: language === 'hindi'
                  ? 'त्योहारों और मौसमों के लिए कितना स्टॉक रखना है यह जानना कठिन है'
                  : 'Difficult to know how much stock to keep for festivals and seasons'
              },
              {
                icon: Zap,
                title: language === 'hindi' ? 'समय की कमी' : 'Time Constraints',
                problem: language === 'hindi'
                  ? 'खाता-बही में लेन-देन दर्ज करने में घंटों लग जाते हैं'
                  : 'Recording transactions in notebooks takes hours every day'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-6 rounded-2xl bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/20"
                >
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.problem}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section id="solution" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center space-y-6 mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                {language === 'hindi' ? 'हमारा समाधान' : 'Our Solution'}
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'hindi'
                ? 'AI-संचालित सुविधाएं जो आपके व्यापार को बदल देती हैं'
                : 'AI-powered features that transform your business'}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                icon: Brain,
                title: language === 'hindi' ? 'AI मांग पूर्वानुमान' : 'AI Demand Forecasting',
                description: language === 'hindi'
                  ? 'Prophet AI के साथ 95% सटीकता के साथ मांग का पूर्वानुमान। त्योहारों के लिए पहले से तैयार रहें।'
                  : 'Predict demand with 95% accuracy using Prophet AI. Stay prepared for festivals.',
                stat: '95%',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: DollarSign,
                title: language === 'hindi' ? 'स्मार्ट प्राइसिंग' : 'Smart Pricing',
                description: language === 'hindi'
                  ? 'XGBoost मॉडल आपको बताता है कि अधिकतम मुनाफे के लिए कितनी कीमत रखनी है।'
                  : 'XGBoost model tells you exactly what price to charge for maximum profit.',
                stat: '+45%',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: Mic,
                title: language === 'hindi' ? '11 भाषाओं में वॉइस कमांड' : 'Voice Commands in 11 Languages',
                description: language === 'hindi'
                  ? 'हिंदी, बंगाली, तमिल, मराठी और अन्य में बस बोलें और लेनदेन दर्ज करें।'
                  : 'Just speak in Hindi, Bengali, Tamil, Marathi and more to record transactions.',
                stat: '11',
                color: 'from-orange-500 to-rose-500'
              },
              {
                icon: BarChart3,
                title: language === 'hindi' ? 'वास्तविक समय डैशबोर्ड' : 'Real-Time Dashboard',
                description: language === 'hindi'
                  ? 'आय, खर्च, मुनाफा और बचत को तुरंत देखें। कोई प्रतीक्षा नहीं।'
                  : 'See income, expenses, profit, and savings instantly. No waiting.',
                stat: '24/7',
                color: 'from-blue-500 to-cyan-500'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 hover:border-rose-500/50 transition-all"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-sm font-bold">
                      {feature.stat}
                    </span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Enterprise Capabilities */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-neutral-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center space-y-6 mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold">
              {language === 'hindi' ? 'शक्तिशाली क्षमताएं' : 'Powerful Capabilities'}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'hindi'
                ? 'छोटे व्यापार के लिए डिज़ाइन किए गए व्यापक उपकरण'
                : 'Comprehensive tools designed for small business operations'}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: BarChart3,
                title: language === 'hindi' ? 'इन्वेंटरी प्रबंधन' : 'Inventory Management',
                description: language === 'hindi'
                  ? 'रियल-टाइम स्टॉक ट्रैकिंग और स्वचालित रिस्टॉक अलर्ट'
                  : 'Real-time stock tracking and automated restock alerts'
              },
              {
                icon: Users,
                title: language === 'hindi' ? 'आसान सहयोग' : 'Easy Collaboration',
                description: language === 'hindi'
                  ? 'परिवार के सदस्यों के साथ व्यापार डेटा साझा करें'
                  : 'Share business data with family members'
              },
              {
                icon: Globe,
                title: language === 'hindi' ? 'बहुभाषी समर्थन' : 'Multi-Language Support',
                description: language === 'hindi'
                  ? '11 भारतीय भाषाओं में उपलब्ध'
                  : 'Available in 11 Indian languages'
              },
              {
                icon: Shield,
                title: language === 'hindi' ? 'सुरक्षित और निजी' : 'Secure & Private',
                description: language === 'hindi'
                  ? 'एंड-टू-एंड एन्क्रिप्शन के साथ आपका डेटा सुरक्षित'
                  : 'Your data is safe with end-to-end encryption'
              }
            ].map((capability, index) => {
              const Icon = capability.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-6 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 hover:border-rose-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{capability.title}</h3>
                  <p className="text-gray-400 text-sm">{capability.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center space-y-6 mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold">
              {language === 'hindi' ? 'भारतीय व्यापारियों द्वारा विश्वसनीय' : 'Trusted by Indian Entrepreneurs'}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'hindi'
                ? 'हजारों व्यापारियों ने AI की शक्ति से अपने मुनाफे को बढ़ाया है'
                : 'Thousands of business owners have increased their profits with AI power'}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                name: language === 'hindi' ? 'प्रिया शर्मा' : 'Priya Sharma',
                business: language === 'hindi' ? 'कपड़े की दुकान, मुंबई' : 'Clothing Store, Mumbai',
                quote: language === 'hindi'
                  ? 'इस ऐप ने मेरी कमाई ₹5,000 से ₹15,000 प्रति माह कर दी! AI प्राइसिंग सुझाव बेहद मददगार हैं।'
                  : 'This app increased my earnings from ₹5,000 to ₹15,000 per month! The AI pricing suggestions are incredibly helpful.',
                improvement: '+200%',
                avatar: 'P'
              },
              {
                name: language === 'hindi' ? 'राजेश कुमार' : 'Rajesh Kumar',
                business: language === 'hindi' ? 'आचार व्यवसाय, दिल्ली' : 'Pickle Business, Delhi',
                quote: language === 'hindi'
                  ? 'मौसमी पूर्वानुमान ने मुझे त्योहारों के लिए पहले से तैयार रहने में मदद की। बिक्री 60% बढ़ गई!'
                  : 'Seasonal predictions helped me prepare in advance for festivals. Sales increased by 60%!',
                improvement: '+60%',
                avatar: 'R'
              },
              {
                name: language === 'hindi' ? 'मीना देवी' : 'Meena Devi',
                business: language === 'hindi' ? 'हस्तशिल्प, जयपुर' : 'Handicrafts, Jaipur',
                quote: language === 'hindi'
                  ? 'वॉइस कमांड सुविधा बेहद आसान है। मैं बस बोलती हूं और सब कुछ दर्ज हो जाता है। समय की बहुत बचत!'
                  : 'The voice command feature is so easy. I just speak and everything gets recorded. Saves so much time!',
                improvement: '80% time saved',
                avatar: 'M'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.business}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-green-400 font-bold">{testimonial.improvement}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative p-12 rounded-3xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                {language === 'hindi' 
                  ? 'अपने व्यापार को आज ही बदलें' 
                  : 'Transform Your Business Today'}
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {language === 'hindi'
                  ? 'हजारों उपयोगकर्ताओं के साथ शामिल हों जिन्होंने AI-संचालित बुद्धि से अपने व्यापार संचालन में क्रांति ला दी है'
                  : 'Join thousands of users who\'ve revolutionized their business operations with AI-powered intelligence'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 rounded-xl bg-white text-rose-600 hover:bg-gray-100 transition font-bold text-lg shadow-lg"
                >
                  {language === 'hindi' ? 'अभी साइन अप करें' : 'Sign Up Now'}
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition font-bold text-lg border border-white/30"
                >
                  {language === 'hindi' ? 'लॉगिन' : 'Login'}
                </button>
              </div>
              <p className="text-white/80 text-sm pt-4">
                {language === 'hindi'
                  ? '✓ सुरक्षित प्रमाणीकरण • ✓ मुफ्त शुरू करें • ✓ प्रीमियम सुविधाएं उपलब्ध'
                  : '✓ Secure authentication • ✓ Free to start • ✓ Premium features available'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <span className="text-lg font-bold">
                  {language === 'hindi' ? 'दीदी का डिजिटल ट्विन' : "Didi's Digital Twin"}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {language === 'hindi'
                  ? 'AI द्वारा संचालित व्यापार बुद्धि। अपनी दृष्टि को तुरंत वास्तविकता में बदलें।'
                  : 'Business intelligence powered by AI. Transform your vision into reality instantly.'}
              </p>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-bold mb-4">{language === 'hindi' ? 'प्लेटफ़ॉर्म' : 'Platform'}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">{language === 'hindi' ? 'सुविधाएं' : 'Features'}</a></li>
                <li><a href="#solution" className="hover:text-white transition">{language === 'hindi' ? 'समाधान' : 'Solution'}</a></li>
                <li><a href="#success" className="hover:text-white transition">{language === 'hindi' ? 'मूल्य निर्धारण' : 'Pricing'}</a></li>
                <li><a href="#" className="hover:text-white transition">{language === 'hindi' ? 'सुरक्षा' : 'Security'}</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4">{language === 'hindi' ? 'कंपनी' : 'Company'}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">{language === 'hindi' ? 'हमारे बारे में' : 'About'}</a></li>
                <li><a href="#" className="hover:text-white transition">{language === 'hindi' ? 'करियर' : 'Careers'}</a></li>
                <li><a href="#" className="hover:text-white transition">{language === 'hindi' ? 'ब्लॉग' : 'Blog'}</a></li>
                <li><a href="#" className="hover:text-white transition">{language === 'hindi' ? 'प्रेस' : 'Press'}</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4">{language === 'hindi' ? 'सहायता' : 'Support'}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">{language === 'hindi' ? 'सहायता केंद्र' : 'Help Center'}</a></li>
                <li><a href="#" className="hover:text-white transition">{language === 'hindi' ? 'दस्तावेज़ीकरण' : 'Documentation'}</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
                <li><a href="#" className="hover:text-white transition">{language === 'hindi' ? 'संपर्क' : 'Contact'}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2025 Didi's Digital Twin. {language === 'hindi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                {language === 'hindi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                {language === 'hindi' ? 'सेवा की शर्तें' : 'Terms of Service'}
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                {language === 'hindi' ? 'कुकी नीति' : 'Cookie Policy'}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
