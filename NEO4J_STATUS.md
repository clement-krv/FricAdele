# 🚀 Installation Neo4j - Guide Complet

## ✅ État actuel

- **Neo4j** : ✅ Démarré et accessible sur `http://localhost:7474`
- **Backend API** : ✅ Connecté à Neo4j
- **CSV de données** : ✅ Prêt dans `neo4j-import/expenses_multi_users.csv`

## 🔥 Prochaines étapes

### 1. Importer les données CSV dans Neo4j

1. **Ouvrez Neo4j Browser** : http://localhost:7474
   - Login : `neo4j`
   - Password : `passw0rd`

2. **Copiez-collez cette requête d'import** :

```cypher
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
```

3. **Créez les index pour les performances** :

```cypher
CREATE INDEX expense_user_idx FOR (e:Expense) ON (e.userId);
CREATE INDEX expense_date_idx FOR (e:Expense) ON (e.date);
CREATE INDEX expense_category_idx FOR (e:Expense) ON (e.category);
```

### 2. Tester les requêtes de dépenses récurrentes

```cypher
// Dépenses récurrentes basées sur la description (~30 jours d'intervalle)
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
```

## 🔧 Routes API disponibles

- **Health Check Neo4j** : `GET /api/recurring/health`
- **Health Check simple** : `GET /api/recurring/health-simple`

## 📝 Fichiers créés

- `backend/services/neo4jService.js` - Client Neo4j
- `backend/controllers/recurringController.js` - Contrôleur pour les dépenses récurrentes
- `backend/routes/recurring-simple.js` - Routes API
- `neo4j-queries.cypher` - Toutes les requêtes Cypher
- `NEO4J_GUIDE.md` - Guide d'utilisation détaillé

## 🐳 Commandes Docker utiles

```powershell
# Voir les logs Neo4j
docker logs neo4j-budget

# Arrêter Neo4j
docker stop neo4j-budget

# Redémarrer Neo4j
docker restart neo4j-budget

# Supprimer le conteneur
docker rm neo4j-budget
```

## 🎯 Test de la configuration

```powershell
# Test de l'API
curl http://localhost:3001/api/recurring/health

# Doit retourner : {"success":true,"neo4jConnected":true,"timestamp":"..."}
```

## 📊 Prochaines fonctionnalités à implémenter

1. **Routes API complètes** pour récupérer les dépenses récurrentes
2. **Interface frontend** pour afficher les analyses
3. **Intégration avec l'authentification** existante
4. **Tableaux de bord** avec visualisations

Votre setup Neo4j est maintenant **opérationnel** ! 🎉
