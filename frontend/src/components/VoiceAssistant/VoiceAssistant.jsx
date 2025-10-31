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
import { useAuth } from '../../hooks/useAuth';
import { getTranslation } from '../../utils/translations';
import { processVoiceCommand as processVoiceAPI, getSyncStatus, syncOfflineTransactions, setupAutoSync } from '../../utils/api';

const VoiceAssistant = () => {
  const { uid } = useAuth();
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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // No longer using browser speech recognition
    // We'll use MediaRecorder to capture audio and send to Whisper

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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
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

  // NEW: Convert audio to WAV format
  const convertToWav = async (audioBlob) => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to WAV
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };
      
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(audioBlob);
    });
  };

  // Helper: Convert AudioBuffer to WAV format
  const audioBufferToWav = (audioBuffer) => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    
    const data = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      data.push(audioBuffer.getChannelData(i));
    }
    
    const interleaved = interleave(data);
    const dataLength = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    floatTo16BitPCM(view, 44, interleaved);
    
    return buffer;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const floatTo16BitPCM = (view, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  const interleave = (inputArrays) => {
    const length = inputArrays[0].length;
    const result = new Float32Array(length * inputArrays.length);
    
    let index = 0;
    let inputIndex = 0;
    
    while (inputIndex < length) {
      for (let i = 0; i < inputArrays.length; i++) {
        result[index++] = inputArrays[i][inputIndex];
      }
      inputIndex++;
    }
    return result;
  };

  // NEW: Send audio to Whisper for transcription
  const transcribeAudio = async (audioBlob) => {
    console.log('🎤 Transcribing audio with Whisper...');
    
    try {
      // Convert to WAV format first
      console.log('🔄 Converting audio to WAV...');
      const wavBlob = await convertToWav(audioBlob);
      console.log('✅ Audio converted to WAV');
      
      // Convert audio blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(wavBlob);
      });

      // Send to Whisper service
      const response = await fetch('http://localhost:5003/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          language: language === 'hindi' ? 'mr' : 'auto', // Force Marathi for Hindi users
          forceLanguage: false  // Let it auto-detect with smart override
        })
      });

      if (!response.ok) {
        throw new Error('Whisper transcription failed');
      }

      const data = await response.json();
      console.log('✅ Whisper response:', data);
      
      return data.text;
    } catch (error) {
      console.error('❌ Transcription error:', error);
      throw error;
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
    // CRITICAL: Check if user is authenticated
    if (!uid) {
      console.error('❌ ERROR: User not authenticated! uid is:', uid);
      throw new Error('You must be logged in to use voice commands');
    }
    
    // Call backend API with userId
    console.log('🔑 VoiceAssistant: Calling API with userId:', uid);
    const result = await processVoiceAPI(transcript, uid);
    
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
    
    // Refresh dashboard if transaction was saved
    if (result.saved || (result.intent === 'expense' || result.intent === 'income') && result.amount) {
      console.log('🔄 Transaction saved, triggering dashboard refresh');
      // Dispatch custom event to refresh dashboard
      window.dispatchEvent(new CustomEvent('refreshDashboard'));
    }
    
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

  const startListening = async () => {
    if (voiceState.isListening) return;
    
    try {
      console.log('🎤 Starting audio recording...');
      updateVoiceState({ isListening: true, isProcessing: false });
      
      // Get microphone access with enhanced audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Mono audio
          sampleRate: 16000, // 16kHz matches Whisper's requirements
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Create MediaRecorder with optimal settings for speech
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000 // 128kbps for better quality
      };
      
      // Fallback if webm/opus not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      
      console.log(`🎙️ Recording with: ${options.mimeType} @ ${options.audioBitsPerSecond}bps`);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('🔄 Processing recorded audio...');
        updateVoiceState({ isListening: false, isProcessing: true });
        
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log(`📦 Audio blob created: ${audioBlob.size} bytes`);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        try {
          // Transcribe with Whisper
          const transcript = await transcribeAudio(audioBlob);
          console.log('📝 Transcript:', transcript);
          
          updateVoiceState({ transcript, isProcessing: false });
          
          // Process the transcribed text
          await handleVoiceInput(transcript);
        } catch (error) {
          console.error('❌ Error:', error);
          updateVoiceState({ isProcessing: false });
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      console.log('🔴 Recording started');
      
    } catch (error) {
      console.error('❌ Microphone error:', error);
      updateVoiceState({ isListening: false, isProcessing: false });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('⏹️ Stopping recording...');
      mediaRecorderRef.current.stop();
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
