const fs = require('fs');
const path = require('path');
const { transcribeWithDeepgram } = require('../services/deepgramService');
const { storeTranscription } = require('../services/supabaseService');

exports.transcribeAudio = async (req, res) => {
  let fileDeleted = false;
  try {
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ 
        success: false,
        error: 'No audio file provided' 
      });
    }

    const audioPath = path.normalize(req.file.path);
    console.log('File received at:', audioPath);

    // Verify file exists
    if (!fs.existsSync(audioPath)) {
      console.log('File not found at path:', audioPath);
      throw new Error('Uploaded file not found on server');
    }

    // 1. Transcribe audio
    console.log('Starting transcription...');
    const transcription = await transcribeWithDeepgram(audioPath);
    console.log('Transcription successful. Length:', transcription.length);

    // 2. Store in Supabase
    console.log('Storing in Supabase...');
    const supabaseResult = await storeTranscription(
      path.basename(audioPath),
      transcription,
      'anonymous'
    );
    console.log('Supabase storage successful. Audio URL:', supabaseResult.audio_url);

    // 3. Clean up
    fs.unlinkSync(audioPath);
    fileDeleted = true;
    console.log('Temporary file deleted');

    res.status(200).json({
      success: true,
      transcription,
      audioUrl: supabaseResult.audio_url
    });

  } catch (error) {
    console.error('Controller error:', error);
    
    // Clean up file if still exists
    if (req.file?.path && fs.existsSync(req.file.path) && !fileDeleted) {
      fs.unlinkSync(req.file.path);
      console.log('Cleaned up temporary file after error');
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};