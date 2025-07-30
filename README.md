# Speech-to-Text Backend

A Node.js backend service for audio transcription using Google Cloud Speech API and Deepgram.

## Features

- Audio file transcription (WAV, MP3, WebM, OGG, M4A)
- Support for multiple transcription services (Google Cloud Speech, Deepgram)
- File upload handling with size limits (25MB)
- Rate limiting and CORS protection
- Automatic cleanup of temporary files

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /api/transcribe` - Upload and transcribe audio files
- `GET /api/health` - Health check endpoint

## Environment Variables

- `DEEPGRAM_API_KEY` - Deepgram API key
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud credentials
- `GOOGLE_CLOUD_PROJECT_ID` - Google Cloud project ID
- `PORT` - Server port (default: 3001)

## Supported Audio Formats

- WAV, MP3, WebM, OGG, M4A
- Maximum file size: 25MB

## Deployment

The service can be deployed to:
- Render (see `render.yaml`)
- Vercel (see `vercel.json`)

## License

ISC