import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send,
  MessageCircle,
  RotateCcw
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const VoiceAssistant = () => {
  const { 
    language, 
    voiceState, 
    updateVoiceState, 
    addTransaction,
    businessData 
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, updateVoiceState]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speak = (text) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const handleVoiceInput = (transcript) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: transcript,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the voice input
    setTimeout(() => {
      const response = processVoiceCommand(transcript);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      speak(response);
    }, 1000);
  };

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('expense') || lowerCommand.includes('खर्च')) {
      const amount = extractAmount(command);
      if (amount) {
        addTransaction({
          id: Date.now(),
          type: 'expense',
          amount: amount,
          description: 'Voice recorded expense',
          date: new Date().toISOString().split('T')[0]
        });
        return language === 'hindi' 
          ? `₹${amount} का खर्च दर्ज कर दिया गया है` 
          : `Expense of ₹${amount} has been recorded`;
      }
    }
    
    if (lowerCommand.includes('sale') || lowerCommand.includes('बिक्री')) {
      const amount = extractAmount(command);
      if (amount) {
        addTransaction({
          id: Date.now(),
          type: 'sale',
          amount: amount,
          description: 'Voice recorded sale',
          date: new Date().toISOString().split('T')[0]
        });
        return language === 'hindi' 
          ? `₹${amount} की बिक्री दर्ज कर दी गई है` 
          : `Sale of ₹${amount} has been recorded`;
      }
    }
    
    if (lowerCommand.includes('pricing') || lowerCommand.includes('कीमत')) {
      return language === 'hindi' 
        ? 'आपके आचार की सुझाई गई कीमत ₹120 प्रति जार है। यह आपकी कमाई 50% बढ़ा सकती है।' 
        : 'Your suggested pickle price is ₹120 per jar. This could increase your earnings by 50%.';
    }
    
    if (lowerCommand.includes('savings') || lowerCommand.includes('बचत')) {
      const { savings, savingsGoal } = businessData;
      const percentage = Math.round((savings / savingsGoal) * 100);
      return language === 'hindi' 
        ? `आपकी बचत ₹${savings} है, जो आपके लक्ष्य का ${percentage}% है` 
        : `Your savings are ₹${savings}, which is ${percentage}% of your goal`;
    }
    
    return language === 'hindi' 
      ? 'मैं आपकी मदद कैसे कर सकती हूं? आप खर्च, बिक्री, कीमत या बचत के बारे में पूछ सकते हैं।' 
      : 'How can I help you? You can ask about expenses, sales, pricing, or savings.';
  };

  const extractAmount = (text) => {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
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
