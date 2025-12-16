"""
Language utilities and prompts
"""

# Supported Indian Languages with TTS mapping
INDIAN_LANGUAGES = {
    'hi': {'name': 'Hindi', 'tts_code': 'hi'},
    'mr': {'name': 'Marathi', 'tts_code': 'mr'},
    'gu': {'name': 'Gujarati', 'tts_code': 'gu'}, 
    'ml': {'name': 'Malayalam', 'tts_code': 'ml'},
    'ta': {'name': 'Tamil', 'tts_code': 'ta'},
    'te': {'name': 'Telugu', 'tts_code': 'te'},
    'kn': {'name': 'Kannada', 'tts_code': 'kn'},
    'bn': {'name': 'Bengali', 'tts_code': 'bn'},
    'pa': {'name': 'Punjabi', 'tts_code': 'pa'},
    'or': {'name': 'Oriya', 'tts_code': 'or'},
    'as': {'name': 'Assamese', 'tts_code': 'as'},
    'en': {'name': 'English', 'tts_code': 'en'},
    # 'ur': {'name': 'Urdu', 'tts_code': 'ur'},  # REMOVED to avoid confusion with Hindi
    'ne': {'name': 'Nepali', 'tts_code': 'ne'},
    'sd': {'name': 'Sindhi', 'tts_code': 'sd'},
    'sa': {'name': 'Sanskrit', 'tts_code': 'sa'},
    'ks': {'name': 'Kashmiri', 'tts_code': 'ks'},
    'gom': {'name': 'Konkani', 'tts_code': 'gom'},
    'doi': {'name': 'Dogri', 'tts_code': 'doi'},
    'mai': {'name': 'Maithili', 'tts_code': 'mai'},
    'bho': {'name': 'Bhojpuri', 'tts_code': 'bho'},
    'auto': {'name': 'Auto-detect', 'tts_code': 'hi'}  # Default to Hindi
}

