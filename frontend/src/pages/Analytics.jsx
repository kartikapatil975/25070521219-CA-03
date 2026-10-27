import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  Star,
  Zap,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
import { formatDuration, GENRE_PALETTE } from '../utils/helpers';

export const Analytics = () => {
  const { refreshTrigger } = useOutletContext();
  const { showToast } = useApp();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
      showToast(err.message || 'Failed to fetch analytics from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, refreshTrigger]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse max-w-6xl mx-auto">
        <div className="h-24 bg-white rounded-2xl border border-parchment-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-parchment-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 bg-white rounded-2xl border border-parchment-200" />
          <div className="h-72 bg-white rounded-2xl border border-parchment-200" />
        </div>
      </div>
    );
  }

  const {
    year = new Date().getFullYear(),
    completedBooksByMonth = [],
    monthlyTrends = [],
    ratingsDistribution = [],
    genres = [],
    topAuthors = [],
    metrics = {},
  } = data || {};

  const COLORS = ['#2D6A4F', '#1B4332', '#2563EB', '#D97706', '#7C3AED', '#059669', '#C026D3', '#0284C7'];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-ink-900 tracking-tight">
          Reading Analytics & Deep Insights
        </h1>
        <p className="text-xs text-ink-500 mt-1">
          Comprehensive statistics computed from live MongoDB records for {year}
        </p>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Avg Session Duration */}
        <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
              Avg Session Length
            </span>
            <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-900">
            {metrics.avgSessionDuration || 0} <span className="text-sm font-normal text-ink-500">mins</span>
          </div>
          <span className="text-xs text-ink-500 mt-1 block">Typical reading duration</span>
        </div>

        {/* Avg Pages per Session */}
        <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-forest-700 uppercase tracking-wider">
              Avg Pages / Session
            </span>
            <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-forest-800">
            {metrics.avgPagesPerSession || 0} <span className="text-sm font-normal text-ink-500">pgs</span>
          </div>
          <span className="text-xs text-ink-500 mt-1 block">Average throughput per sitting</span>
        </div>

        {/* Longest Session */}
        <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Longest Session
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-amber-600">
            {formatDuration(metrics.longestSessionMinutes)}
          </div>
          <span className="text-xs text-ink-500 mt-1 block">
            Most pages: {metrics.mostPagesInSession || 0} pgs
          </span>
        </div>

        {/* Total Time Read */}
        <div className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
              Total Reading Logged
            </span>
            <div className="w-8 h-8 rounded-lg bg-parchment-100 text-ink-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-900">
            {metrics.totalReadingHours || 0} <span className="text-sm font-normal text-ink-500">hrs</span>
          </div>
          <span className="text-xs text-ink-500 mt-1 block">
            Across {metrics.totalSessions || 0} recorded sessions
          </span>
        </div>
      </div>

      {/* Charts Row 1: Completed Books by Month & Pages Read Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Books by Month */}
        <div className="bg-white p-6 rounded-2xl border border-parchment-300 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-ink-900">
                Completed Books by Month ({year})
              </h3>
              <p className="text-xs text-ink-500">Monthly breakdown of finished book titles</p>
            </div>
            <BookOpen className="w-5 h-5 text-forest-700" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completedBooksByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-ink-900 text-white p-3 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-emerald-300">{label} {year}</p>
                          <p>Books completed: <span className="font-bold">{item.count}</span></p>
                          {item.books?.length > 0 && (
                            <p className="text-[11px] text-stone-300 italic truncate max-w-xs">
                              {item.books.join(', ')}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#1B4332" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Pages Read Trend */}
        <div className="bg-white p-6 rounded-2xl border border-parchment-300 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-ink-900">
                Monthly Pages Read ({year})
              </h3>
              <p className="text-xs text-ink-500">Total volume of pages read each month</p>
            </div>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-ink-900 text-white p-3 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-amber-400">{label} {year}</p>
                          <p>Pages read: <span className="font-bold">{item.pages}</span></p>
                          <p>Time read: <span className="font-bold">{item.hours} hrs</span></p>
                          <p>Sessions: <span className="font-bold">{item.sessions}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pages"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#amberGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Ratings Distribution & Genre Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ratings Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-parchment-300 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-ink-900">
                Personal Ratings Distribution
              </h3>
              <p className="text-xs text-ink-500">Books rated by star score (1 to 5 stars)</p>
            </div>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingsDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="rating" tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-ink-900 text-white p-2.5 rounded-xl text-xs">
                          <p className="font-bold text-amber-400">{item.rating}</p>
                          <p>{item.count} book{item.count !== 1 ? 's' : ''}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Authors */}
        <div className="bg-white p-6 rounded-2xl border border-parchment-300 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-ink-900">
                  Most Read Authors
                </h3>
                <p className="text-xs text-ink-500">Authors with the most titles in your library</p>
              </div>
              <Award className="w-5 h-5 text-forest-700" />
            </div>

            {topAuthors.length > 0 ? (
              <div className="space-y-3">
                {topAuthors.map((author, idx) => (
                  <div
                    key={author._id}
                    className="p-3 rounded-xl bg-parchment-50 border border-parchment-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-forest-700 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-serif font-bold text-xs text-ink-900 block">
                          {author._id}
                        </span>
                        <span className="text-[11px] text-ink-500">
                          {author.totalPages} total pages across books
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-forest-800 bg-forest-100 px-2.5 py-1 rounded-full">
                      {author.booksCount} book{author.booksCount > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-ink-400 text-xs">No author records yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Genre In-Depth Table */}
      <div className="bg-white rounded-2xl border border-parchment-300 shadow-card overflow-hidden">
        <div className="p-6 border-b border-parchment-200">
          <h3 className="text-base font-serif font-bold text-ink-900">
            Genre Breakdown & Reading Completion
          </h3>
          <p className="text-xs text-ink-500">
            Performance and volume metrics segmented by literary genre
          </p>
        </div>

        {genres.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-parchment-50 text-xs text-ink-500 font-semibold uppercase tracking-wider border-b border-parchment-200">
                <tr>
                  <th className="py-3 px-6">Genre</th>
                  <th className="py-3 px-6">Books Count</th>
                  <th className="py-3 px-6">Share</th>
                  <th className="py-3 px-6">Completed</th>
                  <th className="py-3 px-6">Pages Read</th>
                  <th className="py-3 px-6">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200">
                {genres.map((g) => (
                  <tr key={g.genre} className="hover:bg-parchment-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-ink-900 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: GENRE_PALETTE[g.genre] || '#475569' }}
                      />
                      <span>{g.genre}</span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-ink-800">{g.count}</td>
                    <td className="py-3.5 px-6 text-xs text-ink-600">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-parchment-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-forest-700 h-1.5 rounded-full" style={{ width: `${g.percentage}%` }} />
                        </div>
                        <span>{g.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-emerald-700 font-medium">
                      {g.completedCount} / {g.count}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-forest-800 font-semibold">
                      {g.pagesRead?.toLocaleString()} / {g.totalPages?.toLocaleString()} pgs
                    </td>
                    <td className="py-3.5 px-6 text-xs font-semibold text-amber-600">
                      {g.avgRating ? `★ ${g.avgRating}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-ink-500 text-xs">
            No books in database to analyze yet.
          </div>
        )}
      </div>
    </div>
  );
};

