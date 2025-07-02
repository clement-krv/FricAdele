# Guide Neo4j - Application Budget

## 1. Démarrage de Neo4j

Sur Windows, exécutez :
```powershell
powershell -ExecutionPolicy Bypass -File "start-neo4j.ps1"
```

Neo4j sera accessible à : http://localhost:7474
- **Login** : neo4j
- **Password** : passw0rd

## 2. Import des données

1. Connectez-vous à l'interface Neo4j Browser
2. Copiez-collez la requête d'import depuis `neo4j-queries.cypher` (section 1)
3. Exécutez la requête pour importer le CSV

## 3. Structure des données

Après l'import, vous aurez :
- **Nœuds Expense** : Chaque dépense individuelle
- **Nœuds User** : Les utilisateurs
- **Nœuds Category** : Les catégories de dépenses
- **Relations** : User -[MADE_EXPENSE]-> Expense -[BELONGS_TO]-> Category

## 4. Requêtes d'analyse disponibles

### Analyses de base
- Dépenses totales par utilisateur
- Top catégories par montant
- Dépenses par mois

### Détection des dépenses récurrentes
- **Récurrence par description** : Dépenses avec même description à ~30 jours d'intervalle
- **Récurrence par catégorie** : Analyse des patterns de dépenses par catégorie
- **Récurrence mensuelle** : Dépenses qui reviennent chaque mois

## 5. Prochaines étapes

1. **Intégration API** : Ajouter un client Neo4j au backend Node.js
2. **Route API** : Créer une route `/api/expenses/recurring` 
3. **Interface** : Afficher les dépenses récurrentes dans le frontend

## 6. Commandes Docker utiles

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
