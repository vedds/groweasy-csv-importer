require('dotenv').config();
const express = require('express');
const cors = require('cors');
const importRoutes = require('./routes/import');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from frontend (localhost + any Vercel deployment)
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Allow any vercel.app subdomain
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Import routes
app.use('/api/import', importRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 GrowEasy Backend running at http://localhost:${PORT}`);
  console.log(`   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured — add GEMINI_API_KEY to .env'}`);
  console.log(`   Health:     http://localhost:${PORT}/health\n`);
});
