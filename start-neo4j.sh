#!/bin/bash

# Script pour démarrer Neo4j avec Docker
# Assurez-vous d'avoir Docker installé et en cours d'exécution

echo "🚀 Démarrage de Neo4j avec Docker..."

# Arrêter et supprimer le conteneur existant s'il existe
docker stop neo4j-budget 2>/dev/null || true
docker rm neo4j-budget 2>/dev/null || true

# Démarrer Neo4j
docker run --name neo4j-budget \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/passw0rd \
  -v "$(pwd)/neo4j-import:/import" \
  -d \
  neo4j:5

echo "✅ Neo4j démarré!"
echo "📱 Interface web : http://localhost:7474"
echo "🔑 Login : neo4j"
echo "🔑 Password : passw0rd"
echo ""
echo "⏳ Attendre 30 secondes que Neo4j soit complètement démarré..."
echo "📁 Le fichier CSV est disponible dans le conteneur à : file:///expenses_multi_users.csv"
