require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000']
}));
app.use(express.json());

// Routes
app.use('/api/transcribe', require('./routes/transcribeRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));