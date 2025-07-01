const express = require('express');
const { body } = require('express-validator');
const {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag
} = require('../controllers/tagController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const tagValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Le nom doit contenir entre 1 et 30 caractères')
];

// Routes
router.route('/')
  .get(getTags)
  .post(tagValidation, createTag);

router.route('/:id')
  .get(getTag)
  .put(tagValidation, updateTag)
  .delete(deleteTag);

module.exports = router;
