const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [150, 'Author name cannot exceed 150 characters'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      maxlength: [50, 'Genre cannot exceed 50 characters'],
    },
    totalPages: {
      type: Number,
      required: [true, 'Total pages are required'],
      min: [1, 'Total pages must be at least 1'],
    },
    currentPage: {
      type: Number,
      default: 0,
      min: [0, 'Current page cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['Want to Read', 'Currently Reading', 'Completed'],
        message: '{VALUE} is not a valid reading status',
      },
      default: 'Want to Read',
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'books', // Explicit collection name for MongoDB Compass inspection
  }
);

// Virtual field for progress percentage
bookSchema.virtual('progressPercentage').get(function () {
  if (!this.totalPages || this.totalPages <= 0) return 0;
  return Math.min(100, Math.round((this.currentPage / this.totalPages) * 100));
});

// Custom validation to guarantee currentPage does not exceed totalPages
bookSchema.pre('validate', function (next) {
  if (this.currentPage > this.totalPages) {
    this.invalidate('currentPage', 'Current page cannot exceed total pages');
  }
  next();
});

// Synchronize status and dates before saving
bookSchema.pre('save', function (next) {
  if (this.currentPage >= this.totalPages && this.totalPages > 0) {
    this.status = 'Completed';
    this.currentPage = this.totalPages;
    if (!this.completionDate) {
      this.completionDate = new Date();
    }
  } else if (this.currentPage > 0 && this.status === 'Want to Read') {
    this.status = 'Currently Reading';
    if (!this.startDate) {
      this.startDate = new Date();
    }
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

