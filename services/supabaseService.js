const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const storeTranscription = async (filename, transcription, userId = 'anonymous') => {
  try {
    const filePath = path.join(__dirname, '../../backend/uploads', filename);
    
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at: ${filePath}`);
    }

    // Upload to storage
    const fileData = fs.readFileSync(filePath);
    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(`user-${userId}/${filename}`, fileData, {
        contentType: 'audio/*',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(`user-${userId}/${filename}`);

    // Store in database
    const { data, error } = await supabase
      .from('transcriptions')
      .insert([{
        audio_url: publicUrl,
        transcription,
        user_id: userId
      }])
      .select();

    if (error) throw error;
    return data[0];

  } catch (error) {
    console.error('Supabase Error:', error.message);
    throw error;
  }
};

module.exports = { storeTranscription };