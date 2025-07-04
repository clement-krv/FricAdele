const express = require('express');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

const router = express.Router();

// @desc    Supprimer tous les utilisateurs et leurs données
// @route   DELETE /api/admin/users/clear-all
// @access  Public (ATTENTION: à sécuriser en production)
const clearAllUsers = async (req, res, next) => {
  try {
    // Compter les éléments avant suppression
    const counts = {
      users: await User.countDocuments(),
      expenses: await Expense.countDocuments(),
      categories: await Category.countDocuments(),
      tags: await Tag.countDocuments()
    };

    if (counts.users === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aucun utilisateur trouvé dans la base de données',
        data: { before: counts, deleted: { users: 0, expenses: 0, categories: 0, tags: 0 } }
      });
    }

    // Supprimer toutes les données
    const deletedExpenses = await Expense.deleteMany({});
    const deletedCategories = await Category.deleteMany({});
    const deletedTags = await Tag.deleteMany({});
    const deletedUsers = await User.deleteMany({});

    const deleted = {
      users: deletedUsers.deletedCount,
      expenses: deletedExpenses.deletedCount,
      categories: deletedCategories.deletedCount,
      tags: deletedTags.deletedCount
    };

    console.log('🗑️ Administration: Base de données vidée');
    console.log('   - Utilisateurs supprimés:', deleted.users);
    console.log('   - Dépenses supprimées:', deleted.expenses);
    console.log('   - Catégories supprimées:', deleted.categories);
    console.log('   - Tags supprimés:', deleted.tags);

    res.status(200).json({
      success: true,
      message: 'Base de données vidée avec succès',
      data: {
        before: counts,
        deleted: deleted,
        summary: `${deleted.users} utilisateurs et ${deleted.expenses + deleted.categories + deleted.tags} éléments associés supprimés`
      }
    });

  } catch (error) {
    console.error('❌ Erreur suppression admin:', error);
    next(error);
  }
};

// @desc    Supprimer uniquement les utilisateurs
// @route   DELETE /api/admin/users/clear-users-only
// @access  Public (ATTENTION: à sécuriser en production)
const clearUsersOnly = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aucun utilisateur trouvé dans la base de données',
        data: { deleted: 0 }
      });
    }

    const deletedUsers = await User.deleteMany({});

    console.log(`🗑️ Administration: ${deletedUsers.deletedCount} utilisateurs supprimés`);

    res.status(200).json({
      success: true,
      message: 'Utilisateurs supprimés avec succès',
      data: {
        deleted: deletedUsers.deletedCount,
        warning: 'Les dépenses, catégories et tags orphelins restent dans la base'
      }
    });

  } catch (error) {
    console.error('❌ Erreur suppression utilisateurs:', error);
    next(error);
  }
};

// @desc    Obtenir les statistiques de la base de données
// @route   GET /api/admin/stats
// @access  Public
const getDatabaseStats = async (req, res, next) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      expenses: await Expense.countDocuments(),
      categories: await Category.countDocuments(),
      tags: await Tag.countDocuments(),
      timestamp: new Date().toISOString()
    };

    // Statistiques additionnelles
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = stats.users - activeUsers;

    res.status(200).json({
      success: true,
      message: 'Statistiques de la base de données',
      data: {
        ...stats,
        breakdown: {
          activeUsers,
          inactiveUsers
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    next(error);
  }
};

// Routes
router.delete('/users/clear-all', clearAllUsers);
router.delete('/users/clear-users-only', clearUsersOnly);
router.get('/stats', getDatabaseStats);

module.exports = router;
