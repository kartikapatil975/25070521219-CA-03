const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');
const { validateObjectId } = require('../middleware/validateId');
const { requireDatabase } = require('../middleware/dbCheck');

// All goal routes require database connection
router.use(requireDatabase);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .put(validateObjectId('id'), updateGoal)
  .delete(validateObjectId('id'), deleteGoal);

module.exports = router;

