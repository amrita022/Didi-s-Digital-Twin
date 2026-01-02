import React from 'react';
import useStore from '../../store/useStore';
import useTextToSpeech from '../../hooks/useTextToSpeech';

const TtsToggle = () => {
  const { ttsEnabled, setTtsEnabled } = useStore();
  const { stop } = useTextToSpeech();

  const handleClick = () => {
    if (ttsEnabled) {
      // If turning off, immediately stop any ongoing speech
      stop();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    setTtsEnabled(!ttsEnabled);
  };

  return (
    <button
      type="button"
      data-tts-ignore="true"
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full bg-gray-900/90 text-white px-4 py-2 shadow-lg border border-gray-700 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 text-xs font-medium"
    >
      <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-300">
        Hover Read
      </span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
          ttsEnabled ? 'bg-orange-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            ttsEnabled ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
};

export default TtsToggle;
