const express = require('express');
const {
  importUserToNeo4j,
  getRecurringExpenses,
  getPotentialRecurrences,
  getNeo4jStats,
  testNeo4jConnection,
  clearNeo4jData,
  debugRecurringExpenses
} = require('../controllers/neo4jController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Test de connexion Neo4j (pas d'auth requise pour monitoring)
router.get('/test', testNeo4jConnection);

// Statistiques générales Neo4j (pas d'auth requise pour monitoring)
router.get('/stats', getNeo4jStats);

// Debug récurrences (développement uniquement, pas d'auth pour debug)
router.get('/debug-recurring', debugRecurringExpenses);

// Nettoyer toutes les données Neo4j (développement uniquement, pas d'auth pour urgence)
router.delete('/clear', clearNeo4jData);

// Routes protégées (authentification requise)
router.use(protect);

// Importer les dépenses d'un utilisateur vers Neo4j
router.post('/import', importUserToNeo4j);

// Détecter les dépenses récurrentes (périodicité ~30 jours)
router.get('/recurring', getRecurringExpenses);

// Analyser les récurrences potentielles
router.get('/potential-recurring', getPotentialRecurrences);

module.exports = router;
