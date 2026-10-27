const mongoose = require('mongoose');

const readingSessionSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'A book reference is required for a reading session'],
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Session date is required'],
    },
    pagesRead: {
      type: Number,
      required: [true, 'Pages read is required'],
      min: [1, 'Pages read must be at least 1'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Session duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Session notes cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'readingsessions', // Explicit collection name for MongoDB Compass inspection
  }
);

const ReadingSession = mongoose.model('ReadingSession', readingSessionSchema);

module.exports = ReadingSession;

