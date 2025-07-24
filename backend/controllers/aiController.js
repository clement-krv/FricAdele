const aiService = require('../services/aiService');
const chromaService = require('../services/chromaService');
const aiLimitService = require('../services/aiLimitService');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

const aiController = {
  // Traiter une question de l'utilisateur
  async askAssistant(req, res) {
    try {
      const { query, sessionId } = req.body;
      const userId = req.user.id;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La question ne peut pas être vide'
        });
      }

      // Vérifier la limite d'usage
      const limitStatus = await aiLimitService.canSendMessage(userId);
      
      if (!limitStatus.canSend) {
        return res.status(429).json({
          success: false,
          error: 'Limite quotidienne atteinte',
          message: `Vous avez atteint votre limite quotidienne de ${limitStatus.limit} messages. Réessayez demain.`,
          limitInfo: {
            currentCount: limitStatus.currentCount,
            limit: limitStatus.limit,
            resetTime: limitStatus.resetTime
          }
        });
      }

      // Synchroniser les données utilisateur avant de traiter la question
      await aiController.syncUserData(userId);

      // Traiter la question
      const result = await aiService.processQuery(userId, query, sessionId);

      // Incrémenter le compteur après succès
      await aiLimitService.incrementMessageCount(userId);

      // Récupérer les nouvelles stats
      const usageStats = await aiLimitService.getUsageStats(userId);

      res.json({
        success: true,
        data: result,
        usageInfo: {
          remaining: usageStats.remaining,
          total: usageStats.limit,
          isNearLimit: usageStats.isNearLimit,
          percentageUsed: usageStats.percentageUsed
        }
      });
    } catch (error) {
      console.error('Error in askAssistant:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du traitement de votre question'
      });
    }
  },

  // Synchroniser les données utilisateur avec ChromaDB
  async syncUserData(userId) {
    try {
      // Récupérer les dépenses de l'utilisateur
      const expenses = await Expense.find({ user: userId })
        .populate('category')
        .populate('tags')
        .sort({ date: -1 })
        .limit(100); // Limiter aux 100 dernières dépenses

      // Synchroniser avec ChromaDB
      if (expenses.length > 0) {
        await chromaService.syncUserExpenses(userId, expenses);
      }

      // TODO: Synchroniser d'autres données comme les objectifs si implémentés
      
      console.log(`Synchronized ${expenses.length} expenses for user ${userId}`);
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  },

  // Obtenir l'historique de chat
  async getChatHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;

      const history = await aiService.getChatHistory(userId, sessionId, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  },

  // Initialiser l'assistant (conseils généraux)
  async initializeAssistant(req, res) {
    try {
      await aiService.initializeTips();
      
      res.json({
        success: true,
        message: 'Assistant initialisé avec succès'
      });
    } catch (error) {
      console.error('Error in initializeAssistant:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'initialisation de l\'assistant'
      });
    }
  },

  // Obtenir des suggestions de questions
  async getSuggestions(req, res) {
    try {
      const userId = req.user.id;
      
      // Récupérer quelques dépenses récentes pour personnaliser les suggestions
      const recentExpenses = await Expense.find({ user: userId })
        .populate('category')
        .sort({ date: -1 })
        .limit(5);

      const categories = await Category.find({ user: userId });

      // Générer des suggestions personnalisées
      const suggestions = [];

      // Suggestions générales
      suggestions.push(
        "Comment puis-je réduire mes dépenses mensuelles ?",
        "Quels sont mes postes de dépenses les plus importants ?",
        "Comment créer un budget efficace ?"
      );

      // Suggestions basées sur les catégories
      if (categories.length > 0) {
        const categoryNames = categories.slice(0, 3).map(cat => cat.name);
        suggestions.push(`Comment optimiser mes dépenses en ${categoryNames.join(', ')} ?`);
      }

      // Suggestions basées sur les dépenses récentes
      if (recentExpenses.length > 0) {
        const totalRecent = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        if (totalRecent > 500) {
          suggestions.push("Mes dépenses récentes sont-elles normales ?");
        }
      }

      res.json({
        success: true,
        data: suggestions.slice(0, 6) // Limiter à 6 suggestions
      });
    } catch (error) {
      console.error('Error in getSuggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération des suggestions'
      });
    }
  },

  // Forcer la synchronisation des données
  async forceSyncData(req, res) {
    try {
      const userId = req.user.id;
      await aiController.syncUserData(userId);
      
      res.json({
        success: true,
        message: 'Données synchronisées avec succès'
      });
    } catch (error) {
      console.error('Error in forceSyncData:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la synchronisation des données'
      });
    }
  },

  // Nouvelle méthode pour récupérer les stats d'usage
  async getUsageStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await aiLimitService.getUsageStats(userId);
      
      if (!stats) {
        return res.status(500).json({ 
          success: false,
          error: 'Erreur récupération statistiques' 
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur stats IA:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erreur interne du serveur' 
      });
    }
  }
};

module.exports = aiController;
