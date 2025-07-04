const chromaService = require('./chromaService');
const Redis = require('redis');

class AIAssistantService {
  constructor() {
    this.redisClient = null;
    this.initRedis();
  }

  async initRedis() {
    try {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error', err);
      });
      
      await this.redisClient.connect();
      console.log('Redis connected for AI Assistant');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  // Traiter une question de l'utilisateur
  async processQuery(userId, query, sessionId = null) {
    try {
      // Générer un sessionId si non fourni
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // 1. Récupérer les données utilisateur pertinentes
      const userInfo = await chromaService.queryUserData(userId, query, 5);
      
      // 2. Récupérer les conseils généraux pertinents
      const tips = await chromaService.queryTips(query, 3);
      
      // 3. Récupérer l'historique de conversation récent
      const chatHistory = await this.getChatHistory(userId, sessionId, 6);
      
      // 4. Construire le prompt
      const prompt = await this.buildPrompt(query, userInfo, tips, chatHistory);
      
      // 5. Envoyer à Mistral AI
      const response = await this.callMistralAPI(prompt);
      
      // 6. Sauvegarder la conversation
      await this.saveChatMessage(userId, sessionId, 'user', query);
      await this.saveChatMessage(userId, sessionId, 'assistant', response);
      
      return {
        response,
        sessionId,
        sources: {
          userDataCount: userInfo.documents?.flat().length || 0,
          tipsCount: tips.documents?.flat().length || 0
        }
      };
    } catch (error) {
      console.error('Error processing AI query:', error);
      throw new Error('Erreur lors du traitement de votre question');
    }
  }

