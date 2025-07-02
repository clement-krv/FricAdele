const neo4j = require('neo4j-driver');

class Neo4jService {
    constructor() {
        this.driver = null;
        this.session = null;
    }

    async connect() {
        try {
            this.driver = neo4j.driver(
                'bolt://localhost:7687',
                neo4j.auth.basic('neo4j', 'passw0rd')
            );
            
            // Test de la connexion
            const session = this.driver.session();
            await session.run('RETURN 1');
            session.close();
            
            console.log('✅ Connexion Neo4j établie');
            return true;
        } catch (error) {
            console.error('❌ Erreur connexion Neo4j:', error.message);
            return false;
        }
    }

    getSession() {
        if (!this.driver) {
            throw new Error('Driver Neo4j non initialisé. Appelez connect() d\'abord.');
        }
        return this.driver.session();
    }

    async close() {
        if (this.driver) {
            await this.driver.close();
            console.log('🔌 Connexion Neo4j fermée');
        }
    }

    // Obtenir les dépenses récurrentes d'un utilisateur
    async getRecurringExpenses(userId) {
        const session = this.getSession();
        try {
            const query = `
                MATCH (e1:Expense), (e2:Expense)
                WHERE e1.userId = $userId 
                  AND e2.userId = $userId
                  AND e1.description = e2.description 
                  AND e1.id <> e2.id
                  AND duration.between(e1.date, e2.date).days BETWEEN 25 AND 35
                WITH e1.description as description, 
                     e1.category as category,
                     COUNT(*) as occurrences,
                     AVG(e1.amount) as avgAmount,
                     MIN(e1.date) as firstDate,
                     MAX(e1.date) as lastDate,
                     COLLECT({
                        date: toString(e1.date), 
                        amount: e1.amount, 
                        id: e1.id
                     }) as expenses
                WHERE occurrences >= 1
                RETURN description, category, occurrences + 1 as totalOccurrences, 
                       avgAmount, toString(firstDate) as firstDate, 
                       toString(lastDate) as lastDate, expenses
                ORDER BY totalOccurrences DESC, avgAmount DESC
            `;

            const result = await session.run(query, { userId });
            
            return result.records.map(record => ({
                description: record.get('description'),
                category: record.get('category'),
                totalOccurrences: record.get('totalOccurrences').toNumber(),
                avgAmount: record.get('avgAmount'),
                firstDate: record.get('firstDate'),
                lastDate: record.get('lastDate'),
                expenses: record.get('expenses')
            }));
        } finally {
            session.close();
        }
    }

    // Obtenir les catégories avec dépenses récurrentes
    async getRecurringByCategory(userId) {
        const session = this.getSession();
        try {
            const query = `
                MATCH (u:User)-[:MADE_EXPENSE]->(e:Expense)-[:BELONGS_TO]->(c:Category)
                WHERE u.id = $userId
                WITH u, c, COLLECT(e) as expenses
                WHERE SIZE(expenses) >= 2
                UNWIND expenses as e1
                UNWIND expenses as e2
                WITH u, c, e1, e2, expenses
                WHERE e1.id <> e2.id 
                  AND duration.between(e1.date, e2.date).days BETWEEN 20 AND 40
                WITH c.name as category, 
                     COUNT(DISTINCT e1) as recurringCount,
                     AVG(e1.amount) as avgAmount,
                     SIZE(expenses) as totalExpenses
                WHERE recurringCount >= 2
                RETURN category, recurringCount, totalExpenses, avgAmount,
                       (toFloat(recurringCount) / totalExpenses * 100) as recurringPercentage
                ORDER BY recurringPercentage DESC, avgAmount DESC
            `;

            const result = await session.run(query, { userId });
            
            return result.records.map(record => ({
                category: record.get('category'),
                recurringCount: record.get('recurringCount').toNumber(),
                totalExpenses: record.get('totalExpenses').toNumber(),
                avgAmount: record.get('avgAmount'),
                recurringPercentage: record.get('recurringPercentage')
            }));
        } finally {
            session.close();
        }
    }

    // Obtenir les statistiques générales d'un utilisateur
    async getUserStats(userId) {
        const session = this.getSession();
        try {
            const query = `
                MATCH (u:User)-[:MADE_EXPENSE]->(e:Expense)
                WHERE u.id = $userId
                RETURN COUNT(e) as totalExpenses, 
                       SUM(e.amount) as totalAmount,
                       AVG(e.amount) as avgAmount,
                       MIN(e.date) as firstExpenseDate,
                       MAX(e.date) as lastExpenseDate
            `;

            const result = await session.run(query, { userId });
            
            if (result.records.length === 0) {
                return null;
            }

            const record = result.records[0];
            return {
                totalExpenses: record.get('totalExpenses').toNumber(),
                totalAmount: record.get('totalAmount'),
                avgAmount: record.get('avgAmount'),
                firstExpenseDate: record.get('firstExpenseDate')?.toString(),
                lastExpenseDate: record.get('lastExpenseDate')?.toString()
            };
        } finally {
            session.close();
        }
    }

    // Importer des dépenses depuis un CSV (pour usage administratif)
    async importExpensesFromCSV() {
        const session = this.getSession();
        try {
            const query = `
                LOAD CSV WITH HEADERS FROM 'file:///expenses_multi_users.csv' AS row
                CREATE (e:Expense {
                  id: randomUUID(),
                  amount: toFloat(row.amount),
                  description: row.description,
                  date: date(row.date),
                  userId: row.userId,
                  category: row.category,
                  createdAt: datetime()
                })
                RETURN COUNT(e) as importedCount
            `;

            const result = await session.run(query);
            return result.records[0].get('importedCount').toNumber();
        } finally {
            session.close();
        }
    }
}

module.exports = Neo4jService;
