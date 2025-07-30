require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const speech = require('@google-cloud/speech').v1; // Updated to use v1 of the client
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

const app = express();

// Enable trust proxy for Render's load balancer
app.set('trust proxy', true);

// Configure CORS
const allowedOrigins = [
  'https://speech-to-text-frontend-7b4qt3wod.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
  keyGenerator: (req) => {
    // Proper IP handling for both IPv4 and IPv6
    const ip = req.ip || req.connection.remoteAddress;
    return ip.replace(/:\d+[^:]*$/, ''); // Remove port number if present
  },
  validate: { 
    ip: false, // Disable IP validation since we're handling it manually
    xForwardedForHeader: false // Disable if not using proxy
  }
});

app.use('/api/', limiter);

// Body parser configuration for larger payloads
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ 
  limit: '25mb',
  extended: true,
  parameterLimit: 50000
}));

// Initialize Google Cloud clients
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID // Added project ID
});
const speechClient = new speech.SpeechClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  },
  fileFilter: (req, file, cb) => { // Added file filter
    if (file.mimetype === 'audio/webm' || file.mimetype === 'audio/wav') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBytes = req.file.buffer.toString('base64');
    const audio = {
      content: audioBytes
    };

    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      model: 'default',
      audioChannelCount: 2 // Added for better stereo audio handling
    };

    const request = {
      audio: audio,
      config: config
    };

    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.json({ 
      success: true,
      transcription,
      language: config.languageCode,
      duration: req.file.buffer.length / (config.sampleRateHertz * 2) // Approx duration in seconds
    });
  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error processing audio file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      success: false,
      error: err.message 
    });
  }
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      details: err.message
    });
  }
  
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});