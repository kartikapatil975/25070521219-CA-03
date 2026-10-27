import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { sessionsApi, booksApi } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  History,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  Edit2,
  Trash2,
  Filter,
  Zap,
} from 'lucide-react';
import { formatDate, formatDuration, calculatePace, getBookCover } from '../utils/helpers';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const Sessions = () => {
  const { refreshTrigger, triggerGlobalRefresh, openSessionModal } = useOutletContext();
  const { showToast } = useApp();

  const [sessions, setSessions] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookFilter, setSelectedBookFilter] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, session: null });
  const [deleting, setDeleting] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, booksRes] = await Promise.all([
        sessionsApi.getAll(selectedBookFilter ? { bookId: selectedBookFilter } : {}),
        booksApi.getAll(),
      ]);
      setSessions(sessionsRes.data || []);
      setBooks(booksRes.data || []);
    } catch (err) {
      console.error('Fetch sessions error:', err);
      showToast(err.message || 'Failed to fetch sessions from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedBookFilter, showToast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, refreshTrigger]);

  const handleDeleteConfirm = async () => {
    if (!deleteModal.session) return;
    setDeleting(true);
    try {
      await sessionsApi.delete(deleteModal.session._id);
      showToast('Reading session deleted and book progress rolled back.', 'success');
      setDeleteModal({ isOpen: false, session: null });
      triggerGlobalRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete session', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Aggregated quick stats
  const totalPages = sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const avgPace = calculatePace(totalPages, totalMinutes);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-900 tracking-tight">
            Reading Sessions
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Complete reading history from local MongoDB collection{' '}
            <code className="font-mono text-forest-700">readingsessions</code>
          </p>
        </div>

        <button
          onClick={() => openSessionModal()}
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all hover:shadow active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          Log Reading Session
        </button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-parchment-200 shadow-xs">
          <span className="text-[11px] font-semibold text-ink-500 uppercase">Total Sessions</span>
          <div className="text-xl font-bold font-serif text-ink-900 mt-1">{sessions.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-parchment-200 shadow-xs">
          <span className="text-[11px] font-semibold text-ink-500 uppercase">Pages Logged</span>
          <div className="text-xl font-bold font-serif text-forest-800 mt-1">
            {totalPages.toLocaleString()} pgs
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-parchment-200 shadow-xs">
          <span className="text-[11px] font-semibold text-ink-500 uppercase">Time Spent</span>
          <div className="text-xl font-bold font-serif text-ink-900 mt-1">
            {formatDuration(totalMinutes)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-parchment-200 shadow-xs">
          <span className="text-[11px] font-semibold text-ink-500 uppercase">Average Reading Pace</span>
          <div className="text-xl font-bold font-serif text-amber-600 mt-1 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {avgPace} <span className="text-xs font-normal text-ink-500">pgs/hr</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-parchment-300 shadow-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-400" />
          <span className="text-xs font-semibold text-ink-700">Filter by book:</span>
          <select
            value={selectedBookFilter}
            onChange={(e) => setSelectedBookFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 bg-white"
          >
            <option value="">All Books</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>

        {selectedBookFilter && (
          <button
            onClick={() => setSelectedBookFilter('')}
            className="text-xs text-forest-700 hover:underline font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-parchment-200" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-parchment-300 shadow-card max-w-md mx-auto my-8">
          <History className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-ink-900 text-base mb-1">
            No Reading Sessions Found
          </h3>
          <p className="text-xs text-ink-500 mb-5">
            {selectedBookFilter
              ? 'No sessions logged for this specific book yet.'
              : 'Start logging your daily reading to build insightful habits!'}
          </p>
          <button
            onClick={() => openSessionModal()}
            className="px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors shadow-xs"
          >
            Log First Session
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-parchment-300 shadow-card overflow-hidden">
          <div className="divide-y divide-parchment-200">
            {sessions.map((session) => {
              const bookTitle = session.book?.title || 'Unknown Book';
              const bookAuthor = session.book?.author || '';
              const cover = getBookCover(session.book?.coverImage);
              const pace = calculatePace(session.pagesRead, session.durationMinutes);

              return (
                <div
                  key={session._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-parchment-50/50 transition-colors group"
                >
                  {/* Left: Book info & Cover */}
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={cover}
                      alt=""
                      className="w-11 h-15 object-cover rounded-lg border border-parchment-300 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      {session.book?._id ? (
                        <Link
                          to={`/books/${session.book._id}`}
                          className="font-serif font-bold text-sm text-ink-900 hover:text-forest-700 transition-colors truncate block"
                        >
                          {bookTitle}
                        </Link>
                      ) : (
                        <span className="font-serif font-bold text-sm text-ink-900 truncate block">
                          {bookTitle}
                        </span>
                      )}
                      <p className="text-xs text-ink-500 truncate">{bookAuthor}</p>

                      {session.notes && (
                        <p className="text-xs text-ink-600 italic mt-1 line-clamp-1">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Session Metrics */}
                  <div className="flex items-center gap-6 sm:gap-8 text-xs shrink-0 pl-15 sm:pl-0">
                    <div>
                      <span className="text-[10px] text-ink-400 uppercase font-semibold block">Date</span>
                      <span className="font-medium text-ink-700 block mt-0.5">
                        {formatDate(session.date)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-ink-400 uppercase font-semibold block">Pages</span>
                      <span className="font-bold text-forest-800 text-sm block mt-0.5">
                        +{session.pagesRead} pgs
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-ink-400 uppercase font-semibold block">Duration</span>
                      <span className="font-medium text-ink-700 block mt-0.5">
                        {formatDuration(session.durationMinutes)}
                      </span>
                    </div>

                    <div className="hidden md:block">
                      <span className="text-[10px] text-ink-400 uppercase font-semibold block">Pace</span>
                      <span className="font-medium text-amber-600 block mt-0.5">
                        {pace} pgs/hr
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openSessionModal(session)}
                        className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-parchment-200 transition-colors"
                        title="Edit session"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, session })}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Reading Session?"
        message="Deleting this session will remove it from the 'readingsessions' collection in MongoDB and roll back the pages read from the book's current progress."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, session: null })}
      />
    </div>
  );
};

