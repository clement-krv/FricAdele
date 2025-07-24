const redis = require('redis');
const AI_LIMITS = require('../config/aiLimits');

class AILimitService {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_AI_URL || process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.client.connect().catch(console.error);
  }

  // Clé Redis pour les limites utilisateur
  getUserLimitKey(userId) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `ai_limit:${userId}:${today}`;
  }

  // Vérifier si l'utilisateur peut envoyer un message
  async canSendMessage(userId, userType = 'basic') {
    try {
      const key = this.getUserLimitKey(userId);
      const currentCount = await this.client.get(key) || 0;
      
      const limit = userType === 'premium' 
        ? AI_LIMITS.PREMIUM_DAILY_LIMIT 
        : AI_LIMITS.DAILY_MESSAGE_LIMIT;

      return {
        canSend: parseInt(currentCount) < limit,
        currentCount: parseInt(currentCount),
        limit: limit,
        remaining: limit - parseInt(currentCount),
        resetTime: this.getResetTime()
      };
    } catch (error) {
      console.error('Erreur vérification limite IA:', error);
      // En cas d'erreur Redis, on permet l'envoi (fallback)
      return { canSend: true, currentCount: 0, limit: AI_LIMITS.DAILY_MESSAGE_LIMIT };
    }
  }

  // Incrémenter le compteur de messages
  async incrementMessageCount(userId) {
    try {
      const key = this.getUserLimitKey(userId);
      const pipeline = this.client.multi();
      
      pipeline.incr(key);
      pipeline.expire(key, AI_LIMITS.RATE_LIMIT_WINDOW);
      
      const results = await pipeline.exec();
      return results[0][1]; // Nouveau count
    } catch (error) {
      console.error('Erreur incrémentation compteur IA:', error);
      return null;
    }
  }

  // Obtenir les statistiques d'usage
  async getUsageStats(userId) {
    try {
      const status = await this.canSendMessage(userId);
      const warningThreshold = Math.floor(status.limit * AI_LIMITS.WARNING_THRESHOLD);
      
      return {
        ...status,
        isNearLimit: status.currentCount >= warningThreshold,
        warningThreshold,
        percentageUsed: Math.round((status.currentCount / status.limit) * 100)
      };
    } catch (error) {
      console.error('Erreur récupération stats IA:', error);
      return null;
    }
  }

  // Calculer l'heure de reset (minuit prochaine)
  getResetTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  // Réinitialiser le compteur (admin seulement)
  async resetUserLimit(userId) {
    try {
      const key = this.getUserLimitKey(userId);
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Erreur reset limite IA:', error);
      return false;
    }
  }
}

module.exports = new AILimitService();
