import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send,
  MessageCircle,
  RotateCcw,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';
import { processVoiceCommand as processVoiceAPI, getSyncStatus, syncOfflineTransactions, setupAutoSync } from '../../utils/api';

const VoiceAssistant = () => {
  const { 
    language, 
    voiceState, 
    updateVoiceState, 
    //addTransaction,
    //businessData 
  } = useStore();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: language === 'hindi' 
        ? 'नमस्ते! मैं आपकी व्यापार सहायक हूं। आप कैसे मदद कर सकती हूं?' 
        : 'Hello! I\'m your business assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({ unsyncedCount: 0, needsSync: false });
  const [isSyncing, setIsSyncing] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hindi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onstart = () => {
        updateVoiceState({ isListening: true, isProcessing: false });
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        updateVoiceState({ transcript, isListening: false });
        handleVoiceInput(transcript);
      };

      recognitionRef.current.onerror = () => {
        updateVoiceState({ isListening: false, isProcessing: false });
      };

      recognitionRef.current.onend = () => {
        updateVoiceState({ isListening: false });
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    // Setup auto-sync
    setupAutoSync();

    // Setup online/offline listeners
    const handleOnline = async () => {
      setIsOnline(true);
      await updateSyncStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync status check
    updateSyncStatus();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language, updateVoiceState]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speak = (text) => {
    if (synthRef.current && isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      synthRef.current.speak(utterance);
    }
  };

  const updateSyncStatus = async () => {
    const status = await getSyncStatus();
    setSyncStatus(status);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncOfflineTransactions();
    setIsSyncing(false);
    
    if (result.success) {
      const message = language === 'hindi' 
        ? '✅ सभी डेटा सिंक हो गया!' 
        : '✅ All data synced successfully!';
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        text: message,
        timestamp: new Date()
      }]);
      
      await updateSyncStatus();
    }
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
    // Call backend API
    const result = await processVoiceAPI(transcript);
    
    // ADD THIS DEBUG LOG TO SEE WHAT'S ACTUALLY IN THE RESPONSE
    console.log('🔍 FULL API RESPONSE:', JSON.stringify(result, null, 2));
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: result.response_english || result.response_hindi || result.response || 'I processed your request.',
      timestamp: new Date(),
      offline: result.offline || false
    };
    
    setMessages(prev => [...prev, aiMessage]);
    speak(aiMessage.text);
    
    // Update sync status if saved offline
    if (result.offline) {
      await updateSyncStatus();
    }
    
  } catch (error) {
    console.error('Error processing voice:', error);
    
    const errorMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: language === 'hindi' 
        ? '❌ कुछ गलत हो गया। कृपया फिर से प्रयास करें।' 
        : '❌ Something went wrong. Please try again.',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    updateVoiceState({ isProcessing: false });
  }
};

  const startListening = () => {
    if (recognitionRef.current && !voiceState.isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
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
      text: language === 'hindi' ? 'खर्च दर्ज करें ₹100' : 'Log expense ₹100',
      command: 'expense 100'
    },
    { 
      text: language === 'hindi' ? 'बिक्री दर्ज करें ₹200' : 'Record sale ₹200',
      command: 'sale 200'
    },
    { 
      text: language === 'hindi' ? 'कीमत सुझाव' : 'Pricing help',
      command: 'pricing'
    },
    { 
      text: language === 'hindi' ? 'बचत दिखाएं' : 'Show savings',
      command: 'savings'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Online/Offline Status Banner */}
      <div className={`rounded-xl p-4 shadow-sm border ${
        isOnline 
          ? 'bg-green-50 border-green-200' 
          : 'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <>
                <Wifi size={20} className="text-green-600" />
                <span className="text-green-800 font-medium">
                  {language === 'hindi' ? '🟢 ऑनलाइन' : '🟢 Online'}
                </span>
              </>
            ) : (
              <>
                <WifiOff size={20} className="text-orange-600" />
                <span className="text-orange-800 font-medium">
                  {language === 'hindi' ? '🔴 ऑफ़लाइन - डेटा स्थानीय रूप से सहेजा जाएगा' : '🔴 Offline - Data will be saved locally'}
                </span>
              </>
            )}
          </div>
          
          {syncStatus.needsSync && isOnline && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              <span>
                {isSyncing 
                  ? (language === 'hindi' ? 'सिंक हो रहा है...' : 'Syncing...') 
                  : `${language === 'hindi' ? 'सिंक करें' : 'Sync'} (${syncStatus.unsyncedCount})`
                }
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Interface */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="mb-6">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
            voiceState.isListening 
              ? 'bg-gradient-to-r from-[#C85D3A] to-[#D9A441] animate-pulse shadow-lg' 
              : 'bg-gradient-to-r from-[#3B7A6D] to-[#3A2B4D] hover:shadow-lg'
          }`}>
            {voiceState.isListening ? (
              <MicOff size={40} className="text-white" />
            ) : (
              <Mic size={40} className="text-white" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-[#3A2B4D] mb-2">
            {voiceState.isListening 
              ? getTranslation('listening', language) 
              : getTranslation('speakNow', language)
            }
          </h2>
          
          <p className="text-gray-600 mb-6">
            {language === 'hindi' 
              ? 'माइक पर टैप करें और बोलें' 
              : 'Tap the mic and start speaking'
            }
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={voiceState.isListening ? stopListening : startListening}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                voiceState.isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#3B7A6D] hover:bg-[#2D5F52] text-white'
              }`}
            >
              {voiceState.isListening ? (
                <>
                  <MicOff size={20} className="inline mr-2" />
                  {language === 'hindi' ? 'रोकें' : 'Stop'}
                </>
              ) : (
                <>
                  <Mic size={20} className="inline mr-2" />
                  {language === 'hindi' ? 'बोलें' : 'Speak'}
                </>
              )}
            </button>
            
            <button
              onClick={() => setIsSpeaking(!isSpeaking)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isSpeaking
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX size={20} className="inline mr-2" />
                  {language === 'hindi' ? 'चुप करें' : 'Mute'}
                </>
              ) : (
                <>
                  <Volume2 size={20} className="inline mr-2" />
                  {language === 'hindi' ? 'सुनें' : 'Listen'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#3A2B4D] mb-4">
          {getTranslation('quickCommands', language)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleVoiceInput(cmd.command)}
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-[#3A2B4D] font-medium">{cmd.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <form onSubmit={handleTextSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === 'hindi' ? 'यहाँ टाइप करें...' : 'Type here...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B7A6D] focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#3B7A6D] text-white rounded-lg hover:bg-[#2D5F52] transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#3A2B4D] flex items-center">
            <MessageCircle size={20} className="mr-2" />
            {language === 'hindi' ? 'बातचीत' : 'Conversation'}
          </h3>
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
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
                    ? 'bg-[#3B7A6D] text-white'
                    : 'bg-gray-100 text-[#3A2B4D]'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
