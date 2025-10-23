// Simple test to check if Whisper service is responding
const http = require('http');

function testWhisperHealth() {
    return new Promise((resolve, reject) => {
        console.log('Testing Whisper health endpoint...');
        
        const req = http.request('http://localhost:5003/health', {
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Status Code:', res.statusCode);
                console.log('Response:', data);
                try {
                    const json = JSON.parse(data);
                    console.log('\n✅ Whisper service is responding!');
                    console.log('Model loaded:', json.model_loaded);
                    console.log('Status:', json.status);
                    resolve(json);
                } catch (e) {
                    console.log('❌ Invalid JSON response');
                    reject(e);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Connection failed:', error.message);
            console.log('\n💡 Make sure Python Whisper service is running:');
            console.log('   python backend/whisper_service/whisper_server.py');
            reject(error);
        });
        
        req.on('timeout', () => {
            console.log('❌ Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.end();
    });
}

// Run the test
testWhisperHealth()
    .then(() => {
        console.log('\n🎉 Test PASSED! Whisper service is working!');
        process.exit(0);
    })
    .catch(() => {
        console.log('\n❌ Test FAILED! Whisper service is not responding.');
        process.exit(1);
    });
