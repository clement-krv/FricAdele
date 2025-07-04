const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const statisticsRoutes = require('./routes/statistics');
const recurringRoutes = require('./routes/recurring-simple');
const neo4jRoutes = require('./routes/neo4j');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS configuration - Application de développement uniquement
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Security middleware (après CORS)
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

// Rate limiting - Configuration permissive pour le développement
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOWMS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // 1000 requêtes max
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOWMS || '60000')) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV === 'development' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      console.log('🚀 Rate limit skipé pour localhost en mode dev');
      return true;
    }
    return false;
  }
});

app.use(limiter);

// Logging middleware
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware pour voir les requêtes
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.get('origin')} - IP: ${req.ip}`);
  next();
});

// Database connection
console.log('Démarrage du serveur...');
console.log('Tentative de connexion à MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fricadele')
  .then(() => console.log('MongoDB connecté:', (process.env.MONGODB_URI || 'mongodb://localhost:27017/fricadele').split('/').pop()))
  .catch(err => console.error('Erreur MongoDB:', err));

// Redis connection
const redis = require('./utils/redis');

// Initialize AI services
const chromaService = require('./services/chromaService');
const aiService = require('./services/aiService');

// Initialize ChromaDB on startup
chromaService.initialize()
  .then(() => {
    console.log('✅ ChromaDB initialisé');
    // Commenté temporairement à cause du problème d'embedding
    // return aiService.initializeTips();
  })
  .then(() => {
    console.log('✅ Conseils IA initialisés');
  })
  .catch(err => {
    console.error('❌ Erreur lors de l\'initialisation des services IA:', err);
  });

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FricAdele API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/neo4j', neo4jRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Catch all route for unmatched requests
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, fermeture propre du serveur...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, fermeture propre du serveur...');
  mongoose.connection.close();
  process.exit(0);
});
