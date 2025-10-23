const { exec } = require('child_process');
const { promisify } = require('util');
const http = require('http');
const path = require('path');

const execAsync = promisify(exec);

class WhisperService {
  constructor() {
    this.port = 5003;
    this.baseUrl = `http://localhost:${this.port}`;
    this.isReady = false;
    this.pythonProcess = null;
  }

async initialize() {
  console.log('🔧 Initializing Whisper Service...');
  
  // Check if Whisper service is already running
  const isRunning = await this.healthCheck();
  
  if (isRunning) {
    console.log('✅ Whisper service is already running!');
    this.isReady = true;
    return true;
  }
  
  console.log('🚀 Starting Python Whisper service...');
  try {
    const pythonEnvPath = path.join(__dirname, '..', 'whisper_env', 'Scripts', 'python');
    const scriptPath = path.join(__dirname, '..', 'whisper_service', 'whisper_server.py');
    
    this.pythonProcess = exec(`"${pythonEnvPath}" "${scriptPath}"`, {
      cwd: path.join(__dirname, '..'),
      windowsHide: true
    });
    
    let serverReady = false;
    
    this.pythonProcess.stdout.on('data', (data) => {
      console.log(`[Whisper] ${data}`);
      // Check if server is ready
      if (data.includes('WHISPER SERVER READY') || data.includes('Running on')) {
        serverReady = true;
        console.log('🎯 Python server reported READY, waiting for health check...');
      }
    });
    
    this.pythonProcess.stderr.on('data', (data) => {
      if (!data.includes('WARNING') && !data.includes('INFO')) {
        console.error(`[Whisper Error] ${data}`);
      }
    });
    
    // Wait for server to be ready
    console.log('⏳ Waiting for Python server to start...');
    
    for (let i = 0; i < 15; i++) { // Increased to 15 attempts
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
      console.log(`🔍 Health check attempt ${i + 1}/15...`);
      
      if (await this.healthCheck()) {
        this.isReady = true;
        console.log('✅ Whisper service is READY and RESPONDING!');
        return true;
      }
      
      // If server said it's ready but health check fails, wait a bit more
      if (serverReady) {
        console.log('⚠️ Server reported ready but health check failing, waiting...');
      }
    }
    
    console.log('❌ Whisper service failed to start within timeout');
    return false;
    
  } catch (error) {
    console.error('❌ Failed to start Whisper:', error);
    return false;
  }
}

// UPDATE healthCheck method to be more forgiving:
async healthCheck() {
  try {
    const response = await this.makeRequest(`${this.baseUrl}/health`, {
      method: 'GET',
      timeout: 2000 // Reduced timeout
    });
    
    if (response.ok) {
      const data = response.json();
      return data.model_loaded === true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

  async transcribe(audioData) {
    if (!this.isReady) {
      throw new Error('Whisper service not ready');
    }
    
    console.log('🎵 Sending audio to Whisper AI...');
    
    const postData = JSON.stringify({ audioData: audioData });
    
    const response = await this.makeRequest(`${this.baseUrl}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData,
      timeout: 30000
    });
    
    if (!response.ok) {
      throw new Error(`Whisper error: ${response.status}`);
    }
    
    const result = response.json();
    
    if (result.success && result.text) {
      return result.text;
    } else {
      throw new Error(result.error || 'Transcription failed');
    }
  }

  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ 
              ok: res.statusCode === 200, 
              status: res.statusCode, 
              json: () => JSON.parse(data),
              text: () => data 
            });
          } catch (e) {
            resolve({ ok: res.statusCode === 200, status: res.statusCode, text: () => data });
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      if (options.timeout) req.setTimeout(options.timeout);
      if (options.body) req.write(options.body);
      req.end();
    });
  }
}

module.exports = new WhisperService();