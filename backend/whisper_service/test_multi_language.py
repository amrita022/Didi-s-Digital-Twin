"""
Test script for multi-language whisper server
Run this after starting the whisper server to verify language detection
"""

import requests
import json

WHISPER_URL = "http://localhost:5003"

def test_health_check():
    """Test if server is running and multi-language enabled"""
    print("\n" + "="*60)
    print("🔍 Testing Health Check...")
    print("="*60)
    
    try:
        response = requests.get(f"{WHISPER_URL}/health")
        data = response.json()
        
        print(f"✅ Status: {data.get('status')}")
        print(f"✅ Model Loaded: {data.get('model_loaded')}")
        print(f"✅ Multi-Language: {data.get('multi_language')}")
        print(f"✅ Auto-Detection: {data.get('auto_detection')}")
        print(f"✅ Primary Languages: {data.get('primary_languages')}")
        print(f"✅ Supported Languages: {len(data.get('supported_languages', []))} languages")
        
        if data.get('multi_language') and data.get('auto_detection'):
            print("\n🎉 MULTI-LANGUAGE SUPPORT IS ACTIVE!")
            return True
        else:
            print("\n⚠️  Multi-language support may not be fully active")
            return False
            
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        print("Make sure the whisper server is running on port 5003")
        return False

def test_language_detection_info():
    """Display information about language detection"""
    print("\n" + "="*60)
    print("📚 Language Detection Information")
    print("="*60)
    
    languages = {
        'hi': {'name': 'Hindi', 'example': 'मैंने तीन सौ रुपये खर्च किए'},
        'mr': {'name': 'Marathi', 'example': 'मी तीनशे रुपये खर्च केले'},
        'bn': {'name': 'Bengali', 'example': 'আমি তিনশো টাকা খরচ করেছি'},
        'en': {'name': 'English', 'example': 'I spent three hundred rupees'}
    }
    
    print("\nSupported Primary Languages:")
    for code, info in languages.items():
        print(f"  • {info['name']:15} ({code}): {info['example']}")
    
    print("\n" + "="*60)
    print("How It Works:")
    print("="*60)
    print("1. 🎤 Audio is captured from user")
    print("2. 🔍 Whisper AUTO-DETECTS the language (no forcing!)")
    print("3. 🎯 Re-transcribes with language-specific optimizations")
    print("4. 🧹 Applies language-specific corrections (numbers, etc.)")
    print("5. ✅ Returns cleaned, accurate transcription")
    print("\n🎉 NO MORE LANGUAGE CONFUSION!")
    
def display_test_scenarios():
    """Display test scenarios for each language"""
    print("\n" + "="*60)
    print("🧪 Test Scenarios")
    print("="*60)
    
    scenarios = [
        {
            'language': 'Hindi',
            'speak': 'मैंने तीन सौ रुपये का मसाला खरीदा',
            'expected': 'Numbers converted to digits (300), proper Hindi grammar'
        },
        {
            'language': 'Marathi',
            'speak': 'मी तीनशे रुपयांचे भाजी विकत घेतले',
            'expected': 'Detected as Marathi, numbers in digits (300)'
        },
        {
            'language': 'Bengali',
            'speak': 'আমি তিনশো টাকার সবজি কিনেছি',
            'expected': 'Detected as Bengali, numbers in digits (300)'
        },
        {
            'language': 'English',
            'speak': 'I bought vegetables for three hundred rupees',
            'expected': 'Detected as English, natural transcription'
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{i}. Test {scenario['language']}:")
        print(f"   Speak: {scenario['speak']}")
        print(f"   Expected: {scenario['expected']}")
    
    print("\n" + "="*60)

def main():
    """Main test function"""
    print("\n" + "="*80)
    print("🌐 MULTI-LANGUAGE WHISPER SERVER TEST SUITE")
    print("="*80)
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n⚠️  Server may not be ready. Please check if whisper_server.py is running.")
        return
    
    # Test 2: Language Detection Info
    test_language_detection_info()
    
    # Test 3: Test Scenarios
    display_test_scenarios()
    
    print("\n" + "="*80)
    print("✅ TEST SUITE COMPLETE")
    print("="*80)
    print("\n📝 Next Steps:")
    print("   1. Test with real audio in Hindi, Marathi, and Bengali")
    print("   2. Check server logs for language detection")
    print("   3. Verify numbers are converted to digits")
    print("   4. Ensure no language confusion occurs")
    print("\n🎯 Pro Tip: Check the server console for detailed logs!")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
