const axios = require('axios');
const fs = require('fs');
const path = require('path');

const transcribeWithDeepgram = async (audioPath) => {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('Deepgram API key is missing');
    }

    console.log('Reading audio file...');
    const audioData = fs.readFileSync(audioPath);
    const fileExt = path.extname(audioPath).toLowerCase();

    // Determine content type based on file extension
    let contentType = 'audio/*';
    if (fileExt === '.wav') contentType = 'audio/wav';
    else if (fileExt === '.mp3') contentType = 'audio/mpeg';
    else if (fileExt === '.webm') contentType = 'audio/webm';
    else if (fileExt === '.ogg') contentType = 'audio/ogg';
    else if (fileExt === '.m4a') contentType = 'audio/x-m4a';

    console.log('Sending to Deepgram...');
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      audioData,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': contentType
        },
        timeout: 60000, // Increased timeout to 60 seconds
        params: {
          model: 'nova-2',
          language: 'en-US',
          punctuate: true,
          diarize: false,
          smart_format: true
        }
      }
    );

    if (!response.data.results?.channels[0]?.alternatives[0]?.transcript) {
      throw new Error('No transcription returned from Deepgram');
    }

    const transcript = response.data.results.channels[0].alternatives[0].transcript;
    console.log('Received transcript. Character count:', transcript.length);
    return transcript;

  } catch (error) {
    console.error('Deepgram API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Deepgram API key');
    } else if (error.response?.status === 413) {
      throw new Error('Audio file too large for Deepgram');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid audio format or corrupted file');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - audio file may be too large or processing took too long');
    }
    
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

module.exports = { transcribeWithDeepgram };