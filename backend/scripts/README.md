# Scripts d'Administration - FricAdele

Ce répertoire contient les scripts utilitaires pour l'administration de la base de données MongoDB.

## 🗑️ Suppression des Utilisateurs

### Option 1: Script Node.js Direct

```bash
# Supprimer tous les utilisateurs ET leurs données associées (recommandé)
node scripts/clearUsers.js

# Supprimer uniquement les utilisateurs (garde les dépenses orphelines)
node scripts/clearUsers.js --users-only
```

### Option 2: Script PowerShell (Windows)

```powershell
# Supprimer tous les utilisateurs ET leurs données associées
.\clearUsers.ps1

# Supprimer uniquement les utilisateurs
.\clearUsers.ps1 -UsersOnly
```

### Option 3: API REST

Avec le serveur démarré, vous pouvez utiliser les endpoints suivants :

```bash
# Statistiques de la base de données
curl http://localhost:3001/api/admin/stats

# Supprimer tous les utilisateurs ET leurs données
curl -X DELETE http://localhost:3001/api/admin/users/clear-all

# Supprimer uniquement les utilisateurs
curl -X DELETE http://localhost:3001/api/admin/users/clear-users-only
```

## ⚠️ Précautions Importantes

1. **Sauvegarde** : Toujours effectuer une sauvegarde avant la suppression
2. **Environnement** : Vérifiez que vous êtes sur la bonne base de données
3. **Irréversible** : Ces opérations ne peuvent pas être annulées
4. **Production** : Désactivez ces routes en production !

## 📊 Ce qui est Supprimé

### Mode Complet (`clearUsers.js` sans option)
- ✅ Tous les utilisateurs
- ✅ Toutes les dépenses
- ✅ Toutes les catégories
- ✅ Tous les tags
- ✅ Base de données complètement vierge

### Mode Utilisateurs Seulement (`--users-only`)
- ✅ Tous les utilisateurs
- ❌ Les dépenses restent (orphelines)
- ❌ Les catégories restent (orphelines)
- ❌ Les tags restent (orphelins)

## 🔧 Configuration

Les scripts utilisent les variables d'environnement du fichier `.env` :

```env
MONGODB_URI=mongodb://localhost:27017/budget_manager
```

## 💡 Usage Recommandé

Pour repartir avec une base complètement vierge :

1. Arrêter le serveur backend
2. Exécuter : `node scripts/clearUsers.js`
3. Optionnel : Vider aussi les données ChromaDB et Neo4j
4. Redémarrer le serveur
5. Créer un nouvel utilisateur via l'interface

## 🐛 Dépannage

### "Impossible de se connecter à MongoDB"
- Vérifiez que MongoDB est démarré : `net start MongoDB`
- Vérifiez l'URL dans `.env` : `MONGODB_URI`

### "Permission denied"
- Sur Windows, exécutez PowerShell en tant qu'administrateur
- Ou utilisez : `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### "Script introuvable"
- Assurez-vous d'être dans le répertoire `backend/`
- Vérifiez que le fichier `scripts/clearUsers.js` existe
