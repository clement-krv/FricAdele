# FricAdele 💰 - Gestionnaire de Budget avec IA

Application web moderne de gestion de budget personnel avec assistant IA intelligent.

## ✨ Fonctionnalités

- 🤖 **Assistant IA** - Conseils personnalisés avec Mistral AI
- 💸 **Gestion dépenses** - Ajout, modification, suppression avec catégories et tags
- 📊 **Statistiques** - Graphiques et analyses de vos habitudes
- 🔐 **Authentification** - Comptes sécurisés avec JWT
- 📱 **Responsive** - Interface adaptée mobile et desktop

## 🚀 Démarrage rapide

### 1. Installation
```bash
git clone https://github.com/clement-krv/FricAdele.git
cd FricAdele
npm run install:all
```

### 2. Configuration
Copiez et configurez les fichiers d'environnement :
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

**Frontend (.env)** :
```env
VITE_API_URL=http://localhost:3001/api
```

**Backend (backend/.env)** :
```env
MONGODB_URI=mongodb://localhost:27017/fricadele_dev
JWT_SECRET=your_jwt_secret_here
MISTRAL_API_KEY=your_mistral_api_key_here
REDIS_URL=redis://localhost:6379
CHROMA_URL=http://localhost:8000
```

### 3. Lancement
```bash
# Démarrer tous les services (MongoDB, Redis, ChromaDB, Neo4j)
docker-compose -f docker-compose.ai.yml up -d

# Lancer l'application (Frontend + Backend)
npm run dev:all
```

### 4. Accès
- **Application** : http://localhost:5173
- **API** : http://localhost:3001
- **Neo4j Browser** : http://localhost:7474 (neo4j/passw0rd)

## 🏗️ Stack technique

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Zod (validation)
- React Hot Toast (notifications)
- Recharts (graphiques)

### Backend
- Node.js + Express
- MongoDB (données)
- Redis (cache)
- ChromaDB (IA vectorielle)
- Neo4j (relations graphiques)
- Mistral AI (LLM)

## 📦 Services Docker

Le fichier `docker-compose.ai.yml` lance :
- **MongoDB** (port 27017) - Base de données principale
- **Redis** (port 6379) - Cache et sessions
- **ChromaDB** (port 8000) - Base vectorielle IA
- **Neo4j** (ports 7474/7687) - Base graphique

## 🛠️ Scripts utiles

```bash
# Développement
npm run dev:all          # Frontend + Backend
npm run dev              # Frontend seulement
npm run dev:backend      # Backend seulement

# Installation
npm run install:all      # Installe tout

# Production
npm run build           # Build frontend
npm start               # Démarre backend prod

# Base de données
cd backend && npm run clear  # Vide MongoDB + Neo4j
```

## 🤖 Assistant IA

L'assistant IA analyse vos vraies données pour :
- Identifier vos dépenses récurrentes
- Suggérer des optimisations budget
- Analyser vos habitudes de consommation
- Donner des conseils personnalisés

**Questions exemples** :
- "Quelles sont mes plus grosses dépenses ?"
- "Comment optimiser mon budget alimentaire ?"
- "Analyse mes habitudes de dépenses"

## 🔧 Dépannage

**Erreur de connexion** :
```bash
# Vérifier que Docker tourne
docker ps

# Redémarrer les services
docker-compose -f docker-compose.ai.yml restart
```

**Erreur IA** :
- Vérifiez votre clé `MISTRAL_API_KEY`
- Assurez-vous que ChromaDB est démarré (port 8000)

**Erreur base de données** :
- MongoDB Docker doit être en cours (port 27017)
- Vérifiez `MONGODB_URI` dans backend/.env

## 👨‍💻 Auteur

**Clément Kerviche** - Étudiant ESGI Nantes

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/clément-kerviche-6b7a44262/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github)](https://github.com/clement-krv)

---

*Application développée dans le cadre des cours React.js et NoSQL à l'ESGI Nantes* 🎓