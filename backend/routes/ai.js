const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// POST /api/ai/ask - Poser une question à l'assistant
router.post('/ask', aiController.askAssistant);

// GET /api/ai/history/:sessionId - Récupérer l'historique d'une session
router.get('/history/:sessionId', aiController.getChatHistory);

// GET /api/ai/suggestions - Obtenir des suggestions de questions
router.get('/suggestions', aiController.getSuggestions);

// POST /api/ai/sync - Forcer la synchronisation des données
router.post('/sync', aiController.forceSyncData);

// POST /api/ai/initialize - Initialiser l'assistant (admin only)
router.post('/initialize', aiController.initializeAssistant);

module.exports = router;
