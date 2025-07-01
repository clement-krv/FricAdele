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

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS configuration - DOIT ÊTRE AVANT LES AUTRES MIDDLEWARES
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
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

// Rate limiting avec configuration différente selon l'environnement
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOWMS) || (
    process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000
  ), // 1 minute en dev, 15 minutes en prod
  max: parseInt(process.env.RATE_LIMIT_MAX) || (
    process.env.NODE_ENV === 'development' ? 1000 : 100
  ), // 1000 requêtes en dev, 100 en prod
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOWMS) || 60000) / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip les requêtes de développement local si nécessaire
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      const isLocalHost = req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';
      if (isLocalHost) {
        console.log('🚀 Rate limit skipé pour localhost en mode dev');
      }
      return false; // Ne pas skipper, mais avec des limites élevées
    }
    return false;
  }
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware pour CORS et Rate Limiting
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.get('Origin')} - IP: ${req.ip}`);
    if (req.headers['x-ratelimit-remaining']) {
      console.log(`⏱️  Rate Limit: ${req.headers['x-ratelimit-remaining']} requêtes restantes`);
    }
    next();
  });
}

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Budget Manager API is running',
    timestamp: new Date().toISOString(),
  });
});

// Middleware explicite pour les requêtes OPTIONS (préflight CORS)
app.options('*', (req, res) => {
  console.log('🔄 OPTIONS préflight reçu pour:', req.path);
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/statistics', statisticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    console.log('Tentative de connexion à MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    console.log('Continuant sans MongoDB (certaines fonctionnalités ne marcheront pas)');
    // Ne pas arrêter le serveur, continuer sans DB pour tester
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Démarrage du serveur...');
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
      console.log(`API Health: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`${signal} reçu, arrêt gracieux du serveur...`);
      server.close(() => {
        console.log('Serveur HTTP fermé.');
        mongoose.connection.close(false, () => {
          console.log('Connexion MongoDB fermée.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    // Ne pas arrêter complètement, juste démarrer le serveur HTTP
    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT} (mode dégradé)`);
    });
  }
};

startServer();

module.exports = app;
