const ReadingSession = require('../models/ReadingSession');
const Book = require('../models/Book');

/**
 * @desc    Get all reading sessions with optional book filter and pagination/limit
 * @route   GET /api/sessions
 */
const getSessions = async (req, res, next) => {
  try {
    const { bookId, limit } = req.query;
    const query = {};

    if (bookId) {
      query.book = bookId;
    }

    let sessionsQuery = ReadingSession.find(query)
      .populate('book', 'title author coverImage totalPages currentPage status')
      .sort({ date: -1, createdAt: -1 });

    if (limit && !isNaN(Number(limit))) {
      sessionsQuery = sessionsQuery.limit(Number(limit));
    }

    const sessions = await sessionsQuery;

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single reading session by ID
 * @route   GET /api/sessions/:id
 */
const getSessionById = async (req, res, next) => {
  try {
    const session = await ReadingSession.findById(req.params.id).populate(
      'book',
      'title author coverImage totalPages currentPage status'
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Reading session not found with ID: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new reading session and synchronize book progress
 * @route   POST /api/sessions
 */
const createSession = async (req, res, next) => {
  try {
    const { book: bookId, pagesRead, durationMinutes, date, notes } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Book ID is required to log a reading session',
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book not found with ID: ${bookId}`,
      });
    }

    const pages = Number(pagesRead);
    const duration = Number(durationMinutes);

    if (isNaN(pages) || pages < 1) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Pages read must be a positive number of at least 1',
      });
    }

    if (isNaN(duration) || duration < 1) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Duration must be at least 1 minute',
      });
    }

    const sessionDate = date ? new Date(date) : new Date();

    // Create session record
    const session = new ReadingSession({
      book: book._id,
      pagesRead: pages,
      durationMinutes: duration,
      date: sessionDate,
      notes: notes || '',
    });

    await session.save();

    // Synchronize Book progress automatically
    const updatedPage = Math.min(book.totalPages, book.currentPage + pages);
    book.currentPage = updatedPage;

    if (book.currentPage >= book.totalPages) {
      book.status = 'Completed';
      if (!book.completionDate) book.completionDate = sessionDate;
    } else if (book.status === 'Want to Read') {
      book.status = 'Currently Reading';
      if (!book.startDate) book.startDate = sessionDate;
    }

    await book.save();

    const populatedSession = await ReadingSession.findById(session._id).populate(
      'book',
      'title author coverImage totalPages currentPage status'
    );

    res.status(201).json({
      success: true,
      message: 'Reading session recorded and book progress updated',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a reading session and reconcile book progress
 * @route   PUT /api/sessions/:id
 */
const updateSession = async (req, res, next) => {
  try {
    const session = await ReadingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Reading session not found with ID: ${req.params.id}`,
      });
    }

    const { pagesRead, durationMinutes, date, notes } = req.body;
    const oldPagesRead = session.pagesRead;

    if (durationMinutes !== undefined) {
      const dur = Number(durationMinutes);
      if (isNaN(dur) || dur < 1) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Duration must be at least 1 minute',
        });
      }
      session.durationMinutes = dur;
    }

    if (date !== undefined) {
      session.date = new Date(date);
    }

    if (notes !== undefined) {
      session.notes = notes;
    }

    // Reconcile pages if changed
    if (pagesRead !== undefined && Number(pagesRead) !== oldPagesRead) {
      const newPages = Number(pagesRead);
      if (isNaN(newPages) || newPages < 1) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Pages read must be at least 1',
        });
      }

      session.pagesRead = newPages;

      // Adjust book's currentPage by the exact delta
      const book = await Book.findById(session.book);
      if (book) {
        const delta = newPages - oldPagesRead;
        const adjustedPage = Math.max(0, Math.min(book.totalPages, book.currentPage + delta));
        book.currentPage = adjustedPage;

        if (book.currentPage >= book.totalPages) {
          book.status = 'Completed';
          if (!book.completionDate) book.completionDate = new Date();
        } else if (book.status === 'Completed' && book.currentPage < book.totalPages) {
          book.status = 'Currently Reading';
          book.completionDate = null;
        }

        await book.save();
      }
    }

    await session.save();

    const populatedSession = await ReadingSession.findById(session._id).populate(
      'book',
      'title author coverImage totalPages currentPage status'
    );

    res.status(200).json({
      success: true,
      message: 'Reading session updated successfully',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a reading session and roll back book progress
 * @route   DELETE /api/sessions/:id
 */
const deleteSession = async (req, res, next) => {
  try {
    const session = await ReadingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Reading session not found with ID: ${req.params.id}`,
      });
    }

    // Roll back pages from the associated book
    const book = await Book.findById(session.book);
    if (book) {
      const rolledBackPage = Math.max(0, book.currentPage - session.pagesRead);
      book.currentPage = rolledBackPage;

      if (book.status === 'Completed' && rolledBackPage < book.totalPages) {
        book.status = 'Currently Reading';
        book.completionDate = null;
      }

      await book.save();
    }

    await ReadingSession.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Reading session removed and book progress adjusted',
      data: {
        deletedSessionId: req.params.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
};

