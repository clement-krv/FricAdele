const { ChromaClient } = require('chromadb');
const { v4: uuidv4 } = require('uuid');

class ChromaDBService {
  constructor() {
    this.client = null;
    this.userInfoCollection = null;
    this.tipsCollection = null;
    this.chatHistoryCollection = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      this.client = new ChromaClient({ 
        path: process.env.CHROMADB_URL || 'http://localhost:8000' 
      });

      // Créer ou récupérer les collections
      try {
        this.userInfoCollection = await this.client.getCollection({ name: 'budget_user_info' });
      } catch (error) {
        this.userInfoCollection = await this.client.createCollection({ name: 'budget_user_info' });
      }

      try {
        this.tipsCollection = await this.client.getCollection({ name: 'budget_tips' });
      } catch (error) {
        this.tipsCollection = await this.client.createCollection({ name: 'budget_tips' });
      }

      try {
        this.chatHistoryCollection = await this.client.getCollection({ name: 'chat_history' });
      } catch (error) {
        this.chatHistoryCollection = await this.client.createCollection({ name: 'chat_history' });
      }

      this.isInitialized = true;
      console.log('ChromaDB service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ChromaDB service:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Ajouter des données utilisateur
  async addUserData(userId, data, type = 'expense') {
    await this.ensureInitialized();
    
    const id = uuidv4();
    await this.userInfoCollection.add({
      ids: [id],
      documents: [data],
      metadatas: [{ user_id: userId, type, timestamp: new Date().toISOString() }]
    });
    
    return id;
  }

  // Rechercher des données utilisateur pertinentes
  async queryUserData(userId, query, nResults = 5) {
    await this.ensureInitialized();
    
    const results = await this.userInfoCollection.query({
      queryTexts: [query],
      nResults,
      where: { user_id: userId }
    });
    
    return results;
  }

  // Rechercher des conseils pertinents
  async queryTips(query, nResults = 3) {
    await this.ensureInitialized();
    
    const results = await this.tipsCollection.query({
      queryTexts: [query],
      nResults
    });
    
    return results;
  }

  // Ajouter des conseils généraux
  async addTips(tips) {
    await this.ensureInitialized();
    
    const ids = tips.map(() => uuidv4());
    await this.tipsCollection.add({
      ids,
      documents: tips,
      metadatas: tips.map(() => ({ type: 'general_tip', timestamp: new Date().toISOString() }))
    });
    
    return ids;
  }

  // Ajouter un message de chat à l'historique
  async addChatMessage(userId, sessionId, role, content) {
    await this.ensureInitialized();
    
    const id = uuidv4();
    await this.chatHistoryCollection.add({
      ids: [id],
      documents: [content],
      metadatas: [{ 
        user_id: userId, 
        session_id: sessionId, 
        role, 
        timestamp: new Date().toISOString() 
      }]
    });
    
    return id;
  }

  // Récupérer l'historique de chat récent
  async getChatHistory(userId, sessionId, limit = 10) {
    await this.ensureInitialized();
    
    const results = await this.chatHistoryCollection.query({
      queryTexts: [''], // Requête vide pour récupérer par métadonnées
      nResults: limit,
      where: { user_id: userId, session_id: sessionId }
    });
    
    return results;
  }

  // Synchroniser les dépenses d'un utilisateur
  async syncUserExpenses(userId, expenses) {
    await this.ensureInitialized();
    
    // Supprimer les anciennes dépenses de cet utilisateur
    // Note: ChromaDB ne supporte pas directement la suppression par métadonnées
    // Il faudrait implémenter une logique plus complexe pour gérer les mises à jour
    
    const documents = expenses.map(expense => {
      const date = new Date(expense.date).toLocaleDateString('fr-FR');
      return `Dépense : ${expense.description} - ${expense.amount}€ - ${date} - catégorie : ${expense.category?.name || 'Non catégorisé'}`;
    });
    
    const ids = documents.map(() => uuidv4());
    const metadatas = documents.map((_, index) => ({
      user_id: userId,
      type: 'expense',
      category: expenses[index].category?.name || 'Non catégorisé',
      amount: expenses[index].amount,
      timestamp: new Date().toISOString()
    }));
    
    if (documents.length > 0) {
      await this.userInfoCollection.add({
        ids,
        documents,
        metadatas
      });
    }
    
    return ids;
  }

  // Synchroniser les objectifs d'un utilisateur
  async syncUserGoals(userId, goals) {
    await this.ensureInitialized();
    
    const documents = goals.map(goal => {
      return `Objectif : ${goal.title} - ${goal.targetAmount}€ - ${goal.description || 'Pas de description'}`;
    });
    
    const ids = documents.map(() => uuidv4());
    const metadatas = documents.map(() => ({
      user_id: userId,
      type: 'goal',
      timestamp: new Date().toISOString()
    }));
    
    if (documents.length > 0) {
      await this.userInfoCollection.add({
        ids,
        documents,
        metadatas
      });
    }
    
    return ids;
  }
}

module.exports = new ChromaDBService();
