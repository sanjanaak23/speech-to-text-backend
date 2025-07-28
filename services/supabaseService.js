const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const storeTranscription = async (filename, transcription, userId) => {
  try {
    const filePath = path.normalize(path.join(__dirname, '../../backend/uploads', filename));
    console.log('Looking for file at:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at: ${filePath}`);
    }

    // Read file as buffer
    const fileData = fs.readFileSync(filePath);
    console.log('File size:', fileData.length, 'bytes');

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(
        `user-${userId}/${filename}`,
        fileData,
        {
          contentType: filename.endsWith('.wav') ? 'audio/wav' : 'audio/webm',
          upsert: true,
          duplex: 'half' // Explicitly set duplex mode
        }
      );

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(`user-${userId}/${filename}`);
    console.log('Public URL:', urlData.publicUrl);

    // Store in database
    const { data, error } = await supabase
      .from('transcriptions')
      .insert([{
        audio_url: urlData.publicUrl,
        transcription,
        user_id: userId,
        created_at: new Date().toISOString()
      }])
      .select(); // Important: Add .select() to return the inserted data

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    // Verify insertion
    const { data: verifyData } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('id', data[0].id);

    console.log('Verified insertion:', verifyData);
    return data[0];

  } catch (error) {
    console.error('Supabase operation failed:', error);
    throw error;
  }
};

module.exports = { storeTranscription };