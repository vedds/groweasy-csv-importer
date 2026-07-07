// Quick script to list all available Gemini models for your API key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  console.log('\n🔍 Fetching available models for your API key...\n');

  try {
    // Try v1 endpoint
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await resp.json();

    if (data.models) {
      console.log('✅ Available models on v1:\n');
      data.models.forEach(m => {
        const supportsGenerate = m.supportedGenerationMethods?.includes('generateContent');
        if (supportsGenerate) {
          console.log(`  ✅ ${m.name.replace('models/', '')}  (${m.displayName})`);
        }
      });
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listModels();
