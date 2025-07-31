const express = require('express');
const multer = require('../config/multerConfig');
const { transcribeAudio } = require('../services/transcriptionService');
const router = express.Router();

router.post('/', multer.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const transcription = await transcribeAudio(req.file.path);
    res.json({ transcription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;