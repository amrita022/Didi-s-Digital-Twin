// Simple React hook for text-to-speech using the browser's SpeechSynthesis API
// It uses the global language from the store to decide which voice/language code to use.

import { useCallback, useEffect, useRef } from 'react';
import useStore from '../store/useStore';

// Map your app language keys to BCP-47 language tags for speechSynthesis
const LANGUAGE_TO_BCP47 = {
  english: 'en-IN',
  hindi: 'hi-IN',
  marathi: 'mr-IN',
  // fallback
  default: 'en-IN',
};

export default function useTextToSpeech() {
  const { language } = useStore();
  const voicesRef = useRef([]);

  // Load voices once (browsers load them async)
  useEffect(() => {
    if (!window.speechSynthesis) return;

    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices;
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text) => {
      if (!text) return;
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const langKey = language || 'default';
      const langCode = LANGUAGE_TO_BCP47[langKey] || LANGUAGE_TO_BCP47.default;
      utterance.lang = langCode;

      // Try to pick a matching voice if available
      const voices = voicesRef.current || [];
      const matchedVoice = voices.find((v) => v.lang === langCode);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}
