#!/bin/bash

# Speech-to-Text Backend Deployment Script
# This script helps with deployment setup and testing

set -e

echo "🚀 Speech-to-Text Backend Deployment Helper"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys"
    echo "   Required: DEEPGRAM_API_KEY"
    echo "   Optional: GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CLOUD_PROJECT_ID"
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Test local server
echo "🧪 Testing local server..."
echo "Starting server in background..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
echo "🔍 Testing health endpoint..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Server is running and healthy!"
    echo "📍 Health endpoint: http://localhost:3001/api/health"
    echo "🎤 Transcribe endpoint: http://localhost:3001/api/transcribe"
else
    echo "❌ Server health check failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stop server
echo "🛑 Stopping test server..."
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "🎉 Setup complete! Your application is ready for deployment."
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Test locally: npm start"
echo "3. Deploy to Render: Follow DEPLOYMENT.md"
echo "4. Deploy to Vercel: Follow DEPLOYMENT.md"
echo ""
echo "📚 Documentation:"
echo "- README.md - General setup and usage"
echo "- DEPLOYMENT.md - Deployment instructions"
echo "- .env.example - Environment variables reference"