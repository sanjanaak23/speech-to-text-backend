const fs = require('fs');
const path = require('path');
const { transcribeWithDeepgram } = require('../services/deepgramService');
const { storeTranscription } = require('../services/supabaseService');

exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    console.log('File received at:', audioPath);

    // Verify file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error('File not found after upload');
    }

    const transcription = await transcribeWithDeepgram(audioPath);
    await storeTranscription(path.basename(audioPath), transcription, 'anonymous');

    // Clean up
    fs.unlinkSync(audioPath);

    res.status(200).json({ 
      success: true,
      transcription 
    });
  } catch (error) {
    console.error('Controller error:', error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error; // Pass to error middleware
  }
};