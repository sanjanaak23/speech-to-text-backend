require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// Security Middleware
app.use(helmet()); // Adds security headers
app.use(express.json({ limit: '25mb' })); // JSON body parsing with size limit

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://speech-to-text-frontend-fqapj0aph.vercel.app', // Production frontend
  'https://speech-to-text-frontend.vercel.app' // Without the project ID
];

// Remove trailing slashes from origins
const normalizedOrigins = allowedOrigins.map(origin => origin.replace(/\/+$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (normalizedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || 
             origin.startsWith(`${allowedOrigin}/`);
    })) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/transcribe', require('./routes/transcribeRoutes'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      error: 'Cross-origin request denied'
    });
  }

  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 Listening on port ${PORT}`);
  console.log('✅ Allowed origins:', normalizedOrigins.join(', '));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});