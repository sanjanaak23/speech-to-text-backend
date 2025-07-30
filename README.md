# Speech-to-Text Backend

A robust Node.js backend service for converting speech to text using either Google Cloud Speech-to-Text or Deepgram APIs.

## Features

- **Dual API Support**: Automatically falls back between Google Cloud Speech-to-Text and Deepgram
- **Multiple Audio Formats**: Supports WAV, MP3, WebM, OGG, and M4A files
- **File Size Limits**: Handles files up to 25MB
- **Rate Limiting**: Built-in rate limiting for API protection
- **CORS Support**: Configured for cross-origin requests
- **Error Handling**: Comprehensive error handling and logging
- **Health Check**: Built-in health check endpoint

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- API key from either:
  - [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text)
  - [Deepgram](https://deepgram.com/)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd speech-to-text-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Required: At least one transcription service
DEEPGRAM_API_KEY=your-deepgram-api-key

# Optional: Google Cloud Speech-to-Text
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id

# Server configuration
PORT=3001
NODE_ENV=development
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and available transcription services.

### Transcribe Audio
```
POST /api/transcribe
Content-Type: multipart/form-data
```
Upload an audio file for transcription.

**Request:**
- `audio`: Audio file (WAV, MP3, WebM, OGG, M4A)
- Max file size: 25MB

**Response:**
```json
{
  "success": true,
  "transcription": "Your transcribed text here",
  "language": "en-US",
  "duration": 10.5
}
```

## Usage Examples

### Using cURL
```bash
curl -X POST \
  http://localhost:3001/api/transcribe \
  -H 'Content-Type: multipart/form-data' \
  -F 'audio=@/path/to/your/audio.wav'
```

### Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:3001/api/transcribe', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.transcription);
```

## Troubleshooting

### Common Errors

1. **500 Error: "Error processing audio file"**
   - Check if your API keys are properly configured
   - Verify the audio file format is supported
   - Ensure the file size is under 25MB

2. **401 Error: "Invalid API key"**
   - Verify your Deepgram API key is correct
   - Check if your Google Cloud credentials are valid

3. **413 Error: "File too large"**
   - Reduce the audio file size
   - Consider compressing the audio

4. **400 Error: "Invalid file type"**
   - Ensure the audio file is in a supported format
   - Check the file's MIME type

### Debug Mode

Set `NODE_ENV=development` in your `.env` file to get detailed error messages.

### Logs

The server provides detailed logging for:
- File uploads and processing
- API service availability
- Transcription attempts and results
- Error details

## Development

### Running in Development
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

### Building
```bash
npm run build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPGRAM_API_KEY` | Yes* | Deepgram API key for transcription |
| `GOOGLE_APPLICATION_CREDENTIALS` | No | Path to Google Cloud credentials JSON |
| `GOOGLE_CLOUD_PROJECT_ID` | No | Google Cloud project ID |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |

*At least one transcription service (Deepgram or Google Cloud) is required.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License