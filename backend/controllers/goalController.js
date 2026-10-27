const ReadingGoal = require('../models/ReadingGoal');
const Book = require('../models/Book');
const ReadingSession = require('../models/ReadingSession');

/**
 * Helper to compute progress against a reading goal from actual database records
 */
const calculateGoalProgress = async (goal) => {
  const currentYear = goal.year || new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  // Completed books in this goal year
  const completedBooksCount = await Book.countDocuments({
    status: 'Completed',
    $or: [
      { completionDate: { $gte: startOfYear, $lte: endOfYear } },
      { completionDate: null, updatedAt: { $gte: startOfYear, $lte: endOfYear } },
    ],
  });

  // Current month's pages read
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthlySessions = await ReadingSession.aggregate([
    {
      $match: {
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalPages: { $sum: '$pagesRead' },
        totalMinutes: { $sum: '$durationMinutes' },
      },
    },
  ]);

  const currentMonthPages = monthlySessions.length > 0 ? monthlySessions[0].totalPages : 0;

  // Current week's duration
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const diffToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklySessions = await ReadingSession.aggregate([
    {
      $match: {
        date: { $gte: startOfWeek, $lte: now },
      },
    },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: '$durationMinutes' },
      },
    },
  ]);

  const currentWeekMinutes = weeklySessions.length > 0 ? weeklySessions[0].totalMinutes : 0;

  return {
    annualBookProgress: {
      target: goal.targetBooks,
      completed: completedBooksCount,
      percentage: Math.min(100, Math.round((completedBooksCount / goal.targetBooks) * 100)),
      remaining: Math.max(0, goal.targetBooks - completedBooksCount),
    },
    monthlyPageProgress: {
      target: goal.monthlyPageTarget,
      completed: currentMonthPages,
      percentage: Math.min(100, Math.round((currentMonthPages / goal.monthlyPageTarget) * 100)),
      remaining: Math.max(0, goal.monthlyPageTarget - currentMonthPages),
    },
    weeklyDurationProgress: {
      target: goal.weeklyDurationTarget || 120,
      completed: currentWeekMinutes,
      percentage: Math.min(
        100,
        Math.round((currentWeekMinutes / (goal.weeklyDurationTarget || 120)) * 100)
      ),
      remaining: Math.max(0, (goal.weeklyDurationTarget || 120) - currentWeekMinutes),
    },
  };
};

/**
 * @desc    Get all reading goals with calculated progress
 * @route   GET /api/goals
 */
const getGoals = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    let goals = await ReadingGoal.find().sort({ year: -1, createdAt: -1 });

    // If no goals exist yet, seed a default active goal for current year
    if (goals.length === 0) {
      const defaultGoal = new ReadingGoal({
        year: currentYear,
        targetBooks: 12,
        monthlyPageTarget: 300,
        weeklyDurationTarget: 120,
        isActive: true,
      });
      await defaultGoal.save();
      goals = [defaultGoal];
    }

    // Attach calculated progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await calculateGoalProgress(goal);
        return {
          ...goal.toObject(),
          progress,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: goalsWithProgress.length,
      data: goalsWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new reading goal
 * @route   POST /api/goals
 */
const createGoal = async (req, res, next) => {
  try {
    const { year, targetBooks, monthlyPageTarget, weeklyDurationTarget, isActive } = req.body;

    const goalYear = year ? Number(year) : new Date().getFullYear();

    if (isActive) {
      // Deactivate other goals if this one is active
      await ReadingGoal.updateMany({ year: goalYear }, { isActive: false });
    }

    const goal = new ReadingGoal({
      year: goalYear,
      targetBooks: Number(targetBooks),
      monthlyPageTarget: Number(monthlyPageTarget),
      weeklyDurationTarget: weeklyDurationTarget ? Number(weeklyDurationTarget) : 120,
      isActive: isActive !== undefined ? isActive : true,
    });

    await goal.save();

    const progress = await calculateGoalProgress(goal);

    res.status(201).json({
      success: true,
      message: 'Reading goal created successfully',
      data: {
        ...goal.toObject(),
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a reading goal
 * @route   PUT /api/goals/:id
 */
const updateGoal = async (req, res, next) => {
  try {
    const goal = await ReadingGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Reading goal not found with ID: ${req.params.id}`,
      });
    }

    const { year, targetBooks, monthlyPageTarget, weeklyDurationTarget, isActive } = req.body;

    if (year !== undefined) goal.year = Number(year);
    if (targetBooks !== undefined) goal.targetBooks = Number(targetBooks);
    if (monthlyPageTarget !== undefined) goal.monthlyPageTarget = Number(monthlyPageTarget);
    if (weeklyDurationTarget !== undefined) goal.weeklyDurationTarget = Number(weeklyDurationTarget);
    if (isActive !== undefined) goal.isActive = Boolean(isActive);

    await goal.save();

    const progress = await calculateGoalProgress(goal);

    res.status(200).json({
      success: true,
      message: 'Reading goal updated successfully',
      data: {
        ...goal.toObject(),
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a reading goal
 * @route   DELETE /api/goals/:id
 */
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await ReadingGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Reading goal not found with ID: ${req.params.id}`,
      });
    }

    await ReadingGoal.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Reading goal deleted successfully',
      data: {
        deletedGoalId: req.params.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  calculateGoalProgress,
};

