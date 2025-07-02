# FricAdele - Application de Gestion de Budget Personnel

Une application web complète et responsive pour la gestion de budget personnel, développée avec React (frontend) et Node.js/Express (backend), utilisant MongoDB pour la persistance des données et Redis pour le cache des statistiques. (V1 - Base en JS)

## � Table des Matières

- [🚀 Fonctionnalités](#-fonctionnalités)
  - [🔐 Authentification](#-authentification)
  - [💸 Gestion des Dépenses](#-gestion-des-dépenses)
  - [📊 Statistiques](#-statistiques)
  - [🎨 UX/UI Améliorée](#-uxui-améliorée)
- [🏗️ Architecture Technique](#️-architecture-technique)
  - [Frontend (React)](#frontend-react)
  - [Backend (Node.js)](#backend-nodejs)
  - [Base de Données](#base-de-données)
- [🛡️ Validation et Feedback Utilisateur](#️-validation-et-feedback-utilisateur)
  - [Validation Zod](#validation-zod-srcutilsvalidationjs)
  - [Notifications Toast](#notifications-toast-react-hot-toast)
  - [Composants avec Validation Intégrée](#composants-avec-validation-intégrée)
- [🛠️ Installation et Configuration](#️-installation-et-configuration)
  - [Prérequis](#prérequis)
  - [Dépendances Principales](#dépendances-principales)
  - [Configuration Backend](#2-configuration-du-backend)
  - [Configuration Frontend](#3-configuration-du-frontend)
- [🚀 Lancement de l'Application](#-lancement-de-lapplication)
  - [Installation des Services](#installation-des-services-requis-windows)
  - [Mode Développement](#mode-développement---méthode-recommandée)
  - [Vérification](#vérification-du-fonctionnement)
- [🛠️ Scripts Disponibles](#️-scripts-disponibles)
- [🔧 Dépannage](#-dépannage)
- [📊 API Endpoints](#-api-endpoints)
- [🔧 Choix Techniques](#-choix-techniques-importants)
- [🎯 Guide de Démarrage Rapide](#-guide-de-démarrage-rapide)
- [📁 Structure du Projet](#-structure-du-projet)
- [🎯 Fonctionnalités Avancées](#-fonctionnalités-avancées)
- [👨‍💻 Auteur](#-auteur)
- [📚 À Propos du Projet](#-à-propos-du-projet)

---

## �🚀 Fonctionnalités

### 🔐 Authentification
- ✅ Création de compte avec validation en temps réel (nom, email, mot de passe sécurisé)
- ✅ Connexion avec validation des champs obligatoires
- ✅ Fonction "mot de passe oublié" avec envoi d'email sécurisé
- ✅ Réinitialisation de mot de passe avec token et validation renforcée
- ✅ Authentification JWT côté client avec feedback utilisateur
- ✅ Protection des routes avec gestion des erreurs
- ✅ Notifications toast pour tous les événements d'authentification

### 💸 Gestion des Dépenses
- ✅ Ajouter une dépense avec validation Zod (montant, description, date, catégorie, tags)
- ✅ Validation en temps réel sur tous les formulaires avec messages d'erreur français
- ✅ Modifier et supprimer ses dépenses avec confirmation et feedback
- ✅ Gérer les catégories personnalisées (nom, couleur, description) avec validation
- ✅ Ajouter et associer des tags avec validation en temps réel
- ✅ Filtrage et recherche des dépenses
- ✅ Notifications toast pour toutes les actions (ajout, modification, suppression)

### 📊 Statistiques
- ✅ Répartition mensuelle des dépenses par catégorie (diagramme camembert)
- ✅ Évolution mensuelle des dépenses (diagramme en barres)
- ✅ Mise en cache avec Redis pour améliorer les performances
- ✅ Comparaison avec les mois précédents
- ✅ Analyse détaillée par période

### 🎨 UX/UI Améliorée
- ✅ Interface optimisée pour mobile et desktop
- ✅ Design moderne avec Tailwind CSS
- ✅ Navigation intuitive avec feedback utilisateur
- ✅ Validation en temps réel (onChange) sur tous les formulaires
- ✅ Messages d'erreur contextuels en français sous chaque champ
- ✅ Notifications toast pour toutes les actions importantes
- ✅ Gestion cohérente des états de chargement et d'erreur

## 🏗️ Architecture Technique

### Frontend (React)
- **Framework**: React 19 avec Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM
- **State Management**: Context API
- **Validation**: Zod avec validation en temps réel
- **Notifications**: React Hot Toast
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

## 🛡️ Validation et Feedback Utilisateur

### Validation Zod (src/utils/validation.js)
- **Schémas centralisés** pour tous les formulaires
- **Validation en temps réel** (onChange) avec messages d'erreur contextuels
- **Messages en français** sous chaque champ de saisie
- **Schémas disponibles** :
  - `loginSchema` : Email et mot de passe (connexion)
  - `registerSchema` : Nom, email, mot de passe sécurisé (inscription)
  - `forgotPasswordSchema` : Email (mot de passe oublié)
  - `resetPasswordSchema` : Nouveau mot de passe avec confirmation
  - `expenseSchema` : Montant, description, date, catégorie, tags
  - `categorySchema` : Nom, couleur hexadécimale, description optionnelle
  - `tagSchema` : Nom du tag avec contraintes de longueur

### Notifications Toast (React Hot Toast)
- **Toasts de succès** : Connexion, inscription, ajout/modification/suppression de dépenses
- **Toasts d'erreur** : Erreurs de validation, erreurs réseau, actions échouées
- **Feedback instantané** : Confirmation visuelle pour toutes les actions utilisateur
- **Messages cohérents** : Terminologie uniforme et messages explicites en français

### Composants avec Validation Intégrée
- `Login.jsx` : Connexion et inscription avec validation Zod + toasts
- `ForgotPassword.jsx` : Demande de réinitialisation avec validation email
- `ResetPassword.jsx` : Nouveau mot de passe avec validation renforcée
- `AddExpense.jsx` / `EditExpense.jsx` : Formulaires de dépenses avec validation complète
- `Settings.jsx` : Gestion des catégories et tags avec validation en temps réel
- `ExpenseList.jsx` / `ExpenseDetail.jsx` : Actions avec confirmations et feedback

## 🛠️ Installation et Configuration

### Prérequis
- Node.js (version 20 ou supérieure)
- MongoDB (local ou MongoDB Atlas)
- Redis (local ou Redis Cloud)
- npm ou yarn

### Dépendances Principales

**Frontend** :
- `react` (19.1.0) - Framework UI
- `react-router-dom` (7.6.3) - Routing
- `axios` (1.10.0) - Client HTTP
- `zod` (3.25.67) - 🆕 Validation de schémas
- `react-hot-toast` (2.5.2) - 🆕 Notifications toast
- `recharts` (3.0.2) - Graphiques et charts
- `lucide-react` (0.525.0) - Icônes
- `tailwindcss` (4.1.11) - Framework CSS
- `@headlessui/react` (2.2.4) - Composants accessibles

**Backend** :
- `express` - Framework serveur
- `mongoose` - ODM MongoDB
- `jsonwebtoken` - Authentification JWT
- `bcryptjs` - Hachage mot de passe
- `nodemailer` - Envoi d'emails
- `redis` - Cache en mémoire
- `express-validator` - Validation serveur
- `helmet` - Sécurité HTTP
- `cors` - Configuration CORS

### 1. Cloner le Repository
```bash
git clone https://github.com/clement-krv/FricAdele.git
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
MONGODB_URI=mongodb://localhost:27017/fricadele_dev
JWT_SECRET=fricadele_development_secret_key_2025
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
FROM_NAME=FricAdele

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
VITE_APP_NAME=FricAdele
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

## 🛠️ Scripts Disponibles

### Frontend (racine du projet)
- `npm run dev` - Lancement du serveur de développement Vite
- `npm run build` - Build du projet
- `npm run preview` - Aperçu du build
- `npm run dev:all` - Lance backend + frontend simultanément

### Backend
- `npm run dev` - Serveur de développement avec nodemon
- `npm start` - Démarrer le serveur
- `npm run dev:backend` - Alias pour npm run dev

## 🔧 Dépannage

### Problèmes Courants

**Erreur de connexion à l'API** :
- Vérifiez que le backend est sur le port 3001
- Vérifiez le fichier `.env` : `VITE_API_URL=http://localhost:3001/api`

**Erreur MongoDB** :
- Vérifiez que MongoDB est démarré : `net start MongoDB`
- Vérifiez la connexion : `MONGODB_URI=mongodb://localhost:27017/fricadele_dev`

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
git clone https://github.com/clement-krv/FricAdele.git
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
MONGODB_URI=mongodb://localhost:27017/fricadele_dev
JWT_SECRET=fricadele_development_secret_key_2025
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

## 📁 Structure du Projet

```
FricAdele/
├── backend/                    # API Node.js/Express
│   ├── controllers/           # Logique métier
│   │   ├── authController.js  # Authentification (login, register, reset)
│   │   ├── expenseController.js # CRUD dépenses
│   │   ├── categoryController.js # CRUD catégories
│   │   ├── tagController.js   # CRUD tags
│   │   └── statisticsController.js # Calculs statistiques
│   ├── middleware/            # Middlewares personnalisés
│   │   ├── auth.js           # Vérification JWT
│   │   └── errorHandler.js   # Gestion d'erreurs globale
│   ├── models/               # Modèles Mongoose
│   │   ├── User.js           # Utilisateur avec auth
│   │   ├── Expense.js        # Dépense avec relations
│   │   ├── Category.js       # Catégorie personnalisée
│   │   └── Tag.js            # Tag pour classification
│   ├── routes/               # Routes API REST
│   └── utils/                # Utilitaires (Redis, email)
├── src/                      # Frontend React
│   ├── components/           # Composants React
│   │   ├── auth/             # Authentification
│   │   │   ├── Login.jsx     # Connexion + inscription (validation Zod)
│   │   │   ├── ForgotPassword.jsx # Mot de passe oublié
│   │   │   └── ResetPassword.jsx  # Réinitialisation
│   │   ├── layout/           # Layout et navigation
│   │   │   └── Navbar.jsx    # Barre de navigation
│   │   ├── AddExpense.jsx    # Ajout dépense (validation Zod + toasts)
│   │   ├── EditExpense.jsx   # Modification dépense
│   │   ├── ExpenseDetail.jsx # Détail dépense + suppression
│   │   ├── ExpenseList.jsx   # Liste + recherche + filtres
│   │   ├── Dashboard.jsx     # Tableau de bord principal
│   │   ├── Settings.jsx      # Gestion catégories/tags (validation Zod)
│   │   └── Statistics.jsx    # Graphiques et analyses
│   ├── contexts/             # Contextes React
│   │   └── AuthContext.jsx   # État auth global + toasts
│   ├── services/             # Services API
│   │   └── api.js            # Client HTTP Axios centralisé
│   ├── utils/                # Utilitaires frontend
│   │   ├── validation.js     # 🆕 Schémas Zod centralisés
│   │   └── helpers.js        # Fonctions utilitaires
│   └── App.jsx               # Composant racine + toaster
└── public/                   # Assets statiques
```

## 🎯 Fonctionnalités Avancées

### Validation en Temps Réel
- **onChange Validation** : Validation instantanée à chaque frappe
- **Messages Contextuels** : Erreurs spécifiques affichées sous chaque champ
- **Validation Visuelle** : Bordures colorées (rouge/vert) selon l'état
- **Désactivation Intelligente** : Boutons désactivés si formulaire invalide

### Système de Notifications
- **Toast de Bienvenue** : Message personnalisé à la connexion
- **Confirmations d'Actions** : Feedback pour chaque CRUD operation
- **Gestion d'Erreurs** : Messages explicites pour chaque type d'erreur
- **Notifications Réseau** : Indicateurs de statut des requêtes API

### Expérience Utilisateur
- **États de Chargement** : Spinners et indicateurs de progression
- **Confirmations de Suppression** : Dialogues de confirmation sécurisés
- **Navigation Intelligente** : Redirections automatiques après actions
- **Persistance d'État** : Conservation des données lors de la navigation

### Sécurité Frontend
- **Validation Côté Client** : Première couche de validation avec Zod
- **Protection des Routes** : Redirections automatiques selon l'authentification
- **Gestion de Sessions** : Logout automatique en cas d'expiration de token
- **Échappement XSS** : Protection contre les injections de scripts

**FricAdele** - Gérez votre budget personnel en toute simplicité ! 💰📊

---

## 👨‍💻 Auteur

<div align="center">

### **Clément Kerviche**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/clément-kerviche-6b7a44262/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/clement-krv)

*Étudiant en développement web à l'ESGI Nantes*

</div>

---

## 📚 À Propos du Projet

Ce projet a été développé dans le cadre d'un exercice pédagogique à l'**ESGI de Nantes** pour les cours de :
- **React.js** - Développement d'interfaces utilisateur modernes
- **Base de données NoSQL** - Gestion des données avec MongoDB

L'objectif était de créer une application complète de gestion de budget personnel en utilisant les technologies web modernes et les meilleures pratiques de développement.