const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId in req.params
 * @param {string} paramName - Name of parameter to validate, defaults to 'id'
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: `The provided identifier '${id}' is not a valid MongoDB ObjectId format.`,
      });
    }
    next();
  };
};

module.exports = {
  validateObjectId,
};

