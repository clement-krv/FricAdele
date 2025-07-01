const express = require('express');
const { body } = require('express-validator');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByDateRange
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const expenseValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Le montant doit être un nombre positif'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('La description doit contenir entre 1 et 200 caractères'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date invalide'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('ID de catégorie invalide'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),
  body('tags.*')
    .optional()
    .isMongoId()
    .withMessage('ID de tag invalide')
];

// Routes
router.route('/')
  .get(getExpenses)
  .post(expenseValidation, createExpense);

router.route('/date-range')
  .get(getExpensesByDateRange);

router.route('/:id')
  .get(getExpense)
  .put(expenseValidation, updateExpense)
  .delete(deleteExpense);

module.exports = router;
