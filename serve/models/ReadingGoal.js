const mongoose = require('mongoose');

const readingGoalSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, 'Goal target year is required'],
      default: () => new Date().getFullYear(),
    },
    targetBooks: {
      type: Number,
      required: [true, 'Annual completed-book target is required'],
      min: [1, 'Target books must be at least 1'],
      default: 12,
    },
    monthlyPageTarget: {
      type: Number,
      required: [true, 'Monthly pages target is required'],
      min: [1, 'Monthly pages target must be at least 1'],
      default: 300,
    },
    weeklyDurationTarget: {
      type: Number,
      min: [0, 'Weekly duration target cannot be negative'],
      default: 120, // 2 hours a week in minutes
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'readinggoals', // Explicit collection name for MongoDB Compass inspection
  }
);

const ReadingGoal = mongoose.model('ReadingGoal', readingGoalSchema);

module.exports = ReadingGoal;

