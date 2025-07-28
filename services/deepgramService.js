const axios = require('axios');
const fs = require('fs');

const transcribeWithDeepgram = async (audioPath) => {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('Deepgram API key is missing');
    }

    console.log('Reading audio file...');
    const audioData = fs.readFileSync(audioPath);

    console.log('Sending to Deepgram...');
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      audioData,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/*'
        },
        timeout: 30000
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
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

module.exports = { transcribeWithDeepgram };