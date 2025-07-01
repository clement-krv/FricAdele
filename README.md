# Budget Manager - Application de Gestion de Budget Personnel

Une application web complète et responsive pour la gestion de budget personnel, développée avec React (frontend) et Node.js/Express (backend), utilisant MongoDB pour la persistance des données et Redis pour le cache des statistiques.

## 🚀 Fonctionnalités

### 🔐 Authentification
- ✅ Création de compte (email, mot de passe)
- ✅ Connexion avec vérification des identifiants
- ✅ Fonction "mot de passe oublié" avec envoi d'email
- ✅ Authentification JWT côté client
- ✅ Protection des routes

### 💸 Gestion des Dépenses
- ✅ Ajouter une dépense (montant, description, date, catégorie, tags)
- ✅ Gérer les catégories personnalisées (ajouter, modifier, supprimer)
- ✅ Ajouter et associer des tags à chaque dépense
- ✅ Modifier et supprimer ses dépenses
- ✅ Filtrage et recherche des dépenses

### 📊 Statistiques
- ✅ Répartition mensuelle des dépenses par catégorie (diagramme camembert)
- ✅ Évolution mensuelle des dépenses (diagramme en barres)
- ✅ Mise en cache avec Redis pour améliorer les performances
- ✅ Comparaison avec les mois précédents
- ✅ Analyse détaillée par période

### 📱 Design Responsive
- ✅ Interface optimisée pour mobile et desktop
- ✅ Design moderne avec Tailwind CSS
- ✅ Navigation intuitive
- ✅ Expérience utilisateur fluide

## 🏗️ Architecture Technique

### Frontend (React)
- **Framework**: React 19 avec Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM
- **State Management**: Context API
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: MongoDB avec Mongoose
- **Cache**: Redis
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Email**: Nodemailer

### Base de Données
- **Principale**: MongoDB
  - Collections: Users, Expenses, Categories, Tags
  - Index optimisés pour les requêtes
- **Cache**: Redis
  - Cache des statistiques calculées
  - TTL configurable par type de données

## 🛠️ Installation et Configuration

### Prérequis
- Node.js (version 20 ou supérieure)
- MongoDB (local ou MongoDB Atlas)
- Redis (local ou Redis Cloud)
- npm ou yarn

### 1. Cloner le Repository
```bash
git clone <your-repo-url>
cd FricAdele
```

### 2. Configuration du Backend

```bash
cd backend
npm install
```

Créer le fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

Configurer les variables d'environnement dans `.env` :
```env
# Database
MONGODB_URI=mongodb://localhost:27017/budget_manager
JWT_SECRET=budget_manager_super_secret_jwt_key_2025_development
JWT_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=development

# Email (pour la récupération de mot de passe)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@budgetmanager.com
FROM_NAME=Budget Manager

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOWMS=900000
RATE_LIMIT_MAX=100
```

### 3. Configuration du Frontend

```bash
cd ../
npm install
```

Créer le fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

Configurer les variables d'environnement dans `.env` :
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Budget Manager
VITE_APP_VERSION=1.0.0
```

## 🚀 Lancement de l'Application

### Installation des Services Requis (Windows)

**MongoDB** :
1. Téléchargez MongoDB Community Server depuis https://www.mongodb.com/try/download/community
2. Installez-le avec les paramètres par défaut
3. Démarrez le service MongoDB :
   ```powershell
   net start MongoDB
   ```

**Redis** :
1. Téléchargez Redis pour Windows depuis https://github.com/microsoftarchive/redis/releases
2. Installez-le et démarrez le service :
   ```powershell
   redis-server
   ```

### Mode Développement - Méthode Recommandée

**Option 1 : Lancement simultané (recommandé)**
```bash
npm run dev:all
```
Cette commande lance automatiquement le backend (port 3001) et le frontend (port 5173) en parallèle.

**Option 2 : Lancement séparé**

1. **Démarrer le Backend** :
```bash
cd backend
npm run dev
```
Le backend sera accessible sur http://localhost:3001

2. **Démarrer le Frontend** (dans un autre terminal) :
```bash
npm run dev
```
Le frontend sera accessible sur http://localhost:5173

### Vérification du Fonctionnement

1. **API Health Check** : http://localhost:3001/health
2. **Application** : http://localhost:5173

Si vous voyez des erreurs de connexion, vérifiez que :
- MongoDB est démarré (`net start MongoDB`)
- Redis est démarré (`redis-server`)
- Les ports 3001 et 5173 ne sont pas utilisés par d'autres applications

### Mode Production

1. **Build du Frontend** :
```bash
npm run build
```

2. **Démarrer le Backend** :
```bash
cd backend
NODE_ENV=production PORT=3001 npm start
```

## 🛠️ Scripts Disponibles

### Frontend (racine du projet)
- `npm run dev` - Lancement du serveur de développement Vite
- `npm run build` - Build de production
- `npm run preview` - Aperçu du build de production
- `npm run dev:all` - Lance backend + frontend simultanément

### Backend
- `npm run dev` - Serveur de développement avec nodemon
- `npm start` - Serveur de production
- `npm run dev:backend` - Alias pour npm run dev

## 🔧 Dépannage

### Problèmes Courants

**Erreur de connexion à l'API** :
- Vérifiez que le backend est sur le port 3001
- Vérifiez le fichier `.env` : `VITE_API_URL=http://localhost:3001/api`

