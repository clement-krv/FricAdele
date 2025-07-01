const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { getFromCache, setInCache } = require('../utils/redis');

// @desc    Get monthly statistics
// @route   GET /api/statistics/monthly
// @access  Private
const getMonthlyStats = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    
    console.log(`📊 Requête statistiques mensuelles: ${year}-${month} pour utilisateur ${req.user.id}`);
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Année et mois requis'
      });
    }

    const cacheKey = `monthly_stats:${req.user.id}:${year}:${month}`;
    
    // DÉSACTIVER temporairement le cache pour le debug
    // let cachedData = await getFromCache(cacheKey);
    // if (cachedData) {
    //   return res.status(200).json({
    //     success: true,
    //     data: cachedData,
    //     cached: true
    //   });
    // }

    // Build date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    console.log(`📅 Recherche dépenses entre ${startDate} et ${endDate}`);

    // Get expenses for the month
    const expenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('category', 'name color');
    
    console.log(`💰 Trouvé ${expenses.length} dépenses`);
    console.log('📋 Dépenses:', expenses.map(e => ({ description: e.description, amount: e.amount, date: e.date })));

    // Calculate statistics
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.length;
    const averagePerDay = totalAmount / endDate.getDate();

    console.log(`💵 Total: ${totalAmount}, Nombre: ${totalCount}, Moyenne/jour: ${averagePerDay}`);

    // Get previous month for comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
    const prevEndDate = new Date(prevYear, prevMonth, 0);

    const prevExpenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: prevStartDate,
        $lte: prevEndDate
      }
    });

    const prevTotalAmount = prevExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const comparisonWithLastMonth = prevTotalAmount === 0 ? 0 : 
      ((totalAmount - prevTotalAmount) / prevTotalAmount) * 100;

    // Group by category
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Sans catégorie';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          total: 0,
          count: 0,
          color: expense.category?.color || '#6B7280'
        };
      }
      acc[categoryName].total += expense.amount;
      acc[categoryName].count += 1;
      return acc;
    }, {});

    const result = {
      totalAmount,
      totalCount,
      averagePerDay,
      comparisonWithLastMonth,
      categoryBreakdown: Object.values(categoryBreakdown),
      month: parseInt(month),
      year: parseInt(year)
    };

    // Cache the result for 1 hour
    await setInCache(cacheKey, result, 3600);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get yearly statistics
// @route   GET /api/statistics/yearly
// @access  Private
const getYearlyStats = async (req, res, next) => {
  try {
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Année requise'
      });
    }

    const cacheKey = `yearly_stats:${req.user.id}:${year}`;
    
    // Try to get from cache first
    let cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Build date range for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Get expenses for the year
    const expenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('category', 'name color');

    // Calculate monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      monthName: new Date(year, index).toLocaleDateString('fr-FR', { month: 'long' }),
      total: 0,
      count: 0
    }));

    expenses.forEach(expense => {
      const month = expense.date.getMonth();
      monthlyBreakdown[month].total += expense.amount;
      monthlyBreakdown[month].count += 1;
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.length;
    const averagePerMonth = totalAmount / 12;

    const result = {
      totalAmount,
      totalCount,
      averagePerMonth,
      monthlyBreakdown,
      year: parseInt(year)
    };

    // Cache the result for 2 hours
    await setInCache(cacheKey, result, 7200);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category distribution
// @route   GET /api/statistics/categories
// @access  Private
const getCategoryDistribution = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Dates de début et de fin requises'
      });
    }

    const cacheKey = `category_distribution:${req.user.id}:${startDate}:${endDate}`;
    
    // Try to get from cache first
    let cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Aggregate expenses by category
    const pipeline = [
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          category: {
            $first: {
              $ifNull: [
                { $arrayElemAt: ['$categoryInfo.name', 0] },
                'Sans catégorie'
              ]
            }
          },
          color: {
            $first: {
              $ifNull: [
                { $arrayElemAt: ['$categoryInfo.color', 0] },
                '#6B7280'
              ]
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ];

    const result = await Expense.aggregate(pipeline);

    // Cache the result for 30 minutes
    await setInCache(cacheKey, result, 1800);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending trends
// @route   GET /api/statistics/trends
// @access  Private
const getSpendingTrends = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    
    const cacheKey = `spending_trends:${req.user.id}:${months}`;
    
    // Try to get from cache first
    let cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    // Aggregate expenses by month
    const pipeline = [
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          total: 1,
          count: 1
        }
      }
    ];

    const result = await Expense.aggregate(pipeline);

    // Cache the result for 1 hour
    await setInCache(cacheKey, result, 3600);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyStats,
  getYearlyStats,
  getCategoryDistribution,
  getSpendingTrends
};
