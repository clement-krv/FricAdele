const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getRecurringExpenses,
    getRecurringByCategory,
    getUserNeo4jStats,
    importCSVData,
    healthCheck
} = require('../controllers/recurringController');

// Routes protégées (nécessitent une authentification)
router.get('/expenses', auth, getRecurringExpenses);
router.get('/categories', auth, getRecurringByCategory);
router.get('/stats', auth, getUserNeo4jStats);

// Routes avec userId en paramètre (pour tester ou admin)
router.get('/expenses/:userId', getRecurringExpenses);
router.get('/categories/:userId', getRecurringByCategory);
router.get('/stats/:userId', getUserNeo4jStats);

// Route administrative pour l'import CSV
router.post('/import-csv', importCSVData);

// Route de vérification de santé
router.get('/health', healthCheck);

module.exports = router;
