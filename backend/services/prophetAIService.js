const { spawn } = require('child_process');
const path = require('path');
const Transaction = require('../models/Transaction');

class ProphetAIService {
    async generateDemandPredictions(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`🤖 Starting Prophet AI for user: ${userId}`);
                
                // Get transactions from MongoDB
                const transactions = await Transaction.find({ 
                    userId: userId,
                    type: 'income',
                    category: 'clothing'
                }).sort({ date: 1 }).lean();
                
                console.log(`📊 Found ${transactions.length} transactions in database`);
                
                if (transactions.length < 7) {
                    console.log('❌ Not enough transactions for Prophet (need at least 7)');
                    return resolve(this.getRuleBasedFallback(userId));
                }
                
                // Run Python Prophet script from whisper_service directory
                const pythonScript = path.join(__dirname, '..', 'whisper_service', 'prophet_handler.py');
                const pythonExecutable = process.platform === 'win32' 
                    ? path.join(__dirname, '..', 'whisper-env', 'Scripts', 'python.exe')
                    : 'python3';
                
                console.log(`🐍 Using Python: ${pythonExecutable}`);
                console.log(`📜 Running script: ${pythonScript}`);
                
                const pythonProcess = spawn(pythonExecutable, [pythonScript], {
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                
                let result = '';
                let error = '';
                
                pythonProcess.stdout.on('data', (data) => {
                    const output = data.toString();
                    console.log('Python output:', output);
                    result += output;
                });
                
                pythonProcess.stderr.on('data', (data) => {
                    const errOutput = data.toString();
                    console.log('Python stderr:', errOutput);
                    error += errOutput;
                });
                
                pythonProcess.on('close', async (code) => {
                    if (code === 0 && result) {
                        try {
                            // Extract JSON from output (might have logs before it)
                            const jsonMatch = result.match(/\{[\s\S]*"success"[\s\S]*\}/);
                            if (jsonMatch) {
                                const predictions = JSON.parse(jsonMatch[0]);
                                console.log('✅ Prophet AI completed successfully');
                                
                                // Convert Prophet format to our UI format
                                const formatted = await this.formatProphetOutput(predictions, userId);
                                resolve(formatted);
                            } else {
                                throw new Error('No valid JSON found in output');
                            }
                        } catch (e) {
                            console.log('❌ JSON parse error:', e.message);
                            console.log('Raw output:', result);
                            resolve(await this.getRuleBasedFallback(userId));
                        }
                    } else {
                        console.log(`❌ Python process failed with code ${code}`);
                        console.log('Error output:', error);
                        resolve(await this.getRuleBasedFallback(userId));
                    }
                });
                
                // Send data to Python
                const requestData = {
                    userId: userId,
                    transactions: transactions
                };
                
                pythonProcess.stdin.write(JSON.stringify(requestData));
                pythonProcess.stdin.end();
                
            } catch (error) {
                console.log('❌ Prophet service error:', error.message);
                resolve(await this.getRuleBasedFallback(userId));
            }
        });
    }
    
    async formatProphetOutput(prophetResult, userId) {
        const { generateDemandPredictions } = require('../utils/demandPredictions');
        
        try {
            // Get rule-based predictions for structure and seasonal info
            const ruleBasedResult = await generateDemandPredictions(userId);
            
            if (!prophetResult.monthly_insights || prophetResult.monthly_insights.length === 0) {
                return ruleBasedResult;
            }
            
            // Merge Prophet predictions with rule-based seasonal info
            const predictions = [];
            const now = new Date();
            
            for (let i = 0; i < Math.min(2, prophetResult.monthly_insights.length); i++) {
                const prophetMonth = prophetResult.monthly_insights[i];
                const ruleBasedMonth = ruleBasedResult.predictions[i];
                
                if (ruleBasedMonth) {
                    predictions.push({
                        ...ruleBasedMonth,
                        predictedRevenue: prophetMonth.predictedRevenue,
                        expectedRevenue: {
                            min: prophetMonth.confidenceRange.min,
                            max: prophetMonth.confidenceRange.max
                        },
                        model: 'prophet_ai',
                        confidence: 'high'
                    });
                }
            }
            
            return {
                success: true,
                predictions,
                alert: ruleBasedResult.alert,
                marketInsights: ruleBasedResult.marketInsights,
                model: 'prophet_ai',
                message: `Powered by Meta's Prophet AI using ${prophetResult.data_used} real sales records`,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('Error formatting Prophet output:', error);
            return prophetResult;
        }
    }
    
    async getRuleBasedFallback(userId) {
        console.log('🔄 Falling back to rule-based predictions');
        const { generateDemandPredictions } = require('../utils/demandPredictions');
        return await generateDemandPredictions(userId);
    }
}

module.exports = new ProphetAIService();