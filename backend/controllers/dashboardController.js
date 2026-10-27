const Book = require('../models/Book');
const ReadingSession = require('../models/ReadingSession');
const ReadingGoal = require('../models/ReadingGoal');
const { calculateGoalProgress } = require('./goalController');

/**
 * @desc    Get aggregated dashboard summary, metrics, and charts data
 * @route   GET /api/dashboard
 */
const getDashboardData = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();

    // 1. Book status counts
    const [
      totalBooks,
      currentlyReadingCount,
      completedBooksCount,
      wantToReadCount,
    ] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ status: 'Currently Reading' }),
      Book.countDocuments({ status: 'Completed' }),
      Book.countDocuments({ status: 'Want to Read' }),
    ]);

    // 2. Total pages read & total reading duration from ReadingSession collection
    const sessionAggregates = await ReadingSession.aggregate([
      {
        $group: {
          _id: null,
          totalPagesRead: { $sum: '$pagesRead' },
          totalReadingMinutes: { $sum: '$durationMinutes' },
          totalSessionsCount: { $sum: 1 },
        },
      },
    ]);

    const sessionStats = sessionAggregates[0] || {
      totalPagesRead: 0,
      totalReadingMinutes: 0,
      totalSessionsCount: 0,
    };

    // Calculate sum of totalPages across all books for overall progress
    const booksAggregates = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalAllPages: { $sum: '$totalPages' },
          totalCurrentPages: { $sum: '$currentPage' },
        },
      },
    ]);

    const bookStats = booksAggregates[0] || {
      totalAllPages: 0,
      totalCurrentPages: 0,
    };

    const overallReadingProgress =
      bookStats.totalAllPages > 0
        ? Math.min(100, Math.round((bookStats.totalCurrentPages / bookStats.totalAllPages) * 100))
        : 0;

    // 3. Reading Goal progress
    let activeGoal = await ReadingGoal.findOne({ isActive: true, year: currentYear });
    if (!activeGoal) {
      activeGoal = await ReadingGoal.findOne().sort({ year: -1, createdAt: -1 });
    }
    if (!activeGoal) {
      activeGoal = new ReadingGoal({
        year: currentYear,
        targetBooks: 12,
        monthlyPageTarget: 300,
        weeklyDurationTarget: 120,
        isActive: true,
      });
      await activeGoal.save();
    }

    const goalProgress = await calculateGoalProgress(activeGoal);

    // 4. Recently updated books (top 4)
    const recentlyUpdatedBooks = await Book.find()
      .sort({ updatedAt: -1 })
      .limit(4);

    // 5. Recent reading sessions (top 5)
    const recentReadingSessions = await ReadingSession.find()
      .populate('book', 'title author coverImage totalPages currentPage status')
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // 6. Reading Activity Chart (Last 14 days)
    const today = new Date();
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const activityData = await ReadingSession.aggregate([
      {
        $match: {
          date: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          pages: { $sum: '$pagesRead' },
          minutes: { $sum: '$durationMinutes' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map into complete 14-day array ensuring no missing dates
    const activityMap = new Map(activityData.map((d) => [d._id, d]));
    const readingActivityChart = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const found = activityMap.get(dateStr);

      readingActivityChart.push({
        date: dateStr,
        day: dayLabel,
        pages: found ? found.pages : 0,
        minutes: found ? found.minutes : 0,
        sessions: found ? found.sessions : 0,
      });
    }

    // 7. Genre Distribution Chart
    const genreDistribution = await Book.aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
          totalPages: { $sum: '$totalPages' },
          pagesRead: { $sum: '$currentPage' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const genreDistributionChart = genreDistribution.map((item) => ({
      genre: item._id || 'Unspecified',
      count: item.count,
      totalPages: item.totalPages,
      pagesRead: item.pagesRead,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBooks,
          currentlyReading: currentlyReadingCount,
          completedBooks: completedBooksCount,
          wantToRead: wantToReadCount,
          totalPagesRead: sessionStats.totalPagesRead || bookStats.totalCurrentPages,
          totalReadingMinutes: sessionStats.totalReadingMinutes,
          totalReadingHours: (sessionStats.totalReadingMinutes / 60).toFixed(1),
          totalSessionsCount: sessionStats.totalSessionsCount,
          overallReadingProgress,
        },
        goals: {
          activeGoal,
          progress: goalProgress,
        },
        recentlyUpdatedBooks,
        recentReadingSessions,
        readingActivityChart,
        genreDistributionChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed statistics and deep insights
 * @route   GET /api/analytics
 */
const getAnalyticsData = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // 1. Completed books by month for current year
    const completedBooksByMonthRaw = await Book.aggregate([
      {
        $match: {
          status: 'Completed',
          completionDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: '$completionDate' },
          count: { $sum: 1 },
          books: { $push: '$title' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const completedBooksByMonth = monthNames.map((name, index) => {
      const found = completedBooksByMonthRaw.find((m) => m._id === index + 1);
      return {
        month: name,
        count: found ? found.count : 0,
        books: found ? found.books : [],
      };
    });

    // 2. Pages read by month in current year
    const pagesByMonthRaw = await ReadingSession.aggregate([
      {
        $match: {
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          pages: { $sum: '$pagesRead' },
          minutes: { $sum: '$durationMinutes' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyTrends = monthNames.map((name, index) => {
      const found = pagesByMonthRaw.find((m) => m._id === index + 1);
      return {
        month: name,
        pages: found ? found.pages : 0,
        minutes: found ? found.minutes : 0,
        hours: found ? +(found.minutes / 60).toFixed(1) : 0,
        sessions: found ? found.sessions : 0,
      };
    });

    // 3. Ratings distribution
    const ratingsDistributionRaw = await Book.aggregate([
      {
        $match: {
          rating: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ratingsMap = new Map(ratingsDistributionRaw.map((r) => [r._id, r.count]));
    const ratingsDistribution = [1, 2, 3, 4, 5].map((stars) => ({
      rating: `${stars} Star${stars > 1 ? 's' : ''}`,
      stars,
      count: ratingsMap.get(stars) || 0,
    }));

    // 4. Session length metrics
    const sessionMetrics = await ReadingSession.aggregate([
      {
        $group: {
          _id: null,
          avgSessionDuration: { $avg: '$durationMinutes' },
          avgPagesPerSession: { $avg: '$pagesRead' },
          maxDuration: { $max: '$durationMinutes' },
          maxPages: { $max: '$pagesRead' },
          totalDuration: { $sum: '$durationMinutes' },
          totalSessions: { $sum: 1 },
        },
      },
    ]);

    const sessionStats = sessionMetrics[0] || {
      avgSessionDuration: 0,
      avgPagesPerSession: 0,
      maxDuration: 0,
      maxPages: 0,
      totalDuration: 0,
      totalSessions: 0,
    };

    // 5. Genre breakdown with percentages
    const totalBooks = await Book.countDocuments();
    const genreRaw = await Book.aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          totalPages: { $sum: '$totalPages' },
          pagesRead: { $sum: '$currentPage' },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const genreAnalytics = genreRaw.map((g) => ({
      genre: g._id || 'Unspecified',
      count: g.count,
      percentage: totalBooks > 0 ? Math.round((g.count / totalBooks) * 100) : 0,
      completedCount: g.completedCount,
      totalPages: g.totalPages,
      pagesRead: g.pagesRead,
      avgRating: g.avgRating ? Number(g.avgRating.toFixed(1)) : null,
    }));

    // 6. Top author
    const topAuthors = await Book.aggregate([
      {
        $group: {
          _id: '$author',
          booksCount: { $sum: 1 },
          completedBooks: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          totalPages: { $sum: '$totalPages' },
        },
      },
      { $sort: { booksCount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        year: currentYear,
        completedBooksByMonth,
        monthlyTrends,
        ratingsDistribution,
        genres: genreAnalytics,
        topAuthors,
        metrics: {
          avgSessionDuration: Math.round(sessionStats.avgSessionDuration || 0),
          avgPagesPerSession: Math.round(sessionStats.avgPagesPerSession || 0),
          longestSessionMinutes: sessionStats.maxDuration || 0,
          mostPagesInSession: sessionStats.maxPages || 0,
          totalReadingMinutes: sessionStats.totalDuration || 0,
          totalReadingHours: +(sessionStats.totalDuration / 60).toFixed(1),
          totalSessions: sessionStats.totalSessions || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getAnalyticsData,
};

