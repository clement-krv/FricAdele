const neo4j = require('neo4j-driver');

class Neo4jService {
  constructor() {
    this.driver = null;
    this.session = null;
  }

  // Initialiser la connexion Neo4j
  async connect() {
    try {
      const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
      const user = process.env.NEO4J_USER || 'neo4j';
      const password = process.env.NEO4J_PASSWORD || 'passw0rd';

      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      
      // Tester la connexion
      await this.driver.verifyConnectivity();
      console.log('✅ Connexion Neo4j établie avec succès');
      
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion Neo4j:', error.message);
      return false;
    }
  }

  // Fermer la connexion
  async close() {
    if (this.driver) {
      await this.driver.close();
      console.log('🔌 Connexion Neo4j fermée');
    }
  }

  // Créer une session
  getSession() {
    if (!this.driver) {
      throw new Error('Driver Neo4j non initialisé');
    }
    return this.driver.session();
  }

  // Importer les données d'un utilisateur MongoDB vers Neo4j
  async importUserExpenses(userId, expenses) {
    const session = this.getSession();
    
    try {
      // Créer l'utilisateur
      await session.run(
        'MERGE (u:User {id: $userId})',
        { userId }
      );

      // Supprimer les anciennes dépenses de cet utilisateur
      await session.run(
        'MATCH (u:User {id: $userId})-[:MADE]->(e:Expense) DETACH DELETE e',
        { userId }
      );

      // Importer toutes les dépenses avec le schéma complet
      for (const expense of expenses) {
        await session.run(`
          MATCH (u:User {id: $userId})
          CREATE (e:Expense {
            id: $expenseId,
            date: date($date),
            amount: $amount,
            description: $description,
            category: $category,
            notes: $notes,
            isRecurring: $isRecurring,
            recurringPeriod: $recurringPeriod,
            tags: $tags,
            createdAt: datetime($createdAt),
            updatedAt: datetime($updatedAt)
          })
          CREATE (u)-[:MADE]->(e)
        `, {
          userId,
          expenseId: expense._id.toString(),
          date: expense.date.toISOString().split('T')[0], // Format YYYY-MM-DD
          amount: expense.amount,
          description: expense.description,
          category: expense.category ? expense.category.name : 'Non catégorisé',
          notes: expense.notes || '',
          isRecurring: expense.isRecurring || false,
          recurringPeriod: expense.recurringPeriod || '',
          tags: expense.tags ? expense.tags.map(tag => tag.name || tag).join(';') : '',
          createdAt: expense.createdAt ? expense.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: expense.updatedAt ? expense.updatedAt.toISOString() : new Date().toISOString()
        });
      }

      console.log(`📊 ${expenses.length} dépenses importées pour l'utilisateur ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur import Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Détecter les dépenses récurrentes pour un utilisateur
  async findRecurringExpenses(userId, monthsBack = 2) {
    const session = this.getSession();
    
    try {
      // Récupérer toutes les dépenses dans la période avec tri explicite
      const result = await session.run(`
        WITH date() AS today
        MATCH (u:User {id: $userId})-[:MADE]->(e:Expense)
        WHERE e.date >= today - duration({months: $monthsBack})
        RETURN e.description AS description,
               e.amount AS amount,
               e.date AS expense_date
        ORDER BY e.description, e.amount, e.date
      `, { 
        userId,
        monthsBack: neo4j.int(monthsBack)
      });

      // Grouper les dépenses par description et montant
      const expenseGroups = {};
      result.records.forEach(record => {
        const key = `${record.get('description')}_${record.get('amount')}`;
        if (!expenseGroups[key]) {
          expenseGroups[key] = {
            description: record.get('description'),
            amount: record.get('amount'),
            dates: []
          };
        }
        expenseGroups[key].dates.push(record.get('expense_date'));
      });

      // Analyser les récurrences (2+ occurrences avec intervalles ~30 jours)
      const recurringExpenses = [];
      
      Object.values(expenseGroups).forEach(group => {
        if (group.dates.length >= 2) {
          // Trier les dates
          group.dates.sort((a, b) => a.toString().localeCompare(b.toString()));
          
          // Calculer les intervalles entre dates consécutives
          const intervals = [];
          for (let i = 1; i < group.dates.length; i++) {
            const prevDate = new Date(group.dates[i-1].toString());
            const currDate = new Date(group.dates[i].toString());
            const diffMs = currDate.getTime() - prevDate.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            intervals.push(diffDays);
          }
          
          // Vérifier si tous les intervalles sont ~30 jours (±7)
          const isRecurring = intervals.every(interval => Math.abs(interval - 30) <= 7);
          
          if (isRecurring) {
            recurringExpenses.push({
              description: group.description,
              amount: group.amount,
              dates: group.dates.map(date => date.toString()),
              occurrences: group.dates.length,
              intervals: intervals
            });
          }
        }
      });

      // Trier par nombre d'occurrences décroissant
      recurringExpenses.sort((a, b) => b.occurrences - a.occurrences);

      console.log(`🔍 ${recurringExpenses.length} dépenses récurrentes trouvées pour ${userId}`);
      return recurringExpenses;
    } catch (error) {
      console.error('❌ Erreur recherche récurrences:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Analyser toutes les récurrences potentielles (description + montant identiques)
  async findPotentialRecurrences(userId, monthsBack = 6) {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        WITH date() AS today
        MATCH (u:User {id: $userId})-[:MADE]->(e:Expense)
        WHERE e.date >= today - duration({months: $monthsBack})
        WITH e.description AS desc, e.amount AS amt, collect(e.date) AS dates
        WHERE size(dates) >= 2
        RETURN desc AS description,
               amt AS amount,
               dates,
               size(dates) AS frequency
        ORDER BY frequency DESC, description
      `, { 
        userId,
        monthsBack: neo4j.int(monthsBack)
      });

      const potentialRecurrences = result.records.map(record => ({
        description: record.get('description'),
        amount: record.get('amount'),
        dates: record.get('dates').map(date => date.toString()),
        frequency: record.get('frequency').toNumber()
      }));

      return potentialRecurrences;
    } catch (error) {
      console.error('❌ Erreur analyse récurrences potentielles:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Statistiques générales Neo4j
  async getStats() {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (u:User)-[:MADE]->(e:Expense)
        RETURN count(DISTINCT u) AS total_users,
               count(e) AS total_expenses,
               min(e.date) AS earliest_date,
               max(e.date) AS latest_date,
               round(sum(e.amount), 2) AS total_amount
      `);

      const record = result.records[0];
      return {
        totalUsers: record.get('total_users').toNumber(),
        totalExpenses: record.get('total_expenses').toNumber(),
        earliestDate: record.get('earliest_date')?.toString(),
        latestDate: record.get('latest_date')?.toString(),
        totalAmount: record.get('total_amount')
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Nettoyer toutes les données Neo4j
  async clearAllData() {
    const session = this.getSession();
    
    try {
      await session.run('MATCH (n) DETACH DELETE n');
      console.log('🗑️ Toutes les données Neo4j supprimées');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression données:', error);
      throw error;
    } finally {
      await session.close();
    }
  }



  // Méthode de débogage pour comprendre la détection des récurrences
  async debugRecurringExpenses(userId, monthsBack = 2) {
    const session = this.getSession();
    
    try {
      // D'abord, regardons toutes les dépenses de l'utilisateur
      const allExpenses = await session.run(`
        MATCH (u:User {id: $userId})-[:MADE]->(e:Expense)
        RETURN e.description AS description, e.amount AS amount, e.date AS date
        ORDER BY e.date DESC
      `, { userId });

      console.log('📊 Toutes les dépenses de', userId, ':');
      allExpenses.records.forEach(record => {
        console.log(`  - ${record.get('date')} : ${record.get('description')} (${record.get('amount')}€)`);
      });

      // Ensuite, vérifions les groupes par description et montant
      const groups = await session.run(`
        WITH date() AS today
        MATCH (u:User {id: $userId})-[:MADE]->(e:Expense)
        WHERE e.date >= today - duration({months: $monthsBack})
        WITH e.description AS desc, e.amount AS amt, collect(e.date) AS dates
        WHERE size(dates) >= 2
        RETURN desc, amt, dates, size(dates) AS count
        ORDER BY count DESC
      `, { 
        userId,
        monthsBack: neo4j.int(monthsBack)
      });

      console.log('📊 Groupes avec 2+ occurrences:');
      groups.records.forEach(record => {
        const dates = record.get('dates').map(date => date.toString());
        console.log(`  - ${record.get('desc')} (${record.get('amt')}€) : ${record.get('count')} fois`);
        console.log(`    Dates: ${dates.join(', ')}`);
      });

      // Enfin, calculons les intervalles
      const intervals = await session.run(`
        WITH date() AS today
        MATCH (u:User {id: $userId})-[:MADE]->(e:Expense)
        WHERE e.date >= today - duration({months: $monthsBack})
        WITH e.description AS desc, e.amount AS amt, e.date AS expense_date
        ORDER BY desc, amt, expense_date
        WITH desc, amt, collect(expense_date) AS dates
        WHERE size(dates) >= 2
        WITH desc, amt, dates,
             [i IN range(1, size(dates)-1) | 
               duration.between(dates[i-1], dates[i]).days] AS intervals
        RETURN desc, amt, dates, intervals
      `, { 
        userId,
        monthsBack: neo4j.int(monthsBack)
      });

      console.log('📊 Intervalles calculés:');
      intervals.records.forEach(record => {
        const intervalValues = record.get('intervals').map(int => int.toNumber());
        console.log(`  - ${record.get('desc')} : intervalles = [${intervalValues.join(', ')}] jours`);
        intervalValues.forEach(interval => {
          const isValid = Math.abs(interval - 30) <= 7;
          console.log(`    ${interval} jours -> ${isValid ? '✅' : '❌'} (±7 de 30)`);
        });
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur debug récurrences:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

// Instance singleton
const neo4jService = new Neo4jService();

module.exports = neo4jService;
