const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Le nom doit contenir entre 1 et 50 caractères'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Couleur invalide (format hex requis)'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La description ne peut pas dépasser 200 caractères')
];

// Routes
router.route('/')
  .get(getCategories)
  .post(categoryValidation, createCategory);

router.route('/:id')
  .get(getCategory)
  .put(categoryValidation, updateCategory)
  .delete(deleteCategory);

module.exports = router;
