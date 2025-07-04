#!/usr/bin/env node

/**
 * Script pour supprimer tous les utilisateurs de la base de données MongoDB
 * ATTENTION: Cette action est irréversible !
 * 
 * Usage: node scripts/clearUsers.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
require('dotenv').config();

const clearAllUsers = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/budget_manager');
    console.log('✅ Connecté à MongoDB');

    // Compter le nombre d'utilisateurs avant suppression
    const userCount = await User.countDocuments();
    const expenseCount = await Expense.countDocuments();
    const categoryCount = await Category.countDocuments();
    const tagCount = await Tag.countDocuments();

    console.log(`\n📊 État actuel de la base de données:`);
    console.log(`   - Utilisateurs: ${userCount}`);
    console.log(`   - Dépenses: ${expenseCount}`);
    console.log(`   - Catégories: ${categoryCount}`);
    console.log(`   - Tags: ${tagCount}`);

    if (userCount === 0) {
      console.log('ℹ️  Aucun utilisateur trouvé dans la base de données.');
      return;
    }

    // Demander confirmation (simulée - en production, vous pourriez utiliser readline)
    console.log('\n⚠️  ATTENTION: Cette action va supprimer TOUS les utilisateurs et leurs données associées !');
    console.log('⚠️  Cette action est IRRÉVERSIBLE !');
    
    // En mode automatique pour ce script
    console.log('\n🗑️  Suppression en cours...');

    // Supprimer toutes les dépenses
    const deletedExpenses = await Expense.deleteMany({});
    console.log(`✅ ${deletedExpenses.deletedCount} dépenses supprimées`);

    // Supprimer toutes les catégories
    const deletedCategories = await Category.deleteMany({});
    console.log(`✅ ${deletedCategories.deletedCount} catégories supprimées`);

    // Supprimer tous les tags
    const deletedTags = await Tag.deleteMany({});
    console.log(`✅ ${deletedTags.deletedCount} tags supprimés`);

    // Supprimer tous les utilisateurs
    const deletedUsers = await User.deleteMany({});
    console.log(`✅ ${deletedUsers.deletedCount} utilisateurs supprimés`);

    console.log('\n🎉 Base de données vidée avec succès !');
    console.log('📝 Vous pouvez maintenant créer de nouveaux utilisateurs.');

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
    process.exit(1);
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Fonction pour supprimer uniquement les utilisateurs (garde les données non liées)
const clearUsersOnly = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/budget_manager');
    console.log('✅ Connecté à MongoDB');

    const userCount = await User.countDocuments();
    console.log(`📊 Nombre d'utilisateurs trouvés: ${userCount}`);

    if (userCount === 0) {
      console.log('ℹ️  Aucun utilisateur trouvé dans la base de données.');
      return;
    }

    console.log('🗑️  Suppression des utilisateurs uniquement...');
    const deletedUsers = await User.deleteMany({});
    console.log(`✅ ${deletedUsers.deletedCount} utilisateurs supprimés`);

    console.log('⚠️  Note: Les dépenses, catégories et tags orphelins restent dans la base.');
    console.log('   Utilisez clearAllUsers() pour tout supprimer.');

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);
const usersOnly = args.includes('--users-only');

if (usersOnly) {
  console.log('🎯 Mode: Suppression des utilisateurs uniquement');
  clearUsersOnly();
} else {
  console.log('🎯 Mode: Suppression complète (utilisateurs + données associées)');
  clearAllUsers();
}
