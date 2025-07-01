const { validationResult } = require('express-validator');
const Tag = require('../models/Tag');
const Expense = require('../models/Expense');

// @desc    Get all tags for user
// @route   GET /api/tags
// @access  Private
const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({
      user: req.user.id,
      isActive: true
    }).sort('name');

    res.status(200).json({
      success: true,
      count: tags.length,
      tags
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tag
// @route   GET /api/tags/:id
// @access  Private
const getTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag non trouvé'
      });
    }

    // Get expenses count for this tag
    const expensesCount = await Expense.countDocuments({
      tags: tag._id,
      user: req.user.id
    });

    res.status(200).json({
      success: true,
      tag: {
        ...tag.toObject(),
        expensesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private
const createTag = async (req, res, next) => {
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

    // Check if tag name already exists for this user
    const existingTag = await Tag.findOne({
      name: req.body.name,
      user: req.user.id
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Un tag avec ce nom existe déjà'
      });
    }

    // Add user to req.body
    req.body.user = req.user.id;

    const tag = await Tag.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tag créé avec succès',
      tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private
const updateTag = async (req, res, next) => {
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

    let tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag non trouvé'
      });
    }

    // Check if new name already exists (if name is being changed)
    if (req.body.name && req.body.name !== tag.name) {
      const existingTag = await Tag.findOne({
        name: req.body.name,
        user: req.user.id,
        _id: { $ne: req.params.id }
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'Un tag avec ce nom existe déjà'
        });
      }
    }

    tag = await Tag.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Tag mis à jour avec succès',
      tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private
const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag non trouvé'
      });
    }

    // Remove tag from all expenses
    await Expense.updateMany(
      { tags: tag._id, user: req.user.id },
      { $pull: { tags: tag._id } }
    );

    await tag.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tag supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag
};
