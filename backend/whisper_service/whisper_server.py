from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os
import base64
import logging
import numpy as np
import soundfile as sf

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global model variable
model = None

def load_model():
    """Load the Whisper model from LOCAL files - 100% OFFLINE"""
    global model
    try:
        logger.info("🔄 Loading LOCAL Whisper model (100% OFFLINE)...")
        
        # Try these local model paths (in order of preference)
        model_paths = [
            "../models/small.pt",    # Best accuracy
            "../models/base.pt",     # Good balance
            "../models/tiny.pt",     # Fastest
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
            
        logger.info("🌍 Model supports: Hindi, English (100% OFFLINE)")
        return True
        
    except Exception as e:
        logger.error(f"Failed to load local Whisper model: {e}")
        return False

def clean_hindi_transcription(text):
    """Clean common Hindi transcription errors - IMPROVED"""
    corrections = {
        'में लिएं': 'मैंने',
        'में लिया': 'मैंने लिया',
        'मैं लिया': 'मैंने लिया',
        'वस्टाना': 'मसाला', 
        'वस्ताना': 'मसाला',
        'वस्तना': 'मसाला',
        'मसला': 'मसाला',
        'सु का': '300 का',
        'सु रुपये': '300 रुपये',
        'तीन सौ': '300',
        'तीनसौ': '300',
        'तिसौ': '300',
        'तिसो': '300',
        'सौ': '100',
        'दो सौ': '200',
        'चार सौ': '400',
        'पांच सौ': '500',
        'लिएं': 'लिया',
        'सब्जी': 'सब्जियाँ',
        'आचार': 'अचार',
        'आचार': 'अचार',
        'मसाला': 'मसाला',
        'मसाले': 'मसाला'
    }
    
    cleaned = text
    for wrong, correct in corrections.items():
        cleaned = cleaned.replace(wrong, correct)
    
    return cleaned

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ready" if model else "loading",
        "model_loaded": model is not None,
        "model_type": "local-offline",
        "offline": True
    })

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio endpoint - 100% OFFLINE"""
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

        logger.info("=" * 60)
        logger.info("📻 100% OFFLINE AUDIO TRANSCRIPTION STARTED")
        logger.info("=" * 60)
        
        # Decode base64 audio
        audio_b64 = data['audioData']
        audio_bytes = base64.b64decode(audio_b64)
        
        logger.info(f"Audio size: {len(audio_bytes) / 1024:.2f} KB")
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name
        
        try:
            # Use soundfile to load audio
            logger.info("Loading audio with soundfile...")
            audio_array, sample_rate = sf.read(temp_path)
            logger.info(f"Audio loaded: {len(audio_array)} samples at {sample_rate}Hz")
            
            # Convert to mono if stereo
            if len(audio_array.shape) > 1:
                audio_array = audio_array.mean(axis=1)
                logger.info("Converted stereo to mono")
            
            # Whisper expects 16kHz sample rate
            if sample_rate != 16000:
                logger.info(f"Resampling from {sample_rate}Hz to 16000Hz...")
                try:
                    from scipy import signal
                    number_of_samples = round(len(audio_array) * float(16000) / sample_rate)
                    audio_array = signal.resample(audio_array, number_of_samples)
                    sample_rate = 16000
                    logger.info("Resampling successful with scipy")
                except ImportError:
                    logger.warning("scipy not available, using simple resampling")
                    ratio = sample_rate / 16000
                    audio_array = audio_array[::int(ratio)]
                    sample_rate = 16000
            
            # Normalize audio
            audio_array = audio_array.astype(np.float32)
            if audio_array.max() > 1.0 or audio_array.min() < -1.0:
                audio_array = audio_array / np.abs(audio_array).max()
            
            logger.info("🔄 Processing with 100% OFFLINE Whisper AI...")
            logger.info("🎯 FORCING HINDI LANGUAGE (hi)")
            
            result = model.transcribe(
                audio_array,
                language='hi',
                task='transcribe', 
                fp16=False,
                beam_size=10,
                best_of=5,
                temperature=0.0,
                condition_on_previous_text=True,
                initial_prompt=(
                    "यह हिंदी भाषा है। संख्याएँ अंकों में लिखें। "
                    "व्यापारिक बातचीत: खर्च, आमदनी, सब्जियाँ, मसाले, आचार। "
                    "स्पष्ट उच्चारण के साथ लिखें। मैंने, खरीदा, बेचा, रुपये।"
                    "तीन सौ को 300 लिखें। पांच सौ को 500 लिखें।"
                )
            )
            
            transcription = result['text'].strip()
            cleaned_transcription = clean_hindi_transcription(transcription)
            
        except Exception as processing_error:
            logger.error(f"Audio processing failed: {processing_error}")
            # Fallback method
            try:
                result = model.transcribe(
                    temp_path,
                    language='hi',
                    task='transcribe',
                    fp16=False
                )
                transcription = result['text'].strip()
                cleaned_transcription = clean_hindi_transcription(transcription)
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
        logger.info(f"📝 Original: {transcription}")
        logger.info(f"✨ Cleaned: {cleaned_transcription}")
        logger.info("✅ 100% OFFLINE TRANSCRIPTION COMPLETE!")
        logger.info("=" * 60)
        
        return jsonify({
            "success": True,
            "text": cleaned_transcription,
            "original_text": transcription,
            "language": "hi",
            "model_used": "local-whisper-offline",
            "offline": True
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
    print("=" * 70)
    
    # Load model when starting
    if load_model():
        print("\n" + "=" * 70)
        print("✅ 100% OFFLINE WHISPER SERVER READY!")
        print("📍 Running on: http://localhost:5003")
        print("📻 COMPLETELY OFFLINE - No internet required!")
        print("🎯 Ready for Hindi & English audio transcription")
        print("=" * 70 + "\n")
        app.run(host='0.0.0.0', port=5003, debug=False, threaded=True)
    else:
        print("\n" + "=" * 70)
        print("❌ FAILED TO START OFFLINE SERVER")
        print("Download model files first:")
        print("cd models/ && curl -L -o small.pt https://openaipublic.azureedge.net/main/whisper/models/9ecf779972d90ba49c06d968637d720dd632c55bbf19d441fb42bf17a411e794/small.pt")
        print("=" * 70 + "\n")