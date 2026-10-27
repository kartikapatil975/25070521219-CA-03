const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateBookProgress,
  markBookCompleted,
} = require('../controllers/bookController');
const { validateObjectId } = require('../middleware/validateId');
const { requireDatabase } = require('../middleware/dbCheck');

// All book routes require database connection
router.use(requireDatabase);

router.route('/')
  .get(getBooks)
  .post(createBook);

router.route('/:id')
  .get(validateObjectId('id'), getBookById)
  .put(validateObjectId('id'), updateBook)
  .delete(validateObjectId('id'), deleteBook);

router.patch('/:id/progress', validateObjectId('id'), updateBookProgress);
router.patch('/:id/complete', validateObjectId('id'), markBookCompleted);

module.exports = router;

