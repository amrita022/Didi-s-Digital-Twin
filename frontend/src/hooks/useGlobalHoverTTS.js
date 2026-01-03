import { useEffect } from 'react';
import useStore from '../store/useStore';
import useTextToSpeech from './useTextToSpeech';

// Attach global mouseenter/mouseleave listeners that speak hovered text
// when the TTS toggle is enabled.
export default function useGlobalHoverTTS() {
  const { ttsEnabled, language } = useStore();
  const { speak, stop } = useTextToSpeech();

  useEffect(() => {
    if (!ttsEnabled) {
      // If disabled, make sure we stop any ongoing speech and don't attach listeners
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    let lastText = '';

    const cleanText = (text) => {
      if (!text) return '';

      let cleaned = text;

      // Remove common icon/emojis like arrows, play icons, bullets etc.
      const ICONS_REGEX = /[\u2190-\u21FF\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF]/g; // arrows, shapes, misc symbols, dingbats
      cleaned = cleaned.replace(ICONS_REGEX, ' ');

      // Collapse multiple spaces/newlines
      cleaned = cleaned.replace(/\s+/g, ' ').trim();

      return cleaned;
    };

    const getBlockContainer = (target, lang) => {
      if (!target || !(target instanceof HTMLElement)) return null;

      // Prefer an explicit tts block if the developer marks it
      const explicit = target.closest('[data-tts-block="true"]');
      if (explicit) return explicit;

      // For English, Hindi & Marathi UI, default to the specific element you hover
      if (lang === 'english' || lang === 'hindi' || lang === 'marathi') {
        return target;
      }

      // Otherwise, climb up to a reasonable block-level container
      return (
        target.closest('article, section, aside, main, header, footer, li, .card, .panel, .tts-block') ||
        target
      );
    };

    const handleMouseEnter = (event) => {
      const target = event.target;
      if (!target) return;

      // Skip UI control elements (toggles, inputs, form controls)
      if (target.closest('input, select, textarea')) return;

      // Check if we're inside an ignored container (like sidebar with data-tts-ignore)
      const ignoredContainer = target.closest('[data-tts-ignore="true"]');
      
      let block;
      if (ignoredContainer) {
        // If inside an ignored container, find the closest button or meaningful element
        // and read ONLY its text, not the container's
        const button = target.closest('button');
        if (button) {
          block = button;
        } else {
          block = target;
        }
      } else {
        block = getBlockContainer(target, language);
      }
      
      if (!block) return;

      // Check for aria-label first (highest priority for accessible labels)
      let rawText = block.getAttribute('aria-label');
      if (!rawText) {
        rawText = (block.innerText || block.textContent || '').trim();
      }
      
      const cleanedText = cleanText(rawText);
      if (!cleanedText) return;

      // Avoid re-speaking the exact same text repeatedly while moving inside a block
      if (cleanedText === lastText) return;

      // Optionally limit very long text
      const text = cleanedText.length > 400 ? `${cleanedText.slice(0, 400)}...` : cleanedText;

      lastText = text;
      speak(text);
    };

    const handleMouseLeave = () => {
      stop();
      lastText = '';
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      lastText = '';
    };
  }, [ttsEnabled, language, speak, stop]);
}
