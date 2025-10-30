from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os
import base64
import logging
import numpy as np
import soundfile as sf
from language_utils import get_language_prompt, clean_transcription, INDIAN_LANGUAGES
from number_system import create_number_system

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global model variable
model = None
# Global number system
number_system = None

def load_model():
    """Load the Whisper model from LOCAL files - 100% OFFLINE"""
    global model, number_system
    try:
        logger.info("🔄 Loading LOCAL Whisper model (100% OFFLINE)...")
        
        # Load number system
        number_system = create_number_system()
        logger.info("✅ Number system loaded for all Indian languages")
        
        # Try these local model paths (in order of preference)
        model_paths = [
            "../ai_models/small.pt",    # Best accuracy
            "../ai_models/base.pt",     # Good balance
            "../ai_models/tiny.pt",     # Fastest
            "small.pt",              # Fallback paths
            "base.pt", 
            "tiny.pt"
        ]
        
        loaded_model = False
        for model_path in model_paths:
            if os.path.exists(model_path):
                try:
                    logger.info(f"📁 Loading from: {model_path}")
                    model = whisper.load_model(model_path)
                    logger.info(f"✅ OFFLINE MODEL LOADED: {model_path}")
                    logger.info("🎯 100% OFFLINE - No internet required!")
                    loaded_model = True
                    break
                except Exception as e:
                    logger.warning(f"Failed to load {model_path}: {e}")
                    continue
        
        if not loaded_model:
            logger.error("❌ NO LOCAL MODEL FOUND!")
            logger.info("Please download model files first:")
            logger.info("1. Run in models/ folder:")
            logger.info("   curl -L -o small.pt https://openaipublic.azureedge.net/main/whisper/models/9ecf779972d90ba49c06d968637d720dd632c55bbf19d441fb42bf17a411e794/small.pt")
            return False
            
        logger.info("🌍 Model supports: Hindi, Marathi, Bengali, English + MORE (100% OFFLINE)")
        logger.info("🎯 AUTO-DETECTION: Will detect language automatically!")
        return True
        
    except Exception as e:
        logger.error(f"Failed to load local Whisper model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    supported_languages = list(INDIAN_LANGUAGES.keys())
    return jsonify({
        "status": "ready" if model else "loading",
        "model_loaded": model is not None,
        "model_type": "local-offline",
        "offline": True,
        "multi_language": True,
        "auto_detection": True,
        "supported_languages": supported_languages[:10],  # Show first 10
        "primary_languages": ["hi", "mr", "bn", "en"]
    })

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio endpoint - 100% OFFLINE with AUTO-LANGUAGE DETECTION"""
    try:
        if not model:
            logger.error("❌ Local Whisper model not loaded")
            return jsonify({
                "success": False,
                "error": "Local Whisper model not loaded"
            }), 500

        data = request.get_json()
        if not data or 'audioData' not in data:
            logger.error("❌ No audio data provided")
            return jsonify({
                "success": False,
                "error": "No audio data provided"
            }), 400

        # Get preferred language (can force specific language)
        preferred_language = data.get('language', 'auto')
        force_language = data.get('forceLanguage', False)  # NEW: Allow forcing language
        
        logger.info("=" * 60)
        logger.info("📻 100% OFFLINE AUDIO TRANSCRIPTION STARTED")
        if preferred_language != 'auto':
            if force_language:
                logger.info(f"🎯 FORCING LANGUAGE: {preferred_language.upper()} (no auto-detect)")
            else:
                logger.info(f"🎯 Preferred language: {preferred_language} (will verify with auto-detect)")
        else:
            logger.info("🎯 AUTO-DETECTION MODE")
        logger.info("=" * 60)
        
        # Decode base64 audio
        audio_b64 = data['audioData']
        audio_bytes = base64.b64decode(audio_b64)
        
        logger.info(f"Audio size: {len(audio_bytes) / 1024:.2f} KB")
        
        # Detect audio format from magic bytes
        audio_format = '.webm'  # Default for browser MediaRecorder
        if audio_bytes.startswith(b'RIFF'):
            audio_format = '.wav'
        elif audio_bytes.startswith(b'ID3') or audio_bytes[0:2] == b'\xff\xfb':
            audio_format = '.mp3'
        elif audio_bytes.startswith(b'OggS'):
            audio_format = '.ogg'
        
        logger.info(f"Detected audio format: {audio_format}")
        
        # Save to temp file with correct extension
        with tempfile.NamedTemporaryFile(suffix=audio_format, delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name
        
        try:
            # Try to load audio using whisper's built-in loader (requires ffmpeg)
            logger.info("Loading audio with Whisper's audio loader...")
            try:
                import whisper.audio
                audio_array = whisper.audio.load_audio(temp_path)
                sample_rate = 16000  # Whisper's load_audio always returns 16kHz
                logger.info(f"Audio loaded: {len(audio_array)} samples at {sample_rate}Hz")
            except FileNotFoundError:
                # FFmpeg not found, try alternative method
                logger.warning("⚠️ FFmpeg not found, using alternative audio loader...")
                
                # Try with soundfile first (for WAV files)
                try:
                    audio_array, sample_rate = sf.read(temp_path)
                    logger.info(f"Audio loaded with soundfile: {len(audio_array)} samples at {sample_rate}Hz")
                    
                    # Convert to mono if stereo
                    if len(audio_array.shape) > 1:
                        audio_array = audio_array.mean(axis=1)
                        logger.info("Converted stereo to mono")
                    
                    # Resample to 16kHz if needed
                    if sample_rate != 16000:
                        logger.info(f"Resampling from {sample_rate}Hz to 16000Hz...")
                        try:
                            from scipy import signal
                            number_of_samples = round(len(audio_array) * float(16000) / sample_rate)
                            audio_array = signal.resample(audio_array, number_of_samples)
                            sample_rate = 16000
                            logger.info("Resampling successful")
                        except ImportError:
                            logger.warning("scipy not available, using simple resampling")
                            ratio = sample_rate / 16000
                            audio_array = audio_array[::int(ratio)]
                            sample_rate = 16000
                    
                    # Normalize audio
                    audio_array = audio_array.astype(np.float32)
                    if len(audio_array) > 0 and (audio_array.max() > 1.0 or audio_array.min() < -1.0):
                        audio_array = audio_array / np.abs(audio_array).max()
                        
                except Exception as sf_error:
                    logger.error(f"Soundfile also failed: {sf_error}")
                    raise Exception("Could not load audio. Please install ffmpeg or provide WAV format audio.")
            
            # Audio is already mono and at 16kHz from whisper.audio.load_audio
            # Or has been processed by soundfile
            
            logger.info("🔄 Step 1: AUTO-DETECTING LANGUAGE...")
            
            # If language is forced, skip detection and use it directly
            if preferred_language != 'auto' and force_language:
                detected_language = preferred_language
                logger.info(f"⚡ FORCED LANGUAGE: {detected_language.upper()} (skipping detection)")
                initial_transcription = ""
            else:
                # STEP 1: Auto-detect language with multiple attempts for better accuracy
                # First attempt - let Whisper detect freely
                detect_result = model.transcribe(
                    audio_array,
                    task='transcribe',
                    fp16=False,
                    beam_size=5,
                    best_of=3,
                    temperature=0.0,
                    verbose=False
                )
                
                detected_language = detect_result.get('language', 'hi')
                initial_transcription = detect_result.get('text', '').strip()
                
                logger.info(f"🔍 Initial detection: {detected_language} - Text: '{initial_transcription[:50]}...'")
                
                # Smart language detection: Check for language-specific patterns
                # Smart language detection: Use word-boundary matching to avoid false positives
                import re
                
                # Marathi strong indicators: specific words that clearly identify Marathi
                marathi_strong = ['मी', 'घेतली', 'घेतला', 'घेतले', 'केली', 'केला', 'केले', 'आहे', 'होते', 'किती', 'झाला', 'जाला',
                    'शंभर', 'एकशे', 'दोनशे', 'तीनशे', 'चारशे', 'पाचशे', 'सहाशे', 'सातशे', 'आठशे', 'नऊशे',
                    'लक्ष', 'कोटी', 'दीड', 'अडीच', 'साडे']
                
                # Bengali indicators: specific words, verbs, and number words
                bengali_indicators = [
                    'আমি', 'করেছি', 'কিনেছি', 'টাকা', 'ছিল', 'এর', 'এক', 'দুই',
                    'শো', 'একশো', 'দুইশো', 'তিনশো', 'চারশো', 'পাঁচশো', 'ছয়শো', 'সাতশো', 'আটশো', 'নয়শো',
                    'হাজার', 'লাখ', 'কোটি', 'দেড়', 'আড়াই', 'সাড়ে'
                ]
                
                # Hindi indicators: specific words, verbs, and number words
                hindi_indicators = [
                    'मैंने', 'किया', 'था', 'है', 'लिया', 'खरीदा', 'हुआ', 'मेरा', 'तुम्हारा', 'कितना', 'कितनी',
                    'सौ', 'एक सौ', 'दो सौ', 'तीन सौ', 'चार सौ', 'पांच सौ', 'छह सौ', 'सात सौ', 'आठ सौ', 'नौ सौ',
                    'हज़ार', 'लाख', 'करोड़', 'डेढ', 'ढाई', 'साढ़े'
                ]
                
                # Count strong indicators and capture which matched (for debugging)
                matched_marathi = [w for w in marathi_strong if w in initial_transcription]
                matched_bengali = [w for w in bengali_indicators if w in initial_transcription]
                matched_hindi = [w for w in hindi_indicators if w in initial_transcription]

                marathi_score = len(matched_marathi)
                bengali_score = len(matched_bengali)
                hindi_score = len(matched_hindi)

                # Check gender/postposition markers only as standalone tokens (handle punctuation/start/end)
                # Use lookarounds to match boundaries instead of simple spaces to cover start/end and punctuation
                if re.search(r'(?<!\S)(ची|चा|चे)(?!\S)', initial_transcription):
                    marathi_score += 1
                    matched_marathi.append('postposition:चा/ची/चे')
                if re.search(r'(?<!\S)(का|की|के)(?!\S)', initial_transcription):
                    hindi_score += 1
                    matched_hindi.append('postposition:का/की/के')

                # If an expense-root word appears (खर्च/खरचा/करचा/खर्चा), favor Hindi (these are Hindi expense roots or garbles)
                expense_variants = ['खर्च', 'खरचा', 'करचा', 'खर्चा', 'खल्चा', 'खल्च', 'खर्तल', 
                                  'करतले', 'करतल', 'कारत', 'खरत', 'खर्ट्सो', 'खर्टले', 
                                  'कर्चो', 'करत्सा', 'कर्ष']
                # BUT if Marathi "किती" (how much) is present, DON'T bias to Hindi
                has_kiti = any(k in initial_transcription for k in ['किती', 'की ती', 'गिती', 'कि ती', 'की दी'])
                has_expense_word = any(ev in initial_transcription for ev in expense_variants)
                
                if has_expense_word and not has_kiti:
                    hindi_score += 1
                    matched_hindi.append('expense_root')
                elif has_kiti:
                    # If किती is present, it's definitely Marathi query
                    marathi_score += 2
                    matched_marathi.append('किती_query')

                logger.info(f"📊 Matches - MR:{matched_marathi} BN:{matched_bengali} HI:{matched_hindi}")
                logger.info(f"📊 Language scores: MR={marathi_score}, BN={bengali_score}, HI={hindi_score}")
                
                # Override detection ONLY with strong evidence (margin of 2+ or multiple indicators)
                if marathi_score > hindi_score + 1 and marathi_score > bengali_score and marathi_score > 1:
                    logger.info(f"🎯 Overriding to Marathi (found {marathi_score} Marathi indicators)")
                    detected_language = 'mr'
                elif bengali_score > hindi_score and bengali_score > marathi_score and bengali_score > 0:
                    logger.info(f"🎯 Overriding to Bengali (found {bengali_score} Bengali indicators)")
                    detected_language = 'bn'
                elif hindi_score >= marathi_score and hindi_score > 0:
                    logger.info(f"🎯 Keeping Hindi (found {hindi_score} Hindi indicators)")
                    detected_language = 'hi'
                elif preferred_language != 'auto' and marathi_score == 0 and bengali_score == 0 and hindi_score == 0:
                    logger.info(f"⚠️ No clear indicators, using user preference: {preferred_language.upper()}")
                    detected_language = preferred_language
            
            # REJECT URDU - convert to Hindi to avoid Arabic script confusion
            if detected_language == 'ur':
                logger.warning(f"⚠️ Urdu detected but converting to Hindi (Devanagari script)")
                detected_language = 'hi'
            
            logger.info(f"✅ FINAL DETECTED LANGUAGE: {detected_language.upper()}")
            
            # Check if detected language is supported
            if detected_language not in INDIAN_LANGUAGES and detected_language not in ['hi', 'mr', 'bn', 'en', 'ta', 'te', 'ml', 'kn', 'gu', 'pa']:
                logger.warning(f"⚠️  Detected language '{detected_language}' not in our list. Defaulting to Hindi.")
                detected_language = 'hi'
            
            # STEP 2: Re-transcribe with language-specific prompt for better accuracy
            logger.info(f"🔄 Step 2: RE-TRANSCRIBING with {detected_language.upper()} optimizations...")
            
            # Get language-specific prompt
            language_prompt = get_language_prompt(detected_language)
            
            # Enhanced transcription parameters for better accuracy
            # Use temperature fallback for better results with noisy audio
            result = model.transcribe(
                audio_array,
                language=detected_language,
                task='transcribe', 
                fp16=False,
                beam_size=15,
                best_of=10,
                temperature=(0.0, 0.2, 0.4, 0.6, 0.8),  # Temperature fallback for poor audio
                patience=2.0,
                condition_on_previous_text=True,
                compression_ratio_threshold=2.4,
                logprob_threshold=-1.0,
                no_speech_threshold=0.6,
                initial_prompt=language_prompt if language_prompt else None
            )
            
            transcription = result['text'].strip()
            
            # Log confidence if available
            if 'segments' in result:
                avg_logprob = sum(s.get('avg_logprob', 0) for s in result['segments']) / len(result['segments']) if result['segments'] else 0
                logger.info(f"📊 Transcription confidence: {avg_logprob:.2f}")
            
            # Apply language-specific cleaning
            logger.info(f"🧹 Applying {detected_language.upper()} specific corrections...")
            cleaned_transcription = clean_transcription(transcription, detected_language, number_system)
            
        except Exception as processing_error:
            logger.error(f"Audio processing failed: {processing_error}")
            # Fallback method
            try:
                result = model.transcribe(
                    temp_path,
                    task='transcribe',
                    fp16=False
                )
                transcription = result['text'].strip()
                detected_language = result.get('language', 'hi')
                cleaned_transcription = clean_transcription(transcription, detected_language, number_system)
            except Exception as fallback_error:
                logger.error(f"Fallback method also failed: {fallback_error}")
                raise fallback_error
        
        finally:
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    logger.info("🗑️ Cleaned up temporary file")
            except Exception as cleanup_err:
                logger.warning(f"Could not delete temp file: {cleanup_err}")
        
        logger.info("=" * 60)
        logger.info(f"🌐 Detected Language: {detected_language.upper()}")
        logger.info(f"📝 Original: {transcription}")
        logger.info(f"✨ Cleaned: {cleaned_transcription}")
        logger.info("✅ 100% OFFLINE TRANSCRIPTION COMPLETE!")
        logger.info("=" * 60)
        
        # Get language name
        language_name = INDIAN_LANGUAGES.get(detected_language, {}).get('name', detected_language)
        
        return jsonify({
            "success": True,
            "text": cleaned_transcription,
            "original_text": transcription,
            "language": detected_language,
            "language_name": language_name,
            "model_used": "local-whisper-offline",
            "offline": True,
            "auto_detected": True
        })
            
    except Exception as e:
        logger.error(f"OFFLINE TRANSCRIPTION ERROR: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e),
            "offline": True
        }), 500

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚀 STARTING 100% OFFLINE WHISPER SERVICE")
    print("🌐 MULTI-LANGUAGE SUPPORT: Hindi, Marathi, Bengali + MORE")
    print("🎯 AUTO-DETECTION: Will detect language automatically!")
    print("=" * 70)
    
    # Load model when starting
    if load_model():
        print("\n" + "=" * 70)
        print("✅ 100% OFFLINE WHISPER SERVER READY!")
        print("📍 Running on: http://localhost:5003")
        print("📻 COMPLETELY OFFLINE - No internet required!")
        print("� Supported Languages:")
        print("   • Hindi (हिंदी)")
        print("   • Marathi (मराठी)")
        print("   • Bengali (বাংলা)")
        print("   • English + 10+ more Indian languages")
        print("🎯 AUTO-DETECTION enabled - NO language forcing!")
        print("=" * 70 + "\n")
        app.run(host='0.0.0.0', port=5003, debug=False, threaded=True)
    else:
        print("\n" + "=" * 70)
        print("❌ FAILED TO START OFFLINE SERVER")
        print("Download model files first:")
        print("cd models/ && curl -L -o small.pt https://openaipublic.azureedge.net/main/whisper/models/9ecf779972d90ba49c06d968637d720dd632c55bbf19d441fb42bf17a411e794/small.pt")
        print("=" * 70 + "\n")