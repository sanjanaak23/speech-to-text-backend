# Deployment Guide

This guide covers deploying the Speech-to-Text Backend on both Render and Vercel.

## 🚀 Render Deployment (Recommended)

Render is ideal for Node.js applications and provides a generous free tier.

### Prerequisites
- [Render Account](https://render.com)
- [Deepgram API Key](https://deepgram.com) (or Google Cloud credentials)

### Step-by-Step Deployment

1. **Fork/Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd speech-to-text-backend
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub/GitLab account
   - Select your repository

3. **Configure Service**
   - **Name**: `speech-to-text-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && mkdir -p uploads`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables**
   Add these in the Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   DEEPGRAM_API_KEY=your-deepgram-api-key
   GOOGLE_APPLICATION_CREDENTIALS=your-google-credentials-path
   GOOGLE_CLOUD_PROJECT_ID=your-google-project-id
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your application
   - Your API will be available at: `https://your-app-name.onrender.com`

### Render Configuration (render.yaml)
The `render.yaml` file in this repository provides automatic configuration:
```yaml
services:
  - type: web
    name: speech-to-text-backend
    env: node
    plan: free
    buildCommand: npm install && mkdir -p uploads
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/health
```

## ⚡ Vercel Deployment

Vercel is great for serverless deployments but has limitations for file uploads.

### Prerequisites
- [Vercel Account](https://vercel.com)
- [Vercel CLI](https://vercel.com/cli) (optional)

### Step-by-Step Deployment

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Dashboard**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - **Framework Preset**: Node.js
     - **Build Command**: `npm install`
     - **Output Directory**: `.`
     - **Install Command**: `npm install`

3. **Environment Variables**
   Add in Vercel dashboard:
   ```
   DEEPGRAM_API_KEY=your-deepgram-api-key
   GOOGLE_APPLICATION_CREDENTIALS=your-google-credentials
   GOOGLE_CLOUD_PROJECT_ID=your-google-project-id
   ```

4. **Deploy**
   - Click "Deploy"
   - Your API will be available at: `https://your-app-name.vercel.app`

### Vercel Configuration (vercel.json)
The `vercel.json` file configures the deployment:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/index.js"
    }
  ],
  "functions": {
    "index.js": {
      "maxDuration": 60
    }
  }
}
```

## 🔧 Platform-Specific Considerations

### Render Advantages
- ✅ Full Node.js support
- ✅ Persistent file system
- ✅ No cold starts
- ✅ Generous free tier
- ✅ Custom domains
- ✅ SSL certificates

### Vercel Advantages
- ✅ Fast global CDN
- ✅ Automatic deployments
- ✅ Serverless scaling
- ✅ Edge functions support

### Vercel Limitations
- ⚠️ 10MB payload limit (free tier)
- ⚠️ 10-second timeout (free tier)
- ⚠️ No persistent file system
- ⚠️ Cold starts

## 🧪 Testing Your Deployment

### Health Check
```bash
curl https://your-app-name.onrender.com/api/health
# or
curl https://your-app-name.vercel.app/api/health
```

### Test Transcription
```bash
curl -X POST \
  https://your-app-name.onrender.com/api/transcribe \
  -F "audio=@/path/to/audio.wav"
```

## 🔒 Security Considerations

### Environment Variables
- Never commit API keys to your repository
- Use platform-specific environment variable management
- Rotate API keys regularly

### CORS Configuration
The application is configured to allow:
- Local development (`localhost:3000`)
- Vercel domains (`*.vercel.app`)
- Render domains (`*.render.com`, `*.onrender.com`)

### Rate Limiting
- Built-in rate limiting: 100 requests per 15 minutes per IP
- Configure additional limits in production if needed

## 📊 Monitoring

### Health Endpoint
Monitor your application health:
```bash
curl https://your-app-name.onrender.com/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "googleCloud": false,
    "deepgram": true
  }
}
```

### Logs
- **Render**: Available in dashboard under "Logs"
- **Vercel**: Available in dashboard under "Functions" → "View Function Logs"

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Check build logs for specific errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify API keys are valid

3. **CORS Errors**
   - Update `allowedOrigins` in `index.js`
   - Check frontend domain is included
   - Verify HTTPS/HTTP protocol matches

4. **File Upload Issues**
   - Check file size limits (25MB for Render, 10MB for Vercel)
   - Verify supported audio formats
   - Check file upload endpoint

### Support
- **Render**: [Documentation](https://render.com/docs)
- **Vercel**: [Documentation](https://vercel.com/docs)
- **Deepgram**: [API Documentation](https://developers.deepgram.com)

## 🎯 Recommended Setup

For production use, we recommend:

1. **Primary**: Render deployment (better for file uploads)
2. **Secondary**: Vercel deployment (for global CDN benefits)
3. **Monitoring**: Set up health checks and alerts
4. **Backup**: Keep local development environment

This setup provides redundancy and optimal performance for different use cases.