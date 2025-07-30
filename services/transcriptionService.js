const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const transcribeAudio = async (filePath) => {
  const audio = fs.readFileSync(filePath);
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audio,
    { model: 'nova-2' }
  );
  if (error) throw error;
  return result.results.channels[0].alternatives[0].transcript;
};

module.exports = { transcribeAudio };