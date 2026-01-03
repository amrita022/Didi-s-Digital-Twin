import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send,
  MessageCircle,
  RotateCcw,
  Globe
} from 'lucide-react';
import useStore from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { getTranslation } from '../../utils/translations';
import { processVoiceCommand as processVoiceAPI } from '../../utils/api';
import { GlowingCard } from '../ui/glowing-card';
import * as inventoryApi from '../../utils/inventoryApi';

// Language mapping for Web Speech API
const LANGUAGE_MAP = {
  'english': 'en-US',
  'hindi': 'hi-IN',
  'bengali': 'bn-IN',
  'tamil': 'ta-IN',
  'telugu': 'te-IN',
  'marathi': 'mr-IN',
  'gujarati': 'gu-IN',
  'kannada': 'kn-IN',
  'malayalam': 'ml-IN',
  'punjabi': 'pa-IN',
  'urdu': 'ur-IN'
};

const LANGUAGE_NAMES = {
  'english': 'English',
  'hindi': 'हिंदी (Hindi)',
  'bengali': 'বাংলা (Bengali)',
  'tamil': 'தமிழ் (Tamil)',
  'telugu': 'తెలుగు (Telugu)',
  'marathi': 'मराठी (Marathi)',
  'gujarati': 'ગુજરાતી (Gujarati)',
  'kannada': 'ಕನ್ನಡ (Kannada)',
  'malayalam': 'മലയാളം (Malayalam)',
  'punjabi': 'ਪੰਜਾਬੀ (Punjabi)',
  'urdu': 'اردو (Urdu)'
};