def get_language_prompt(language):
    """Get language-specific prompts for better transcription"""
    prompts = {
        'hi': (
            "यह हिंदी भाषा है। देवनागरी लिपि में लिखें। उर्दू लिपि का उपयोग न करें। "
            "संख्याएँ अंकों में लिखें। "
            "व्यापारिक बातचीत: खर्च, आमदनी, सब्जियाँ, मसाले, आचार। "
            "स्पष्ट उच्चारण के साथ लिखें। मैंने, खरीदा, बेचा, रुपये।"
            "संख्याओं को अंकों में लिखें: 100, 200, 300, 150, 250, 350, 175, 275।"
        ),
        'mr': (
            "ही मराठी भाषा आहे. संख्या अंकात लिहा. "
            "व्यावसायिक संभाषण: खर्च, उत्पन्न, भाज्या, मसाले, लोणचे. "
            "स्पष्ट उच्चारासह लिहा. मी, विकत घेतले, विकले, रुपये."
            "संख्या अंकात लिहा: 100, 200, 300, 150, 250, 350, 175, 275."
        ),
        'gu': (
            "આ ગુજરાતી ભાષા છે. નંબરો આંકડામાં લખો. "
            "વ્યવસાયિક વાતચીત: ખર્ચ, આવક, શાકભાજી, મસાલા, અથાણું. "
            "સ્પષ્ટ ઉચ્ચારણ સાથે લખો. મેં, ખરીદ્યું, વેચ્યું, રૂપિયા."
            "નંબરો આંકડામાં લખો: 100, 200, 300, 150, 250, 350, 175, 275."
        ),
        'ta': (
            "இது தமிழ் மொழி. எண்களை இலக்கங்களில் எழுதவும். "
            "வணிக உரையாடல்: செலவு, வருமானம், காய்கறிகள், மசாலா, ஊறுகாய். "
            "தெளிவான உச்சரிப்புடன் எழுதவும். நான், வாங்கினேன், விற்றேன், ரூபாய்."
            "எண்களை இலக்கங்களில் எழுதவும்: 100, 200, 300, 150, 250, 350, 175, 275."
        ),
        'ml': (
            "ഇത് മലയാളം ഭാഷയാണ്. നമ്പറുകൾ അക്കങ്ങളിൽ എഴുതുക. "
            "വ്യവസായ സംഭാഷണം: ചെലവ്, വരുമാനം, പച്ചക്കറികൾ, മസാല, അച്ചാർ. "
            "വ്യക്തമായ ഉച്ചാരണത്തോടെ എഴുതുക. ഞാൻ, വാങ്ങി, വിറ്റു, രൂപ."
            "നമ്പറുകൾ അക്കങ്ങളിൽ എഴുതുക: 100, 200, 300, 150, 250, 350, 175, 275."
        ),
        'bn': (
            "এটি বাংলা ভাষা। সংখ্যাগুলি অঙ্কে লিখুন। "
            "ব্যবসায়িক কথোপকথন: ব্যয়, আয়, সবজি, মসলা, আচার। "
            "স্পষ্ট উচ্চারণ সহ লিখুন। আমি, কিনেছি, বিক্রি করেছি, টাকা।"
            "সংখ্যাগুলি অঙ্কে লিখুন: 100, 200, 300, 150, 250, 350, 175, 275।"
        ),
        'te': (
            "ఇది తెలుగు భాష. సంఖ్యలను అంకెలలో వ్రాయండి. "
            "వ్యాపార సంభాషణ: ఖర్చు, ఆదాయం, కూరగాయలు, మసాలా, ఊరగాయ. "
            "స్పష్టమైన ఉచ్చారణతో వ్రాయండి. నేను, కొన్నాను, అమ్మాను, రూపాయలు."
            "సంఖ్యలను అంకెలలో వ్రాయండి: 100, 200, 300, 150, 250, 350, 175, 275."
        ),
        'kn': (
            "ಇದು ಕನ್ನಡ ಭಾಷೆ. ಸಂಖ್ಯೆಗಳನ್ನು ಅಂಕಿಗಳಲ್ಲಿ ಬರೆಯಿರಿ. "
            "ವ್ಯವಸಾಯ ಸಂಭಾಷಣೆ: ಖರ್ಚು, ಆದಾಯ, ತರಕಾರಿಗಳು, ಮಸಾಲೆ, ಉಪ್ಪಿನಕಾಯಿ. "
            "ಸ್ಪಷ್ಟ ಉಚ್ಚಾರಣೆಯೊಂದಿಗೆ ಬರೆಯಿರಿ. ನಾನು, ಖರೀದಿಸಿದೆ, ಮಾರಿದೆ, ರೂಪಾಯಿ."
            "ಸಂಖ್ಯೆಗಳನ್ನು ಅಂಕಿಗಳಲ್ಲಿ ಬರೆಯಿರಿ: 100, 200, 300, 150, 250, 350, 175, 275."
        ),
        'pa': (
            "ਇਹ ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਹੈ। ਨੰਬਰ ਅੰਕਾਂ ਵਿੱਚ ਲਿਖੋ। "
            "ਵਪਾਰਕ ਗੱਲਬਾਤ: ਖਰਚ, ਆਮਦਨ, ਸਬਜ਼ੀਆਂ, ਮਸਾਲਾ, ਅਚਾਰ। "
            "ਸਾਫ਼ ਉਚਾਰਨ ਨਾਲ ਲਿਖੋ। ਮੈਂ, ਖਰੀਦਿਆ, ਵੇਚਿਆ, ਰੁਪਏ।"
            "ਨੰਬਰ ਅੰਕਾਂ ਵਿੱਚ ਲਿਖੋ: 100, 200, 300, 150, 250, 350, 175, 275।"
        )
    }
    
    return prompts.get(language, "")

def clean_transcription(text, language, number_system):
    """Clean common transcription errors for different Indian languages with comprehensive number handling"""
    
    if language not in number_system:
        return text
    
    corrections = number_system[language]
    cleaned = text
    
    # Apply corrections
    for wrong, correct in corrections.items():
        cleaned = cleaned.replace(wrong, correct)
    
    # Phonetic similarity fixes for Hindi common mishearings
    if language == 'hi':
        import re
        # Fix common Whisper mishearings with word boundaries
        phonetic_fixes = [
            (r'\bशोट\b', 'शर्ट'),      # shot → shirt
            (r'\bसारी\b', 'साड़ी'),     # saari → saree (when standalone)
            (r'\bशो\b', 'सौ'),         # sho → sau (hundred)
            (r'\bसाथ\s+सौ\b', 'सात सौ'), # saath sau → 700
            (r'\bसात\s+शो\b', 'सात सौ'), # saat sho → 700
        ]
        for pattern, replacement in phonetic_fixes:
            cleaned = re.sub(pattern, replacement, cleaned)
    
    return cleaned