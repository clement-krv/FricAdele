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
const neo4j = require('neo4j-driver');
require('dotenv').config();

// Fonction pour nettoyer Neo4j
const clearNeo4j = async () => {
  let driver = null;
  try {
    console.log('🔄 Connexion à Neo4j...');
    
    // Connexion à Neo4j avec les mêmes paramètres que le service
    driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', 'passw0rd')
    );
    
    const session = driver.session();
    
    // Compter les nœuds avant suppression
    const countResult = await session.run('MATCH (n) RETURN count(n) as count');
    const nodeCount = countResult.records[0].get('count').toNumber();
    
    console.log(`📊 Nœuds Neo4j trouvés: ${nodeCount}`);
    
    if (nodeCount === 0) {
      console.log('ℹ️  Base Neo4j déjà vide.');
      await session.close();
      return;
    }
    
    console.log('🗑️  Suppression de tous les nœuds et relations Neo4j...');
    
    // Supprimer toutes les relations d'abord
    await session.run('MATCH ()-[r]-() DELETE r');
    console.log('✅ Relations Neo4j supprimées');
    
    // Puis supprimer tous les nœuds
    const deleteResult = await session.run('MATCH (n) DELETE n');
    console.log('✅ Nœuds Neo4j supprimés');
    
    // Vérifier que tout est supprimé
    const finalCountResult = await session.run('MATCH (n) RETURN count(n) as count');
    const finalCount = finalCountResult.records[0].get('count').toNumber();
    
    console.log(`✅ Neo4j nettoyé avec succès! Nœuds restants: ${finalCount}`);
    
    await session.close();
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage Neo4j:', error.message);
    console.log('⚠️  Continuons avec le nettoyage MongoDB...');
  } finally {
    if (driver) {
      await driver.close();
    }
  }
};

const clearAllUsers = async () => {
  try {
    // D'abord nettoyer Neo4j
    await clearNeo4j();
    
    console.log('🔄 Connexion à MongoDB...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fricadele_dev');
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

    console.log('\n🎉 Bases de données vidées avec succès !');
    console.log('📝 MongoDB et Neo4j ont été nettoyés.');
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
    // Nettoyer Neo4j même en mode "users only"
    await clearNeo4j();
    
    console.log('🔄 Connexion à MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fricadele_dev');
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

    console.log('⚠️  Note: Les dépenses, catégories et tags orphelins restent dans MongoDB.');
    console.log('⚠️  Mais Neo4j a été complètement nettoyé.');
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
