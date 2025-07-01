const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const { deleteFromCache } = require('../utils/redis');

// Helper function to invalidate all statistics cache for a user
const invalidateStatisticsCache = async (userId) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Invalider les caches des statistiques mensuelles (12 derniers mois)
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentMonth - 1 - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      await deleteFromCache(`monthly_stats:${userId}:${year}:${month}`);
    }
    
    // Invalider les caches des statistiques annuelles
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      await deleteFromCache(`yearly_stats:${userId}:${year}`);
    }
    
    // Invalider les caches de distribution par catégorie (approximation pour les dates courantes)
    const dates = [
      // Mois actuel
      { start: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0], 
        end: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0] },
      // Mois dernier
      { start: new Date(currentYear, currentMonth - 2, 1).toISOString().split('T')[0], 
        end: new Date(currentYear, currentMonth - 1, 0).toISOString().split('T')[0] },
      // 90 derniers jours
      { start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: now.toISOString().split('T')[0] }
    ];
    
    for (const { start, end } of dates) {
      await deleteFromCache(`category_distribution:${userId}:${start}:${end}`);
    }
    
    // Invalider le cache des tendances
    await deleteFromCache(`spending_trends:${userId}:12`);
    
    console.log(`🗑️ Cache des statistiques invalidé pour l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur lors de l\'invalidation du cache:', error);
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-date',
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search
    } = req.query;

    console.log(`💰 Récupération des dépenses pour utilisateur ${req.user.id}, params:`, req.query);

    // Build query
    const query = { user: req.user.id };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by amount range
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Search in description
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    console.log('🔍 Query construite:', query);

    // Execute query with pagination
    const expenses = await Expense.find(query)
      .populate('category', 'name color')
      .populate('tags', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Expense.countDocuments(query);

    console.log(`📊 Résultats: ${expenses.length} dépenses trouvées sur ${total} total`);
    console.log('💳 Dépenses:', expenses.map(e => ({ 
      id: e._id, 
      description: e.description, 
      amount: e.amount, 
      date: e.date,
      user: e.user 
    })));

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('category', 'name color')
      .populate('tags', 'name');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    // Add user to req.body
    req.body.user = req.user.id;

    const expense = await Expense.create(req.body);

    // Populate the created expense
    await expense.populate('category', 'name color');
    await expense.populate('tags', 'name');

    // Invalidate statistics cache
    await invalidateStatisticsCache(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Dépense créée avec succès',
      expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('category', 'name color')
      .populate('tags', 'name');

    // Invalidate statistics cache
    await invalidateStatisticsCache(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Dépense mise à jour avec succès',
      expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }

    await expense.deleteOne();

    // Invalidate statistics cache
    await invalidateStatisticsCache(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Dépense supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expenses by date range
// @route   GET /api/expenses/date-range
// @access  Private
const getExpensesByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises'
      });
    }

    const expenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('category', 'name color')
      .populate('tags', 'name')
      .sort('-date');

    // Calculate total amount
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount,
      expenses
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByDateRange
};
