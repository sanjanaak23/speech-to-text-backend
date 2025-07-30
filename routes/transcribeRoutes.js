const express = require('express');
const router = express.Router();
const multer = require('../config/multerConfig');
const { transcribeAudio } = require('../services/transcriptionService');
const { storeTranscription } = require('../services/supabaseService');

router.post('/', multer.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No audio file uploaded' 
      });
    }

    // Add CORS headers to response
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');

    const transcription = await transcribeAudio(req.file.path);
    const savedData = await storeTranscription(
      req.file.filename,
      transcription,
      req.user?.id || 'anonymous'
    );

    res.json({
      success: true,
      transcription,
      audioUrl: savedData.audio_url
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;