  // Construire le prompt pour Mistral
  async buildPrompt(query, userInfo, tips, chatHistory) {
    const contextUser = userInfo.documents?.flat().join('\n') || 'Aucune donnée utilisateur disponible.';
    const contextTips = tips.documents?.flat().join('\n') || 'Aucun conseil disponible.';
    
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = '\n\nContexte de la conversation précédente :\n';
      chatHistory.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'Utilisateur' : 'Assistant';
        conversationContext += `${role} : ${msg.content}\n`;
      });
    }

    const prompt = `Tu es un assistant expert en gestion de budget personnel. Tu aides les utilisateurs à mieux gérer leurs finances en analysant leurs données personnelles et en donnant des conseils pratiques.

Informations sur le budget de l'utilisateur :
${contextUser}

Conseils généraux en gestion de budget :
${contextTips}${conversationContext}

Maintenant, réponds à cette question de manière personnalisée et pratique :
${query}

Instructions importantes :
- Base-toi sur les données personnelles de l'utilisateur quand c'est pertinent
- Donne des conseils concrets et actionables
- Utilise un ton amical et encourageant
- Si tu n'as pas assez d'informations, pose des questions clarifiantes
- Reste dans le domaine de la gestion de budget et des finances personnelles`;

    return prompt;
  }

  // Appeler l'API Mistral
  async callMistralAPI(prompt) {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistral-small-latest', // Utilise le dernier modèle small recommandé
          messages: [
            { 
              role: 'system', 
              content: 'Tu es un assistant expert en gestion de budget et finances personnelles. Tu donnes des conseils pratiques et personnalisés basés sur les données de l\'utilisateur.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7, // Équilibre entre créativité et cohérence
          max_tokens: 1500, // Augmenté pour des réponses plus détaillées
          top_p: 1.0,
          frequency_penalty: 0.1, // Évite les répétitions
          presence_penalty: 0.1 // Encourage la diversité
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Mistral API error:', response.status, errorData);
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Log pour le monitoring des coûts
      if (data.usage) {
        console.log(`Mistral API usage: ${data.usage.prompt_tokens} prompt + ${data.usage.completion_tokens} completion = ${data.usage.total_tokens} tokens`);
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      throw new Error('Erreur lors de la génération de la réponse IA');
    }
  }

  // Sauvegarder un message de chat
  async saveChatMessage(userId, sessionId, role, content) {
    try {
      // Sauvegarder dans ChromaDB
      await chromaService.addChatMessage(userId, sessionId, role, content);
      
      // Sauvegarder dans Redis pour un accès rapide
      if (this.redisClient) {
        const sessionKey = `chat:session:${userId}:${sessionId}`;
        const message = JSON.stringify({ role, content, timestamp: new Date().toISOString() });
        await this.redisClient.rPush(sessionKey, message);
        
        // Garder seulement les 20 derniers messages
        await this.redisClient.lTrim(sessionKey, -20, -1);
        
        // Expirer après 24 heures
        await this.redisClient.expire(sessionKey, 86400);
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  // Récupérer l'historique de chat depuis Redis (plus rapide)
  async getChatHistory(userId, sessionId, limit = 10) {
    try {
      if (!this.redisClient) {
        return [];
      }

      const sessionKey = `chat:session:${userId}:${sessionId}`;
      const messages = await this.redisClient.lRange(sessionKey, -limit, -1);
      
      return messages.map(msg => JSON.parse(msg));
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Synchroniser les données utilisateur
  async syncUserData(userId) {
    try {
      // Cette méthode sera appelée pour synchroniser les données depuis la DB
      // Elle sera implémentée dans le contrôleur pour accéder aux modèles
      console.log(`Syncing data for user ${userId}`);
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  }

  // Initialiser les conseils généraux
  async initializeTips() {
    try {
      const tips = [
        "Réduis tes abonnements inutilisés : fais le point chaque trimestre pour désactiver ceux que tu n'utilises plus (ex : streaming, salle de sport, logiciels).",
        "Utilise la méthode des enveloppes pour contrôler tes dépenses variables (alimentation, loisirs, etc.).",
        "Fixe-toi un budget mensuel pour chaque catégorie de dépense et respecte-le strictement.",
        "Automatise l'épargne en mettant en place un virement automatique vers un compte épargne dès que tu reçois ton salaire.",
        "Compare les prix avant chaque achat important : utilise des comparateurs en ligne ou des extensions de navigateur.",
        "Analyse tes dépenses mensuelles pour identifier les postes de dépenses les plus élevés et définir des priorités.",
        "Prévois un fonds d'urgence équivalent à 3 à 6 mois de dépenses pour faire face aux imprévus.",
        "Fais les courses avec une liste et évite d'acheter en dehors de celle-ci pour limiter les achats impulsifs.",
        "Privilégie les achats d'occasion ou le reconditionné pour les équipements électroniques ou les meubles.",
        "Cuisiner chez soi au lieu de commander ou de manger à l'extérieur peut économiser jusqu'à 300€ par mois.",
        "Active les alertes bancaires pour suivre en temps réel les sorties importantes d'argent ou les soldes bas.",
        "Négocie régulièrement tes contrats (téléphonie, assurance, internet) pour bénéficier de meilleures offres.",
        "Planifie tes repas à la semaine pour limiter le gaspillage alimentaire et réduire ton budget courses.",
        "Paye tes factures à temps pour éviter les pénalités de retard ou les frais d'agios bancaires.",
        "Regroupe tes crédits si tu en as plusieurs pour alléger tes mensualités (à condition de le faire avec prudence).",
        "Évite de fractionner tes paiements sans raison valable : cela induit des frais souvent cachés.",
        "Note chaque dépense, même minime, pendant un mois complet pour mieux comprendre ton comportement financier.",
        "Fixe-toi un objectif financier (voyage, achat, épargne) et utilise-le comme motivation au quotidien.",
        "Vérifie tes relevés bancaires tous les mois pour détecter d'éventuelles erreurs ou abonnements oubliés.",
        "Alloue une enveloppe mensuelle pour les imprévus afin de ne pas déséquilibrer ton budget en cas de besoin.",
        "Garde tes dépenses fixes (loyer, crédits, abonnements) sous 50 % de tes revenus nets mensuels.",
        "Réserve une part de ton budget mensuel pour les loisirs, sans culpabiliser, mais en gardant une limite claire.",
        "Définis des priorités : certaines dépenses peuvent être reportées ou évitées pour respecter ton budget global.",
        "Utilise un outil ou une application de gestion de budget pour suivre l'évolution de tes finances dans le temps.",
        "Crée des catégories de dépenses personnalisées qui correspondent à ton mode de vie pour mieux visualiser tes postes de dépenses."
      ];

      await chromaService.addTips(tips);
      console.log('Tips initialized successfully');
    } catch (error) {
      console.error('Error initializing tips:', error);
    }
  }
}

module.exports = new AIAssistantService();