const VoiceAssistant = () => {
  const { uid } = useAuth();
  const { 
    language, 
    voiceState, 
    updateVoiceState, 
    //addTransaction,
    //businessData 
  } = useStore();
  
  const [voiceLanguage, setVoiceLanguage] = useState(
    language === 'marathi' ? 'marathi' : (language === 'hindi' ? 'hindi' : 'english')
  );
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: language === 'marathi'
        ? 'नमस्कार! मी तुमची व्यवसाय सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकते?'
        : (language === 'hindi' 
        ? 'नमस्ते! मैं आपकी व्यापार सहायक हूं। आप कैसे मदद कर सकती हूं?' 
        : 'Hello! I\'m your business assistant. How can I help you today?'),
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);
  const networkErrorCountRef = useRef(0);
  const lastNetworkErrorRef = useRef(0);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      // Reinitialize recognition if it doesn't exist or language changed
      if (!recognitionRef.current || recognitionRef.current.lang !== LANGUAGE_MAP[voiceLanguage]) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      }
      recognitionRef.current.lang = LANGUAGE_MAP[voiceLanguage] || 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceInput(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        const isNetworkError = event.error === 'network';
        const isAborted = event.error === 'aborted';
        
        updateVoiceState({ isListening: false, isProcessing: false });
        
        // Handle aborted errors silently (user stopped)
        if (isAborted) {
          return;
        }
        
        // Handle network errors - track but don't spam console
        if (isNetworkError) {
          const now = Date.now();
          lastNetworkErrorRef.current = now;
          networkErrorCountRef.current++;
          
          // Only show message if we haven't shown one recently
          if (networkErrorCountRef.current === 1 || now - lastNetworkErrorRef.current > 10000) {
            const errorMessage = {
              id: Date.now(),
              type: 'ai',
              text: language === 'marathi'
                ? '❌ नेटवर्क त्रुटी. व्हॉइस रिकग्निशनसाठी इंटरनेट कनेक्शन आवश्यक आहे.'
                : (language === 'hindi' 
                ? '❌ नेटवर्क त्रुटि। वॉइस रिकॉग्निशन के लिए इंटरनेट कनेक्शन आवश्यक है।' 
                : '❌ Network error. Internet connection required for voice recognition.'),
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
          }
          return;
        }
        
        // Handle other errors with user feedback (but no console logging)
        let errorText = '';
        
        switch (event.error) {
          case 'not-allowed':
            errorText = language === 'marathi'
              ? '❌ मायक्रोफोन परवानगी मिळाली नाही. कृपया ब्राउझर सेटिंग्समध्ये परवानगी द्या.'
              : (language === 'hindi' 
              ? '❌ माइक्रोफ़ोन अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।' 
              : '❌ Microphone permission denied. Please allow microphone access in browser settings.');
            break;
          case 'no-speech':
            errorText = language === 'marathi'
              ? '❌ काही आवाज ऐकू आला नाही. कृपया पुन्हा बोला.'
              : (language === 'hindi' 
              ? '❌ कोई आवाज़ नहीं सुनी गई। कृपया फिर से बोलें।' 
              : '❌ No speech detected. Please speak again.');
            break;
          default:
            errorText = language === 'marathi'
              ? '❌ मायक्रोफोन त्रुटी. कृपया पुन्हा प्रयत्न करा.'
              : (language === 'hindi' 
              ? '❌ माइक्रोफ़ोन त्रुटि। कृपया फिर से प्रयास करें।' 
              : '❌ Microphone error. Please try again.');
        }
        
        const errorMessage = {
          id: Date.now(),
          type: 'ai',
          text: errorText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      };
      
      recognitionRef.current.onend = () => {
        updateVoiceState({ isListening: false });
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    // Listen for online/offline events to reset error count
    const handleOnline = () => {
      networkErrorCountRef.current = 0;
      lastNetworkErrorRef.current = 0;
    };

    const handleOffline = () => {
      if (recognitionRef.current && voiceState.isListening) {
        recognitionRef.current.stop();
        updateVoiceState({ isListening: false });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language, updateVoiceState, voiceState.isListening, voiceLanguage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speak = (text) => {
    if (!synthRef.current) {
      console.warn('⚠️ Speech synthesis not available');
      return;
    }
    
    // Cancel any ongoing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    // Clean up text for better speech (remove emojis and special chars that might cause issues)
    const cleanText = text.replace(/[✅❌📦⚠️]/g, '').trim();
    
    if (!cleanText) {
      console.warn('⚠️ No text to speak');
      return;
    }
    
    console.log('🔊 Speaking:', cleanText);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = LANGUAGE_MAP[voiceLanguage] || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Add event listeners for debugging
    utterance.onstart = () => console.log('🔊 Speech started');
    utterance.onend = () => console.log('🔊 Speech ended');
    utterance.onerror = (e) => console.error('🔊 Speech error:', e);
    
    synthRef.current.speak(utterance);
  };


  const handleVoiceInput = async (transcript) => {
  const userMessage = {
    id: Date.now(),
    type: 'user',
    text: transcript,
    timestamp: new Date()
  };
  
  setMessages(prev => [...prev, userMessage]);
  updateVoiceState({ isProcessing: true });
  
  try {
    // CRITICAL: Check if user is authenticated
    if (!uid) {
      console.error('❌ ERROR: User not authenticated! uid is:', uid);
      throw new Error('You must be logged in to use voice commands');
    }
    
    // Call backend API with userId
    console.log('🔑 VoiceAssistant: Calling API with userId:', uid);
    const result = await processVoiceAPI(transcript, uid);
    
    console.log('🔍 FULL API RESPONSE:', JSON.stringify(result, null, 2));
    
    // Extract quantity and item name from transcript for inventory tracking
    const quantity = inventoryApi.extractQuantityFromDescription(transcript);
    const itemName = inventoryApi.extractItemNameFromDescription(transcript);
    
    console.log(`📊 Extracted from "${transcript}": quantity=${quantity}, itemName=${itemName}`);
    
    let inventoryMessage = '';
    
    // Handle inventory deduction for income/sales
    if ((result.intent === 'income' || transcript.toLowerCase().includes('sold'))) {
      if (quantity > 0 && itemName) {
        try {
          const deductResult = await inventoryApi.deductInventory(uid, itemName, quantity);
          if (deductResult.success) {
            const remaining = deductResult.remaining;
            inventoryMessage = language === 'hindi' 
              ? `\n📦 ${quantity} ${itemName} की बिक्री दर्ज की गई। शेष: ${remaining}`
              : `\n📦 Recorded sale of ${quantity} ${itemName}. Remaining: ${remaining}`;
            console.log('✅ Inventory deducted:', deductResult);
          }
        } catch (invError) {
          console.warn('⚠️ Inventory deduction skipped:', invError.message);
        }
      } else if (quantity > 1 && !itemName) {
        // Quantity found but item not recognized - warn user
        inventoryMessage = language === 'marathi'
          ? '\n⚠️ कृपया कोणती वस्तू विकली ते सांगा - साडी, ब्लाउज, शर्ट, ड्रेस किंवा पँट?'
          : (language === 'hindi' 
          ? '\n⚠️ कृपया बताएं कि कौन सी चीज़ बेची - साड़ी, ब्लाउज, शर्ट, ड्रेस या पैंट?'
          : '\n⚠️ Please specify which item was sold - saree, blouse, shirt, dress, or pant?');
        console.warn(`⚠️ Quantity ${quantity} extracted but no item name found`);
      }
    }
    
    // Handle inventory addition for stock purchases
    if ((result.intent === 'expense' || transcript.toLowerCase().includes('bought')) && 
        quantity > 0 && itemName && 
        !transcript.toLowerCase().includes('food') && 
        !transcript.toLowerCase().includes('dinner') &&
        !transcript.toLowerCase().includes('groceries')) {
      try {
        const price = result.amount ? Math.round(result.amount / quantity) : 0;
        const addResult = await inventoryApi.addOrUpdateInventory(uid, itemName, quantity, price, 10);
        if (addResult.success) {
          inventoryMessage = language === 'marathi'
            ? `\n📦 ${quantity} ${itemName} वाढवले. एकूण: ${addResult.totalQuantity}`
            : (language === 'hindi' 
            ? `\n📦 ${quantity} ${itemName} जोड़े गए। कुल: ${addResult.totalQuantity}`
            : `\n📦 Added ${quantity} ${itemName}. Total: ${addResult.totalQuantity}`);
          console.log('✅ Inventory updated:', addResult);
        }
      } catch (invError) {
        console.warn('⚠️ Inventory addition skipped:', invError.message);
      }
    }
    
    const responseText = (result.response_english || result.response_hindi || result.response || 'I processed your request.') + inventoryMessage;
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: responseText,
      timestamp: new Date(),
      offline: result.offline || false
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // Speak the AI response aloud for illiterate users
    // Use setTimeout to ensure speech synthesis is ready
    setTimeout(() => {
      speak(responseText);
    }, 100);
    
    // Refresh dashboard if transaction was saved
    if (result.saved || (result.intent === 'expense' || result.intent === 'income') && result.amount) {
      console.log('🔄 Transaction saved, triggering dashboard refresh');
      // Dispatch custom event to refresh dashboard
      window.dispatchEvent(new CustomEvent('refreshDashboard'));
    }
    
  } catch (error) {
    console.error('Error processing voice:', error);
    
    const errorMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: language === 'marathi'
        ? '❌ काहीतरी चुकीचे झाले. कृपया पुन्हा प्रयत्न करा.'
        : (language === 'hindi' 
        ? '❌ कुछ गलत हो गया। कृपया फिर से प्रयास करें।' 
        : '❌ Something went wrong. Please try again.'),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    updateVoiceState({ isProcessing: false });
  }
};

  const startListening = () => {
    if (voiceState.isListening || !recognitionRef.current) return;
    
    // Check internet connectivity first - Web Speech API requires internet
    if (!navigator.onLine) {
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        text: language === 'hindi' 
          ? '❌ वॉइस रिकॉग्निशन के लिए इंटरनेट कनेक्शन आवश्यक है। कृपया अपना इंटरनेट जांचें।' 
          : '❌ Internet connection required for voice recognition. Please check your internet connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    // Prevent repeated attempts if we've had multiple network errors recently
    const now = Date.now();
    if (networkErrorCountRef.current >= 2 && now - lastNetworkErrorRef.current < 15000) {
      // Too many network errors recently, show message and don't attempt
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        text: language === 'hindi' 
          ? '❌ नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें और कुछ सेकंड बाद पुन: प्रयास करें।' 
          : '❌ Network error. Please check your internet connection and try again in a few seconds.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    // Reset error count if enough time has passed
    if (now - lastNetworkErrorRef.current > 30000) {
      networkErrorCountRef.current = 0;
    }
    
    try {
      // Update language if needed
      recognitionRef.current.lang = LANGUAGE_MAP[voiceLanguage] || 'en-US';
      
      updateVoiceState({ isListening: true, isProcessing: false });
      recognitionRef.current.start();
      
    } catch (error) {
      updateVoiceState({ isListening: false, isProcessing: false });
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        text: language === 'hindi' 
          ? '❌ माइक्रोफ़ोन तक पहुंच नहीं मिली। कृपया अनुमति दें।' 
          : '❌ Could not access microphone. Please grant permission.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
      updateVoiceState({ isListening: false });
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleVoiceInput(inputText);
      setInputText('');
    }
  };

  const quickCommands = [
    { 
      text: language === 'marathi' ? getTranslation('logExpenseEx', 'marathi') : (language === 'hindi' ? getTranslation('logExpenseEx', 'hindi') : getTranslation('logExpenseEx', 'english')),
      command: 'expense 100'
    },
    { 
      text: language === 'marathi' ? getTranslation('recordSaleEx', 'marathi') : (language === 'hindi' ? getTranslation('recordSaleEx', 'hindi') : getTranslation('recordSaleEx', 'english')),
      command: 'sale 200'
    },
    { 
      text: language === 'marathi' ? getTranslation('pricingHelpEx', 'marathi') : (language === 'hindi' ? getTranslation('pricingHelpEx', 'hindi') : getTranslation('pricingHelpEx', 'english')),
      command: 'pricing'
    },
    { 
      text: language === 'marathi' ? getTranslation('showSavingsEx', 'marathi') : (language === 'hindi' ? getTranslation('showSavingsEx', 'hindi') : getTranslation('showSavingsEx', 'english')),
      command: 'savings'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Voice Interface */}
      <GlowingCard className="p-8 text-center">
        <div className="mb-6">
          {/* Language Selector */}
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Globe size={16} className="inline mr-2" />
                {language === 'marathi' ? getTranslation('selectLanguageVoice', 'marathi') : (language === 'hindi' ? getTranslation('selectLanguageVoice', 'hindi') : getTranslation('selectLanguageVoice', 'english'))}
              </label>
              <select
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
                className="px-4 py-2 bg-gray-600 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[200px]"
              >
                {Object.entries(LANGUAGE_NAMES).map(([key, name]) => (
                  <option key={key} value={key} className="bg-gray-600">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
            voiceState.isListening 
              ? 'bg-gradient-to-r from-rose-500 to-rose-600 animate-pulse shadow-lg' 
              : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg'
          }`}>
            {voiceState.isListening ? (
              <MicOff size={40} className="text-white" />
            ) : (
              <Mic size={40} className="text-white" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {voiceState.isListening 
              ? getTranslation('listening', language) 
              : getTranslation('speakNow', language)
            }
          </h2>
          
          <p className="text-gray-300 mb-6">
            {language === 'marathi'
              ? 'माइकवर टॅप करा आणि बोलायला सुरुवात करा'
              : (language === 'hindi' 
              ? 'माइक पर टैप करें और बोलें' 
              : 'Tap the mic and start speaking')}
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={voiceState.isListening ? stopListening : startListening}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                voiceState.isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              {voiceState.isListening ? (
                <>
                  <MicOff size={20} className="inline mr-2" />
                  {language === 'marathi' ? getTranslation('stop', 'marathi') : (language === 'hindi' ? getTranslation('stop', 'hindi') : getTranslation('stop', 'english'))}
                </>
              ) : (
                <>
                  <Mic size={20} className="inline mr-2" />
                  {language === 'marathi' ? getTranslation('speak', 'marathi') : (language === 'hindi' ? getTranslation('speak', 'hindi') : getTranslation('speak', 'english'))}
                </>
              )}
            </button>
          </div>
        </div>
      </GlowingCard>

      {/* Quick Commands */}
      <GlowingCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          {getTranslation('quickCommands', language)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleVoiceInput(cmd.command)}
              className="p-3 text-left bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 hover:border-rose-500/50 rounded-lg transition-all duration-300"
            >
              <span className="text-white font-medium">{cmd.text}</span>
            </button>
          ))}
        </div>
      </GlowingCard>

      {/* Text Input */}
      <GlowingCard className="p-6">
        <form onSubmit={handleTextSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === 'marathi' ? getTranslation('typeHere', 'marathi') : (language === 'hindi' ? getTranslation('typeHere', 'hindi') : getTranslation('typeHere', 'english'))}
            className="flex-1 px-4 py-3 bg-gray-600 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </GlowingCard>

      {/* Chat Messages */}
      <GlowingCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <MessageCircle size={20} className="mr-2" />
            {language === 'marathi' ? getTranslation('conversation', 'marathi') : (language === 'hindi' ? getTranslation('conversation', 'hindi') : getTranslation('conversation', 'english'))}
          </h3>
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-600 text-gray-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-white/70' : 'text-gray-300'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </GlowingCard>
    </div>
  );
};

export default VoiceAssistant;