**Erreur MongoDB** :
- Vérifiez que MongoDB est démarré : `net start MongoDB`
- Vérifiez la connexion : `MONGODB_URI=mongodb://localhost:27017/budget_manager`

**Erreur Redis** :
- Démarrez Redis : `redis-server`
- Vérifiez la connexion : `REDIS_URL=redis://localhost:6379`

**Port déjà utilisé** :
- Backend (3001) : Changez `PORT=3001` dans backend/.env
- Frontend (5173) : Vite choisira automatiquement un autre port

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `PUT /api/auth/reset-password` - Réinitialiser mot de passe

### Expenses
- `GET /api/expenses` - Liste des dépenses
- `POST /api/expenses` - Créer une dépense
- `GET /api/expenses/:id` - Détail d'une dépense
- `PUT /api/expenses/:id` - Modifier une dépense
- `DELETE /api/expenses/:id` - Supprimer une dépense

### Categories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie
- `PUT /api/categories/:id` - Modifier une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

### Tags
- `GET /api/tags` - Liste des tags
- `POST /api/tags` - Créer un tag
- `PUT /api/tags/:id` - Modifier un tag
- `DELETE /api/tags/:id` - Supprimer un tag

### Statistics
- `GET /api/statistics/monthly` - Statistiques mensuelles
- `GET /api/statistics/yearly` - Statistiques annuelles
- `GET /api/statistics/categories` - Répartition par catégories
- `GET /api/statistics/trends` - Tendances de dépenses

**Base URL** : http://localhost:3001 (en développement)

## 🔧 Choix Techniques Importants

### Architecture
- **Séparation Frontend/Backend** : Architecture découplée pour une meilleure scalabilité
- **API RESTful** : Interface standardisée et documentée
- **Authentication JWT** : Système d'authentification stateless et sécurisé

### Performance
- **Cache Redis** : Mise en cache des statistiques calculées pour réduire la charge sur MongoDB
- **Index MongoDB** : Index optimisés sur les champs de requête fréquents
- **Pagination** : Limitation des résultats pour les listes importantes

### Sécurité
- **Hashing Bcrypt** : Chiffrement sécurisé des mots de passe
- **Rate Limiting** : Protection contre les attaques par déni de service
- **Validation** : Validation côté serveur avec Express Validator
- **CORS & Helmet** : Protection contre les attaques web courantes

### UX/UI
- **Mobile First** : Design responsive optimisé pour mobile
- **Loading States** : Indicateurs de chargement pour une meilleure UX
- **Error Handling** : Gestion d'erreurs explicite avec messages utilisateur

## 🎯 Guide de Démarrage Rapide

### 1. Première Installation
```bash
# Cloner le projet
git clone <your-repo-url>
cd FricAdele

# Installer les dépendances
npm install
cd backend
npm install
cd ..

# Copier les fichiers de configuration
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2. Configuration Minimale
Éditez le fichier `.env` à la racine :
```env
VITE_API_URL=http://localhost:3001/api
```

Éditez le fichier `backend/.env` :
```env
MONGODB_URI=mongodb://localhost:27017/budget_manager
JWT_SECRET=budget_manager_super_secret_jwt_key_2025_development
REDIS_URL=redis://localhost:6379
PORT=3001
```

### 3. Lancement
```bash
# Démarrer MongoDB et Redis (services Windows)
net start MongoDB
redis-server

# Lancer l'application complète
npm run dev:all
```

### 4. Première Utilisation
1. Ouvrez http://localhost:5173
2. Créez votre compte
3. Ajoutez votre première dépense
4. Explorez les statistiques

C'est tout ! Votre application de gestion de budget est prête ! 🎉

**Budget Manager** - Gérez votre budget personnel en toute simplicité ! 💰📊
