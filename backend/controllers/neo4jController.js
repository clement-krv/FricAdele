const neo4jService = require('../utils/neo4j');
const Expense = require('../models/Expense');

// Importer les dépenses d'un utilisateur vers Neo4j
const importUserToNeo4j = async (req, res, next) => {
  try {
    // Utiliser UNIQUEMENT l'utilisateur authentifié
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }
    
    const userId = req.user.id;
    
    // Récupérer les dépenses MongoDB
    const expenses = await Expense.find({ user: userId })
      .populate('category')
      .sort({ date: -1 });

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune dépense trouvée pour cet utilisateur'
      });
    }

    // Vérifier la connexion Neo4j
    const isConnected = await neo4jService.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Service Neo4j indisponible'
      });
    }

    // Importer vers Neo4j
    await neo4jService.importUserExpenses(userId, expenses);

    res.status(200).json({
      success: true,
      message: `${expenses.length} dépenses importées avec succès vers Neo4j`,
      data: {
        userId,
        expensesCount: expenses.length
      }
    });

  } catch (error) {
    console.error('Erreur import Neo4j:', error);
    next(error);
  }
};

// Détecter les dépenses récurrentes
const getRecurringExpenses = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }
    
    const userId = req.user.id;
    const monthsBack = parseInt(req.query.months) || 2;

    // Vérifier la connexion Neo4j
    const isConnected = await neo4jService.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Service Neo4j indisponible'
      });
    }

    // Rechercher les récurrences
    const recurringExpenses = await neo4jService.findRecurringExpenses(userId, monthsBack);

    res.status(200).json({
      success: true,
      message: `${recurringExpenses.length} dépenses récurrentes trouvées`,
      data: {
        userId,
        monthsAnalyzed: monthsBack,
        recurringExpenses,
        summary: {
          totalRecurring: recurringExpenses.length,
          totalOccurrences: recurringExpenses.reduce((sum, exp) => sum + exp.occurrences, 0),
          totalAmount: recurringExpenses.reduce((sum, exp) => sum + (exp.amount * exp.occurrences), 0)
        }
      }
    });

  } catch (error) {
    console.error('Erreur recherche récurrences:', error);
    next(error);
  }
};

// Analyser les récurrences potentielles
const getPotentialRecurrences = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }
    
    const userId = req.user.id;
    const monthsBack = parseInt(req.query.months) || 6;

    // Vérifier la connexion Neo4j
    const isConnected = await neo4jService.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Service Neo4j indisponible'
      });
    }

    // Analyser les récurrences potentielles
    const potentialRecurrences = await neo4jService.findPotentialRecurrences(userId, monthsBack);

    res.status(200).json({
      success: true,
      message: `${potentialRecurrences.length} récurrences potentielles trouvées`,
      data: {
        userId,
        monthsAnalyzed: monthsBack,
        potentialRecurrences: potentialRecurrences.map(expense => ({
          ...expense,
          averageInterval: expense.dates.length > 1 ? 
            Math.round((new Date(expense.dates[expense.dates.length - 1]) - new Date(expense.dates[0])) / 
            (1000 * 60 * 60 * 24) / (expense.dates.length - 1)) : 0,
          isLikelyRecurring: expense.frequency >= 3
        }))
      }
    });

  } catch (error) {
    console.error('Erreur analyse récurrences potentielles:', error);
    next(error);
  }
};

// Obtenir les statistiques Neo4j
const getNeo4jStats = async (req, res, next) => {
  try {
    // Vérifier la connexion Neo4j
    const isConnected = await neo4jService.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Service Neo4j indisponible'
      });
    }

    const stats = await neo4jService.getStats();

    res.status(200).json({
      success: true,
      message: 'Statistiques Neo4j récupérées',
      data: stats
    });

  } catch (error) {
    console.error('Erreur stats Neo4j:', error);
    next(error);
  }
};

// Test de connexion Neo4j
const testNeo4jConnection = async (req, res, next) => {
  try {
    const isConnected = await neo4jService.connect();
    
    if (isConnected) {
      const stats = await neo4jService.getStats();
      
      res.status(200).json({
        success: true,
        message: 'Connexion Neo4j opérationnelle',
        data: {
          connected: true,
          stats
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Impossible de se connecter à Neo4j',
        data: {
          connected: false
        }
      });
    }

  } catch (error) {
    console.error('Erreur test connexion Neo4j:', error);
    res.status(503).json({
      success: false,
      message: 'Erreur lors du test de connexion Neo4j',
      error: error.message
    });
  }
};

// Nettoyer les données Neo4j (développement uniquement)
const clearNeo4jData = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Opération non autorisée en production'
      });
    }

    const isConnected = await neo4jService.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Service Neo4j indisponible'
      });
    }

    await neo4jService.clearAllData();

    res.status(200).json({
      success: true,
      message: 'Toutes les données Neo4j ont été supprimées'
    });

  } catch (error) {
    console.error('Erreur suppression données Neo4j:', error);
    next(error);
  }
};



// Endpoint de débogage pour analyser les récurrences
const debugRecurringExpenses = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId || 'test-user-123';
    const monthsBack = parseInt(req.query.months) || 6;

    console.log(`🔍 Debug récurrences pour ${userId} sur ${monthsBack} mois`);

    // Vérifier la connexion Neo4j
    const isConnected = await neo4jService.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Service Neo4j indisponible'
      });
    }

    // Analyser avec débogage
    await neo4jService.debugRecurringExpenses(userId, monthsBack);

    res.status(200).json({
      success: true,
      message: 'Analyse de débogage effectuée, voir logs serveur'
    });

  } catch (error) {
    console.error('Erreur debug récurrences:', error);
    next(error);
  }
};

module.exports = {
  importUserToNeo4j,
  getRecurringExpenses,
  getPotentialRecurrences,
  getNeo4jStats,
  testNeo4jConnection,
  clearNeo4jData,
  debugRecurringExpenses
};
