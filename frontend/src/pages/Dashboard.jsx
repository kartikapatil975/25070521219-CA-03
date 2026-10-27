import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { dashboardApi, booksApi } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  CheckCircle,
  Bookmark,
  Clock,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  Database,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatDate, formatDuration, getBookCover, getStatusBadge, GENRE_PALETTE } from '../utils/helpers';

export const Dashboard = () => {
  const { refreshTrigger, openBookModal, openSessionModal, openGoalModal } = useOutletContext();
  const { dbHealth, openCompassModal, showToast } = useApp();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickUpdateId, setQuickUpdateId] = useState(null);
  const [quickPage, setQuickPage] = useState(0);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, refreshTrigger]);

  const handleQuickProgressSubmit = async (bookId, totalPages) => {
    const pageNum = Number(quickPage);
    if (isNaN(pageNum) || pageNum < 0 || pageNum > totalPages) {
      showToast(`Page must be between 0 and ${totalPages}`, 'error');
      return;
    }

    try {
      await booksApi.updateProgress(bookId, pageNum);
      showToast('Reading progress updated!', 'success');
      setQuickUpdateId(null);
      fetchDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to update progress', 'error');
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white rounded-2xl border border-parchment-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-parchment-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-parchment-200" />
          <div className="h-72 bg-white rounded-2xl border border-parchment-200" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-parchment-300 shadow-card text-center max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Database className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-ink-900 mb-2">
          Unable to Load Reading Data
        </h2>
        <p className="text-sm text-ink-600 mb-6 leading-relaxed">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={openCompassModal}
            className="px-4 py-2 bg-forest-700 text-white rounded-xl text-sm font-semibold hover:bg-forest-800 transition-colors shadow-xs"
          >
            MongoDB Compass Setup
          </button>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-parchment-100 text-ink-700 rounded-xl text-sm font-medium hover:bg-parchment-200 transition-colors border border-parchment-300"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const {
    summary = {},
    goals = {},
    recentlyUpdatedBooks = [],
    recentReadingSessions = [],
    readingActivityChart = [],
    genreDistributionChart = [],
  } = data || {};

  const annualGoal = goals.progress?.annualBookProgress || { target: 12, completed: 0, percentage: 0 };
  const monthlyGoal = goals.progress?.monthlyPageProgress || { target: 300, completed: 0, percentage: 0 };

  const COLORS = [
    '#2D6A4F',
    '#1B4332',
    '#2563EB',
    '#D97706',
    '#7C3AED',
    '#059669',
    '#C026D3',
    '#B45309',
    '#0284C7',
    '#475569',
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Goal Highlights Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-forest-50/60 to-transparent pointer-events-none hidden md:block" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              <span>Smart Reading Tracker • Local MongoDB Compass Connected</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900 tracking-tight">
              Welcome back to ReadSphere
            </h1>
            <p className="text-sm text-ink-600 mt-1 max-w-xl">
              Track your reading pace, log sessions, build literary momentum, and inspect verified records inside MongoDB Compass.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openSessionModal()}
              className="px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              Log Reading Session
            </button>
            <button
              onClick={() => openBookModal()}
              className="px-4 py-2.5 rounded-xl bg-parchment-50 hover:bg-parchment-200 text-forest-900 border border-parchment-300 text-sm font-medium transition-colors"
            >
              Add Book
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Books */}
        <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-xs hover:border-forest-600 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
              Total Books
            </span>
            <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-900">{summary.totalBooks || 0}</div>
          <span className="text-xs text-ink-500 mt-1 block">In your personal library</span>
        </div>

        {/* Currently Reading */}
        <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-xs hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Reading
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-900">
            {summary.currentlyReading || 0}
          </div>
          <span className="text-xs text-ink-500 mt-1 block">Active reading journeys</span>
        </div>

        {/* Completed Books */}
        <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-xs hover:border-emerald-600 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-900">
            {summary.completedBooks || 0}
          </div>
          <span className="text-xs text-ink-500 mt-1 block">Finished titles</span>
        </div>

        {/* Total Pages Read */}
        <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-xs hover:border-forest-600 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
              Pages Read
            </span>
            <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-900">
            {summary.totalPagesRead?.toLocaleString() || 0}
          </div>
          <span className="text-xs text-ink-500 mt-1 block">
            {summary.overallReadingProgress || 0}% of all library pages
          </span>
        </div>

        {/* Total Time Read */}
        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-parchment-200 shadow-xs hover:border-forest-600 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
              Total Reading Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-900">
            {summary.totalReadingHours || '0.0'} <span className="text-sm font-sans font-normal text-ink-500">hrs</span>
          </div>
          <span className="text-xs text-ink-500 mt-1 block">
            Across {summary.totalSessionsCount || 0} logged sessions
          </span>
        </div>
      </div>

      {/* Reading Goals Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Annual Goal */}
        <div className="bg-white p-6 rounded-2xl border border-parchment-300 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink-900 text-sm">
                  {goals.activeGoal?.year || new Date().getFullYear()} Annual Book Target
                </h3>
                <span className="text-xs text-ink-500">
                  {annualGoal.completed} of {annualGoal.target} books completed
                </span>
              </div>
            </div>
            <button
              onClick={() => openGoalModal(goals.activeGoal)}
              className="text-xs text-forest-700 hover:text-forest-800 font-semibold hover:underline"
            >
              Adjust Goal
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-parchment-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-forest-700 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${annualGoal.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-ink-500 font-medium">
              <span>{annualGoal.percentage}% achieved</span>
              <span>{annualGoal.remaining} books remaining</span>
            </div>
          </div>
        </div>

        {/* Monthly Page Target */}
        <div className="bg-white p-6 rounded-2xl border border-parchment-300 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink-900 text-sm">
                  Monthly Pages Target
                </h3>
                <span className="text-xs text-ink-500">
                  {monthlyGoal.completed} of {monthlyGoal.target} pages read this month
                </span>
              </div>
            </div>
            <button
              onClick={() => openGoalModal(goals.activeGoal)}
              className="text-xs text-forest-700 hover:text-forest-800 font-semibold hover:underline"
            >
              Adjust Goal
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-parchment-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-amber-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${monthlyGoal.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-ink-500 font-medium">
              <span>{monthlyGoal.percentage}% achieved</span>
              <span>{monthlyGoal.remaining} pages remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currently Reading Books Showcase */}
      {recentlyUpdatedBooks.filter((b) => b.status === 'Currently Reading').length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-ink-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-forest-700" />
              Currently Reading
            </h2>
            <Link
              to="/books"
              className="text-xs font-semibold text-forest-700 hover:text-forest-800 flex items-center gap-1"
            >
              View all books <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentlyUpdatedBooks
              .filter((b) => b.status === 'Currently Reading')
              .map((book) => {
                const cover = getBookCover(book.coverImage, book.genre);
                const isUpdating = quickUpdateId === book._id;

                return (
                  <div
                    key={book._id}
                    className="bg-white rounded-2xl p-5 border border-parchment-300 shadow-card flex gap-4 transition-all hover:shadow-elevated"
                  >
                    <img
                      src={cover}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-xl border border-parchment-300 shadow-sm shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full inline-block mb-1">
                          {book.genre}
                        </span>
                        <h3 className="font-serif font-bold text-ink-900 text-sm truncate" title={book.title}>
                          {book.title}
                        </h3>
                        <p className="text-xs text-ink-500 truncate">{book.author}</p>
                      </div>

                      <div className="mt-2 space-y-1.5">
                        <div className="w-full bg-parchment-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-forest-700 h-2 rounded-full"
                            style={{ width: `${book.progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-ink-500">
                          <span>
                            {book.currentPage} / {book.totalPages} pgs
                          </span>
                          <span className="font-semibold text-forest-800">
                            {book.progressPercentage}%
                          </span>
                        </div>
                      </div>

                      {/* Quick progress update button or input */}
                      <div className="mt-3 pt-2 border-t border-parchment-100 flex items-center gap-2">
                        {isUpdating ? (
                          <div className="flex items-center gap-1.5 w-full">
                            <input
                              type="number"
                              min="0"
                              max={book.totalPages}
                              value={quickPage}
                              onChange={(e) => setQuickPage(e.target.value)}
                              className="w-16 px-2 py-1 text-xs border rounded-lg focus:outline-hidden focus:border-forest-700"
                            />
                            <button
                              onClick={() => handleQuickProgressSubmit(book._id, book.totalPages)}
                              className="px-2 py-1 text-xs bg-forest-700 text-white rounded-lg font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setQuickUpdateId(null)}
                              className="px-2 py-1 text-xs text-ink-500 hover:text-ink-800"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => openSessionModal(null, book._id)}
                              className="flex-1 py-1.5 px-2 bg-forest-700 hover:bg-forest-800 text-white text-[11px] font-semibold rounded-lg text-center transition-colors"
                            >
                              + Session
                            </button>
                            <button
                              onClick={() => {
                                setQuickUpdateId(book._id);
                                setQuickPage(book.currentPage);
                              }}
                              className="py-1.5 px-2 bg-parchment-100 hover:bg-parchment-200 text-ink-700 text-[11px] font-medium rounded-lg border border-parchment-300"
                            >
                              Update Pg
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reading Activity (Area Chart - Last 14 Days) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-parchment-300 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-serif font-bold text-ink-900">
                Reading Activity Trend
              </h3>
              <p className="text-xs text-ink-500">Pages read each day over the past 14 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-forest-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-700 inline-block" />
                Pages Read
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readingActivityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0].payload;
                      return (
                        <div className="bg-ink-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-emerald-300">{label}</p>
                          <p>Pages read: <span className="font-bold">{dataPoint.pages}</span></p>
                          <p>Duration: <span className="font-bold">{formatDuration(dataPoint.minutes)}</span></p>
                          <p>Sessions: <span className="font-bold">{dataPoint.sessions}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pages"
                  stroke="#1B4332"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#forestGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-parchment-300 shadow-card flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-serif font-bold text-ink-900">
              Genre Distribution
            </h3>
            <p className="text-xs text-ink-500">Breakdown of books by genre</p>
          </div>

          {genreDistributionChart.length > 0 ? (
            <>
              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreDistributionChart}
                      dataKey="count"
                      nameKey="genre"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {genreDistributionChart.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={GENRE_PALETTE[entry.genre] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-ink-900 text-white p-2.5 rounded-xl text-xs">
                              <p className="font-bold text-emerald-300">{item.genre}</p>
                              <p>{item.count} book{item.count > 1 ? 's' : ''}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2 justify-center max-h-20 overflow-y-auto">
                {genreDistributionChart.slice(0, 6).map((item, idx) => (
                  <span
                    key={item.genre}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-parchment-100 text-ink-700 border border-parchment-200"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: GENRE_PALETTE[item.genre] || COLORS[idx % COLORS.length],
                      }}
                    />
                    {item.genre} ({item.count})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-ink-400 text-xs">
              <BookOpen className="w-8 h-8 mb-2 opacity-50" />
              <span>No genre records yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reading Sessions Table */}
      <div className="bg-white rounded-2xl border border-parchment-300 shadow-card overflow-hidden">
        <div className="p-6 border-b border-parchment-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-ink-900">
              Recent Reading Sessions
            </h3>
            <p className="text-xs text-ink-500">
              Latest reading entries recorded to MongoDB collection{' '}
              <code className="font-mono text-forest-700">readingsessions</code>
            </p>
          </div>
          <Link
            to="/sessions"
            className="text-xs font-semibold text-forest-700 hover:text-forest-800 flex items-center gap-1"
          >
            All sessions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReadingSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-parchment-50 text-xs text-ink-500 font-semibold uppercase tracking-wider border-b border-parchment-200">
                <tr>
                  <th className="py-3 px-6">Book</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Pages</th>
                  <th className="py-3 px-6">Duration</th>
                  <th className="py-3 px-6">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200">
                {recentReadingSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-parchment-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-ink-900 flex items-center gap-3">
                      <img
                        src={getBookCover(session.book?.coverImage)}
                        alt=""
                        className="w-8 h-11 object-cover rounded shadow-xs"
                      />
                      <div>
                        <span className="block font-serif font-bold text-xs truncate max-w-xs">
                          {session.book?.title || 'Unknown Book'}
                        </span>
                        <span className="block text-[11px] text-ink-500 truncate max-w-xs">
                          {session.book?.author}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-ink-600">
                      {formatDate(session.date)}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-forest-800">
                      +{session.pagesRead} pgs
                    </td>
                    <td className="py-3.5 px-6 text-xs text-ink-700">
                      {formatDuration(session.durationMinutes)}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-ink-500 truncate max-w-xs">
                      {session.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-ink-500 text-xs">
            No reading sessions logged yet. Click "Log Reading Session" above to start tracking!
          </div>
        )}
      </div>
    </div>
  );
};

