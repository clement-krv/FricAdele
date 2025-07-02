# Script PowerShell pour démarrer Neo4j avec Docker
# Assurez-vous d'avoir Docker installé et en cours d'exécution

Write-Host "Démarrage de Neo4j avec Docker..." -ForegroundColor Green

# Arrêter et supprimer le conteneur existant s'il existe
try {
    docker stop neo4j-budget | Out-Null
    docker rm neo4j-budget | Out-Null
    Write-Host "Conteneur existant supprimé" -ForegroundColor Yellow
} catch {
    # Ignorer les erreurs si le conteneur n'existe pas
}

# Obtenir le chemin absolu du dossier courant
$currentPath = (Get-Location).Path

# Démarrer Neo4j
docker run --name neo4j-budget `
  -p 7474:7474 `
  -p 7687:7687 `
  -e NEO4J_AUTH=neo4j/passw0rd `
  -v "${currentPath}/neo4j-import:/import" `
  -d `
  neo4j:5

Write-Host "Neo4j démarré!" -ForegroundColor Green
Write-Host "Interface web : http://localhost:7474" -ForegroundColor Cyan
Write-Host "Login : neo4j" -ForegroundColor Yellow
Write-Host "Password : passw0rd" -ForegroundColor Yellow
Write-Host ""
Write-Host "Attendre 30 secondes que Neo4j soit complètement démarré..." -ForegroundColor Magenta
Write-Host "Le fichier CSV est disponible dans le conteneur à : file:///expenses_multi_users.csv" -ForegroundColor Cyan
