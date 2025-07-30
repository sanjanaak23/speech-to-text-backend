# Push to Your GitHub Account

## 🚀 Quick Push (Recommended)

Use the automated script:
```bash
./push-to-github.sh YOUR_GITHUB_USERNAME
```

Example:
```bash
./push-to-github.sh john-doe
```

## 📋 Manual Steps

If you prefer to do it manually, follow these steps:

### 1. Create Repository on GitHub
1. Go to [GitHub](https://github.com)
2. Click "+" → "New repository"
3. Name: `speech-to-text-backend`
4. Make it **Public**
5. **Don't** initialize with README
6. Click "Create repository"

### 2. Configure Git (if needed)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Add Your Repository
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add my-account https://github.com/YOUR_USERNAME/speech-to-text-backend.git
```

### 4. Create New Branch
```bash
git checkout -b main
```

### 5. Add and Commit Files
```bash
git add .
git commit -m "Initial commit: Speech-to-Text Backend with deployment configs"
```

### 6. Push to Your Repository
```bash
git push -u my-account main
```

## 🎯 What You'll Get

Your repository will include:
- ✅ Fixed speech-to-text API (no more 500 errors)
- ✅ Render deployment config (`render.yaml`)
- ✅ Vercel deployment config (`vercel.json`)
- ✅ Comprehensive documentation
- ✅ Deployment scripts
- ✅ Environment variable templates

## 🚀 Next Steps After Push

1. **Add Environment Variables** (for deployment):
   - Go to your repository settings
   - Add secrets for your API keys

2. **Deploy to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Connect your repository
   - Add environment variables
   - Deploy

3. **Deploy to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your repository
   - Add environment variables
   - Deploy

## 🔧 Environment Variables Needed

```env
# Required (at least one)
DEEPGRAM_API_KEY=your-deepgram-api-key

# Optional
GOOGLE_APPLICATION_CREDENTIALS=your-google-credentials
GOOGLE_CLOUD_PROJECT_ID=your-google-project-id

# Server
NODE_ENV=production
PORT=10000  # For Render
```

## 📚 Documentation

After pushing, you'll have:
- `README.md` - Setup and usage guide
- `DEPLOYMENT.md` - Detailed deployment instructions
- `DEPLOYMENT_COMPARISON.md` - Platform comparison
- `.env.example` - Environment variables template

## 🎉 Success!

Once pushed, your repository will be ready for deployment on both Render and Vercel!