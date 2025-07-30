const fs = require('fs');
const path = require('path');
const { transcribeWithDeepSeek } = require('../services/deepSeekService'); // Update this name if needed
const { storeTranscription } = require('../services/supabaseService');

exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('File received:', req.file.originalname);
    console.log('File type:', req.file.mimetype);

    // Save the file temporarily to disk
    const tempFilePath = path.join(__dirname, '..', 'uploads', `${Date.now()}_${req.file.originalname}`);
    fs.writeFileSync(tempFilePath, req.file.buffer);
    console.log('Temporary file saved at:', tempFilePath);

    // Transcribe using your DeepSeek/Deepgram API
    const transcription = await transcribeWithDeepSeek(tempFilePath);

    // Save result to DB (Supabase or Mongo)
    await storeTranscription(path.basename(tempFilePath), transcription, 'anonymous');

    // Delete temp file
    fs.unlinkSync(tempFilePath);

    res.status(200).json({
      success: true,
      transcription,
    });

  } catch (error) {
    console.error('🔥 Controller error:', error.message);

    res.status(500).json({
      error: 'Transcription failed.',
      details: error.message,
    });
  }
};
