const AI_LIMITS = {
  DAILY_MESSAGE_LIMIT: 50, // Limite quotidienne par défaut
  PREMIUM_DAILY_LIMIT: 200, // Limite pour les utilisateurs premium (futur)
  RATE_LIMIT_WINDOW: 24 * 60 * 60, // 24 heures en secondes
  WARNING_THRESHOLD: 0.8 // Avertir à 80% de la limite
};

module.exports = AI_LIMITS;
