require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// Enhanced Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'connect-src': ["'self'", 'https://speech-to-text-backend-i89r.onrender.com']
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parsing with increased limit
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Configure CORS with strict origin checking
const allowedOrigins = [
  'http://localhost:3000',
  'https://speech-to-text-frontend-o6al84h4n.vercel.app',
  'https://speech-to-text-frontend.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin && process.env.NODE_ENV === 'development') {
      // Allow requests with no origin in development
      return callback(null, true);
    }
    
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin?.startsWith(`${allowedOrigin}/`)
    )) {
      return callback(null, true);
    }
    
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight
app.options('*', cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' // Skip preflight requests
});

app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins
  });
});

// API Routes
app.use('/api/transcribe', require('./routes/transcribeRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Enhanced Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'Cross-origin request denied',
      allowedOrigins,
      receivedOrigin: req.get('origin')
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 Listening on port ${PORT}`);
  console.log('✅ Allowed origins:', allowedOrigins.join(', '));
  console.log('🛡️  CORS Configuration:', JSON.stringify(corsOptions, null, 2));
});

// Process event handlers
const shutdown = (signal) => {
  console.log(`🛑 Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('💤 Process terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err);
  shutdown('unhandledRejection');
});