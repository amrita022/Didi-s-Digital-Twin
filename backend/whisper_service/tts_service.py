"""
Text-to-speech service
"""
import tempfile
import os
import logging
from gtts import gTTS
import pygame
import threading
import time

logger = logging.getLogger(__name__)

# Global TTS cache
tts_cache = {}

def text_to_speech(text, language_code):
    """Convert text to speech and return audio file path"""
    try:
        # Create a unique cache key
        cache_key = f"{language_code}_{hash(text)}"
        
        # Check cache first
        if cache_key in tts_cache:
            logger.info(f"🎵 Using cached TTS for: {text[:50]}...")
            return tts_cache[cache_key]
        
        logger.info(f"🔊 Generating TTS for: {text}")
        
        # Create TTS
        tts = gTTS(text=text, lang=language_code, slow=False)
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        tts.save(temp_file.name)
        
        # Cache the file path
        tts_cache[cache_key] = temp_file.name
        
        logger.info(f"✅ TTS generated and cached: {temp_file.name}")
        return temp_file.name
        
    except Exception as e:
        logger.error(f"❌ TTS generation failed: {e}")
        return None

def play_audio(file_path):
    """Play audio file using pygame"""
    try:
        pygame.mixer.init()
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        
        # Wait for playback to complete
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
            
        pygame.mixer.quit()
        return True
    except Exception as e:
        logger.error(f"❌ Audio playback failed: {e}")
        return False

def cleanup_tts_cache():
    """Clean up TTS cache files"""
    for file_path in tts_cache.values():
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
        except Exception as e:
            logger.warning(f"Could not delete TTS file {file_path}: {e}")
    tts_cache.clear()