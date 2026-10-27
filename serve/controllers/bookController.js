const Book = require('../models/Book');
const ReadingSession = require('../models/ReadingSession');

/**
 * @desc    Get all books with optional search, filtering, and sorting
 * @route   GET /api/books
 */
const getBooks = async (req, res, next) => {
  try {
    const { search, genre, status, sort } = req.query;

    const query = {};

    // Search by title or author
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { author: searchRegex }];
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    // Filter by reading status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sorting
    let sortOption = { dateAdded: -1 }; // default: newest added
    if (sort === 'title_asc') sortOption = { title: 1 };
    else if (sort === 'title_desc') sortOption = { title: -1 };
    else if (sort === 'rating_desc') sortOption = { rating: -1, dateAdded: -1 };
    else if (sort === 'progress_desc') sortOption = { currentPage: -1 };
    else if (sort === 'pages_desc') sortOption = { totalPages: -1 };
    else if (sort === 'pages_asc') sortOption = { totalPages: 1 };

    const books = await Book.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single book details by ID with associated sessions
 * @route   GET /api/books/:id
 */
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book not found with ID: ${req.params.id}`,
      });
    }

    // Fetch associated reading sessions
    const sessions = await ReadingSession.find({ book: book._id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...book.toObject(),
        sessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new book
 * @route   POST /api/books
 */
const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      genre,
      totalPages,
      currentPage,
      status,
      startDate,
      completionDate,
      rating,
      notes,
      coverImage,
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      totalPages: Number(totalPages),
      currentPage: currentPage ? Number(currentPage) : 0,
      status: status || 'Want to Read',
      startDate: startDate || null,
      completionDate: completionDate || null,
      rating: rating ? Number(rating) : null,
      notes: notes || '',
      coverImage: coverImage || '',
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book successfully added to ReadSphere database',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update book details
 * @route   PUT /api/books/:id
 */
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book not found with ID: ${req.params.id}`,
      });
    }

    const {
      title,
      author,
      genre,
      totalPages,
      currentPage,
      status,
      startDate,
      completionDate,
      rating,
      notes,
      coverImage,
    } = req.body;

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (genre !== undefined) book.genre = genre;
    if (totalPages !== undefined) book.totalPages = Number(totalPages);
    if (currentPage !== undefined) book.currentPage = Number(currentPage);
    if (status !== undefined) book.status = status;
    if (startDate !== undefined) book.startDate = startDate;
    if (completionDate !== undefined) book.completionDate = completionDate;
    if (rating !== undefined) book.rating = rating !== null && rating !== '' ? Number(rating) : null;
    if (notes !== undefined) book.notes = notes;
    if (coverImage !== undefined) book.coverImage = coverImage;

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a book and cascade delete its reading sessions
 * @route   DELETE /api/books/:id
 */
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book not found with ID: ${req.params.id}`,
      });
    }

    // Cascade delete associated reading sessions
    const deletedSessions = await ReadingSession.deleteMany({ book: book._id });

    // Remove book document
    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Book '${book.title}' and ${deletedSessions.deletedCount} associated sessions deleted successfully`,
      data: {
        deletedBookId: req.params.id,
        deletedSessionsCount: deletedSessions.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick update book reading progress (currentPage)
 * @route   PATCH /api/books/:id/progress
 */
const updateBookProgress = async (req, res, next) => {
  try {
    const { currentPage } = req.body;

    if (currentPage === undefined || currentPage === null) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Field "currentPage" is required',
      });
    }

    const pageNum = Number(currentPage);
    if (isNaN(pageNum) || pageNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Current page must be a positive number',
      });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book not found with ID: ${req.params.id}`,
      });
    }

    if (pageNum > book.totalPages) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Current page (${pageNum}) cannot exceed total pages (${book.totalPages})`,
      });
    }

    book.currentPage = pageNum;
    if (pageNum === book.totalPages) {
      book.status = 'Completed';
      if (!book.completionDate) book.completionDate = new Date();
    } else if (pageNum > 0 && book.status === 'Want to Read') {
      book.status = 'Currently Reading';
      if (!book.startDate) book.startDate = new Date();
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Reading progress updated successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a book as completed
 * @route   PATCH /api/books/:id/complete
 */
const markBookCompleted = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book not found with ID: ${req.params.id}`,
      });
    }

    book.status = 'Completed';
    book.currentPage = book.totalPages;
    book.completionDate = new Date();
    if (!book.startDate) {
      book.startDate = book.dateAdded || new Date();
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: `Congratulations! '${book.title}' marked as completed.`,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateBookProgress,
  markBookCompleted,
};

