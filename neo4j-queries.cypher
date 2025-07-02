// ========================================
// REQUÊTES CYPHER POUR NEO4J - BUDGET APP
// ========================================

// 1. IMPORT DU FICHIER CSV (SIMPLIFIÉ)
// ====================================
// Exécuter cette requête en premier pour importer les données

LOAD CSV WITH HEADERS FROM 'file:///expenses_multi_users.csv' AS row
CREATE (e:Expense {
  id: randomUUID(),
  amount: toFloat(row.amount),
  description: row.description,
  date: date(row.date),
  userId: row.userId,
  category: row.category,
  createdAt: datetime()
});

// 2. CRÉER DES INDEX POUR AMÉLIORER LES PERFORMANCES
// =================================================

CREATE INDEX expense_user_idx FOR (e:Expense) ON (e.userId);
CREATE INDEX expense_date_idx FOR (e:Expense) ON (e.date);
CREATE INDEX expense_category_idx FOR (e:Expense) ON (e.category);

// 3. CRÉER DES NŒUDS UTILISATEUR ET CATÉGORIE SÉPARÉS
// ===================================================

// Créer les nœuds User
MATCH (e:Expense)
WITH DISTINCT e.userId as userId
CREATE (u:User {id: userId, name: 'User ' + userId});

// Créer les nœuds Category
MATCH (e:Expense)
WITH DISTINCT e.category as categoryName
CREATE (c:Category {name: categoryName});

// Créer les relations
MATCH (e:Expense), (u:User), (c:Category)
WHERE e.userId = u.id AND e.category = c.name
CREATE (u)-[:MADE_EXPENSE]->(e)-[:BELONGS_TO]->(c);

// 4. REQUÊTES D'ANALYSE
// =====================

// 4.1 Dépenses totales par utilisateur
MATCH (u:User)-[:MADE_EXPENSE]->(e:Expense)
RETURN u.id as userId, 
       COUNT(e) as totalExpenses, 
       SUM(e.amount) as totalAmount,
       AVG(e.amount) as avgAmount
ORDER BY totalAmount DESC;

// 4.2 Top 5 des catégories par montant total
MATCH (e:Expense)-[:BELONGS_TO]->(c:Category)
RETURN c.name as category, 
       COUNT(e) as expenseCount, 
       SUM(e.amount) as totalAmount
ORDER BY totalAmount DESC
LIMIT 5;

// 4.3 Dépenses par mois
MATCH (e:Expense)
RETURN e.date.year as year, 
       e.date.month as month, 
       COUNT(e) as expenseCount, 
       SUM(e.amount) as totalAmount
ORDER BY year, month;

// 5. DÉTECTION DES DÉPENSES RÉCURRENTES
// =====================================

// 5.1 Dépenses récurrentes basées sur la description et l'intervalle (~30 jours)
MATCH (e1:Expense), (e2:Expense)
WHERE e1.userId = e2.userId 
  AND e1.description = e2.description 
  AND e1.id <> e2.id
  AND duration.between(e1.date, e2.date).days BETWEEN 25 AND 35
WITH e1.userId as userId, 
     e1.description as description, 
     e1.category as category,
     COUNT(*) as occurrences,
     AVG(e1.amount) as avgAmount,
     COLLECT(DISTINCT e1.date) as dates
WHERE occurrences >= 1
RETURN userId, description, category, occurrences + 1 as totalOccurrences, 
       avgAmount, dates
ORDER BY totalOccurrences DESC, avgAmount DESC;

// 5.2 Dépenses récurrentes par catégorie et utilisateur (intervalle flexible)
MATCH (u:User)-[:MADE_EXPENSE]->(e:Expense)-[:BELONGS_TO]->(c:Category)
WITH u, c, COLLECT(e) as expenses
WHERE SIZE(expenses) >= 2
UNWIND expenses as e1
UNWIND expenses as e2
WITH u, c, e1, e2, expenses
WHERE e1.id <> e2.id 
  AND duration.between(e1.date, e2.date).days BETWEEN 20 AND 40
WITH u.id as userId, 
     c.name as category, 
     COUNT(DISTINCT e1) as recurringCount,
     AVG(e1.amount) as avgAmount,
     SIZE(expenses) as totalExpenses
WHERE recurringCount >= 2
RETURN userId, category, recurringCount, totalExpenses, avgAmount,
       (toFloat(recurringCount) / totalExpenses * 100) as recurringPercentage
ORDER BY recurringPercentage DESC, avgAmount DESC;

// 5.3 Dépenses récurrentes mensuelles (même description chaque mois)
MATCH (e:Expense)
WITH e.userId as userId, 
     e.description as description,
     e.category as category,
     e.date.year as year,
     e.date.month as month,
     AVG(e.amount) as monthlyAvg,
     COUNT(e) as monthlyCount
WITH userId, description, category, 
     COUNT(DISTINCT month) as monthsWithExpense,
     AVG(monthlyAvg) as avgAmount,
     SUM(monthlyCount) as totalCount
WHERE monthsWithExpense >= 2
RETURN userId, description, category, monthsWithExpense, 
       totalCount, avgAmount
ORDER BY monthsWithExpense DESC, avgAmount DESC;

// 6. REQUÊTES POUR L'API
// ======================

// 6.1 Obtenir les dépenses récurrentes d'un utilisateur spécifique
// (À adapter avec un paramètre $userId dans l'application)
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
     COLLECT({date: e1.date, amount: e1.amount, id: e1.id}) as expenses
WHERE occurrences >= 1
RETURN description, category, occurrences + 1 as totalOccurrences, 
       avgAmount, firstDate, lastDate, expenses
ORDER BY totalOccurrences DESC, avgAmount DESC;

// 7. NETTOYAGE (utiliser avec précaution)
// =======================================

// Supprimer toutes les données
// MATCH (n) DETACH DELETE n;

// Supprimer seulement les dépenses
// MATCH (e:Expense) DETACH DELETE e;
