#!/bin/bash

# Script to push speech-to-text backend to your GitHub account
# Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub username"
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./push-to-github.sh john-doe"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="speech-to-text-backend"

echo "🚀 Pushing Speech-to-Text Backend to Your GitHub Account"
echo "========================================================"
echo "GitHub Username: $GITHUB_USERNAME"
echo "Repository Name: $REPO_NAME"
echo ""

# Check if git is configured
if ! git config --global user.name > /dev/null 2>&1; then
    echo "⚠️  Git user.name not configured. Please set it:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
    echo ""
    read -p "Press Enter to continue after setting git config..."
fi

# Add your repository as a new remote
echo "📡 Adding your GitHub repository as remote..."
git remote add my-account https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Check if remote was added successfully
if git remote get-url my-account > /dev/null 2>&1; then
    echo "✅ Remote 'my-account' added successfully"
else
    echo "❌ Failed to add remote. Please check your repository URL"
    exit 1
fi

# Create a new branch for your version
echo "🌿 Creating new branch for your version..."
git checkout -b main

# Add all files
echo "📁 Adding all files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: Speech-to-Text Backend with deployment configs

- Fixed 500 error in audio processing
- Added dual API support (Google Cloud + Deepgram)
- Added deployment configs for Render and Vercel
- Enhanced error handling and logging
- Added comprehensive documentation
- Support for multiple audio formats"

# Push to your repository
echo "🚀 Pushing to your GitHub repository..."
git push -u my-account main

echo ""
echo "🎉 Successfully pushed to your GitHub account!"
echo ""
echo "📍 Your repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "2. Add your API keys as repository secrets (for deployment)"
echo "3. Deploy to Render or Vercel using the guides in DEPLOYMENT.md"
echo ""
echo "🔧 To deploy:"
echo "- Render: https://dashboard.render.com"
echo "- Vercel: https://vercel.com/dashboard"
echo ""
echo "📚 Documentation:"
echo "- README.md - Setup and usage"
echo "- DEPLOYMENT.md - Deployment instructions"
echo "- DEPLOYMENT_COMPARISON.md - Platform comparison"