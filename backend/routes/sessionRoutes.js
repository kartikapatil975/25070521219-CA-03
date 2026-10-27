const express = require('express');
const router = express.Router();
const {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
} = require('../controllers/sessionController');
const { validateObjectId } = require('../middleware/validateId');
const { requireDatabase } = require('../middleware/dbCheck');

// All session routes require database connection
router.use(requireDatabase);

router.route('/')
  .get(getSessions)
  .post(createSession);

router.route('/:id')
  .get(validateObjectId('id'), getSessionById)
  .put(validateObjectId('id'), updateSession)
  .delete(validateObjectId('id'), deleteSession);

module.exports = router;

