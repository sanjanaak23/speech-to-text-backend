require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const speech = require('@google-cloud/speech').v1;
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const { transcribeWithDeepgram } = require('./services/deepgramService');

const app = express();

// Enable trust proxy for Render's load balancer
app.set('trust proxy', true);

// Configure CORS
const allowedOrigins = [
  'https://speech-to-text-frontend-7b4qt3wod.vercel.app',
  'http://localhost:3000',
  'https://*.vercel.app',
  'https://*.render.com',
  'https://*.onrender.com'
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

// Initialize Google Cloud clients only if credentials are available
let storage, speechClient;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_CLOUD_PROJECT_ID) {
  try {
    storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });
    speechClient = new speech.SpeechClient();
    console.log('Google Cloud Speech client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Cloud clients:', error.message);
  }
} else {
  console.log('Google Cloud credentials not found, using Deepgram for transcription');
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/webm',
      'audio/ogg',
      'audio/x-wav',
      'audio/x-m4a'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed`), false);
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      googleCloud: !!speechClient,
      deepgram: !!process.env.DEEPGRAM_API_KEY
    }
  });
});

// Transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No audio file provided' 
      });
    }

    console.log('Processing audio file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    let transcription;

    // Try Google Cloud Speech first if available
    if (speechClient) {
      try {
        console.log('Attempting transcription with Google Cloud Speech...');
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
          audioChannelCount: 2
        };

        const request = {
          audio: audio,
          config: config
        };

        const [operation] = await speechClient.longRunningRecognize(request);
        const [response] = await operation.promise();
        
        transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');

        console.log('Google Cloud Speech transcription successful');
      } catch (googleError) {
        console.error('Google Cloud Speech failed:', googleError.message);
        // Fall back to Deepgram
      }
    }

    // Use Deepgram if Google Cloud failed or is not available
    if (!transcription && process.env.DEEPGRAM_API_KEY) {
      try {
        console.log('Attempting transcription with Deepgram...');
        
        // Save file temporarily for Deepgram
        const fs = require('fs');
        const path = require('path');
        const { v4: uuidv4 } = require('uuid');
        
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const tempFilePath = path.join(uploadDir, `temp-${uuidv4()}.webm`);
        fs.writeFileSync(tempFilePath, req.file.buffer);
        
        transcription = await transcribeWithDeepgram(tempFilePath);
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        console.log('Deepgram transcription successful');
      } catch (deepgramError) {
        console.error('Deepgram failed:', deepgramError.message);
        throw new Error('All transcription services failed');
      }
    }

    if (!transcription) {
      return res.status(500).json({
        success: false,
        error: 'No transcription service available. Please check your API keys.'
      });
    }

    res.json({ 
      success: true,
      transcription,
      language: 'en-US',
      duration: req.file.buffer.length / (48000 * 2) // Approx duration in seconds
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
  console.error('Error middleware caught:', err.stack);
  
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
  console.log('Available services:');
  console.log(`- Google Cloud Speech: ${!!speechClient}`);
  console.log(`- Deepgram: ${!!process.env.DEEPGRAM_API_KEY}`);
});