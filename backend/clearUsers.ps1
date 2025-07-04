# Script PowerShell pour supprimer tous les utilisateurs de la base de données MongoDB
# Usage: .\clearUsers.ps1 [users-only]

param(
    [switch]$UsersOnly
)

Write-Host "🚀 FricAdele - Nettoyage de la base de données" -ForegroundColor Yellow

# Vérifier si nous sommes dans le bon répertoire
if (-not (Test-Path ".\scripts\clearUsers.js")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le répertoire backend/" -ForegroundColor Red
    Write-Host "   Répertoire actuel: $(Get-Location)" -ForegroundColor Gray
    Write-Host "   Répertoire attendu: ...\FricAdele\backend\" -ForegroundColor Gray
    exit 1
}

# Vérifier que Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou non accessible" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier .env existe
if (-not (Test-Path ".\.env")) {
    Write-Host "⚠️  Fichier .env non trouvé - utilisation de la configuration par défaut" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⚠️  ATTENTION: Cette action va supprimer des données de la base MongoDB !" -ForegroundColor Red
Write-Host "⚠️  Cette action est IRRÉVERSIBLE !" -ForegroundColor Red
Write-Host ""

if ($UsersOnly) {
    Write-Host "🎯 Mode: Suppression des utilisateurs uniquement" -ForegroundColor Cyan
    $confirmation = Read-Host "Tapez 'CONFIRMER' pour supprimer TOUS LES UTILISATEURS"
} else {
    Write-Host "🎯 Mode: Suppression complète (utilisateurs + données associées)" -ForegroundColor Cyan
    Write-Host "   - Utilisateurs" -ForegroundColor Gray
    Write-Host "   - Dépenses" -ForegroundColor Gray
    Write-Host "   - Catégories" -ForegroundColor Gray
    Write-Host "   - Tags" -ForegroundColor Gray
    $confirmation = Read-Host "Tapez 'CONFIRMER' pour supprimer TOUTES LES DONNÉES"
}

if ($confirmation -ne "CONFIRMER") {
    Write-Host "❌ Opération annulée" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Exécution du script de nettoyage..." -ForegroundColor Blue

try {
    if ($UsersOnly) {
        node .\scripts\clearUsers.js --users-only
    } else {
        node .\scripts\clearUsers.js
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Nettoyage terminé avec succès !" -ForegroundColor Green
        Write-Host "📝 Vous pouvez maintenant créer de nouveaux utilisateurs" -ForegroundColor Blue
    } else {
        Write-Host ""
        Write-Host "❌ Le script s'est terminé avec des erreurs" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
