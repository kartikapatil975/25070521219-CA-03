import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { booksApi, sessionsApi } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Edit2,
  Trash2,
  Plus,
  History,
  AlertCircle,
  Save,
} from 'lucide-react';
import { formatDate, formatDuration, getBookCover, getStatusBadge } from '../utils/helpers';
import { BookModal } from '../components/BookModal';
import { SessionModal } from '../components/SessionModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick page progress state
  const [currentPageInput, setCurrentPageInput] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);

  // Edit / Delete modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionModalState, setSessionModalState] = useState({ isOpen: false, session: null });
  const [deleteSessionModal, setDeleteSessionModal] = useState({ isOpen: false, session: null });

  const fetchBookDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await booksApi.getById(id);
      setBook(res.data);
      setCurrentPageInput(res.data.currentPage || 0);
    } catch (err) {
      console.error('Fetch book detail error:', err);
      setError(err.message || 'Failed to load book record');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleProgressUpdate = async (e) => {
    e.preventDefault();
    const pageNum = Number(currentPageInput);
    if (isNaN(pageNum) || pageNum < 0 || pageNum > book.totalPages) {
      showToast(`Page must be between 0 and ${book.totalPages}`, 'error');
      return;
    }

    setSavingProgress(true);
    try {
      await booksApi.updateProgress(book._id, pageNum);
      showToast('Reading progress updated!', 'success');
      fetchBookDetails();
    } catch (err) {
      showToast(err.message || 'Failed to update progress', 'error');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await booksApi.markCompleted(book._id);
      showToast(`Congratulations! '${book.title}' is marked as completed!`, 'success');
      fetchBookDetails();
    } catch (err) {
      showToast(err.message || 'Failed to mark completed', 'error');
    }
  };

  const handleDeleteBook = async () => {
    try {
      await booksApi.delete(book._id);
      showToast(`'${book.title}' deleted from library.`, 'success');
      navigate('/books');
    } catch (err) {
      showToast(err.message || 'Failed to delete book', 'error');
    }
  };

  const handleDeleteSessionConfirm = async () => {
    if (!deleteSessionModal.session) return;
    try {
      await sessionsApi.delete(deleteSessionModal.session._id);
      showToast('Reading session deleted and book progress rolled back.', 'success');
      setDeleteSessionModal({ isOpen: false, session: null });
      fetchBookDetails();
    } catch (err) {
      showToast(err.message || 'Failed to delete session', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-6 w-32 bg-parchment-200 rounded-lg" />
        <div className="h-96 bg-white rounded-3xl border border-parchment-200" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-parchment-300 shadow-card text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-serif font-bold text-ink-900 mb-1">Book Not Found</h2>
        <p className="text-xs text-ink-600 mb-5">{error || 'This book record may have been removed.'}</p>
        <Link
          to="/books"
          className="px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors"
        >
          Return to Books
        </Link>
      </div>
    );
  }

  const badge = getStatusBadge(book.status);
  const cover = getBookCover(book.coverImage, book.genre);
  const sessions = book.sessions || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </div>

      {/* Main Book Profile Card */}
      <div className="bg-white rounded-3xl border border-parchment-300 shadow-card overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8">
          {/* Cover & Quick Actions */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-44 h-64 rounded-2xl overflow-hidden shadow-elevated border border-parchment-300 bg-parchment-100 relative">
              <img src={cover} alt={book.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center gap-2 mt-4 w-full">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-ink-700 bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-forest-700" />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                title="Delete book"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Book Info & Reading Stats */}
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {badge.label}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-parchment-100 text-ink-700 border border-parchment-200">
                  {book.genre}
                </span>
                {book.rating && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {book.rating} / 5 Stars
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900 tracking-tight">
                {book.title}
              </h1>
              <p className="text-base text-ink-600 font-medium mt-1">by {book.author}</p>
            </div>

            {/* Reading Progress Tracker Slider/Form */}
            <div className="bg-parchment-50 p-5 rounded-2xl border border-parchment-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
                  Reading Progress
                </span>
                <span className="text-sm font-bold font-serif text-forest-800">
                  {book.progressPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-parchment-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-forest-700 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${book.progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>Current: <strong>{book.currentPage}</strong> pgs</span>
                <span>Total: <strong>{book.totalPages}</strong> pgs</span>
              </div>

              {/* Quick Update Progress Input */}
              <form
                onSubmit={handleProgressUpdate}
                className="pt-2 border-t border-parchment-200 flex flex-wrap items-center gap-2"
              >
                <span className="text-xs text-ink-600 font-medium">Update current page:</span>
                <input
                  type="number"
                  min="0"
                  max={book.totalPages}
                  value={currentPageInput}
                  onChange={(e) => setCurrentPageInput(e.target.value)}
                  className="w-20 px-2.5 py-1 text-xs rounded-lg border border-parchment-300 focus:outline-hidden focus:border-forest-700 bg-white"
                />
                <button
                  type="submit"
                  disabled={savingProgress}
                  className="px-3 py-1 bg-forest-700 hover:bg-forest-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
                {book.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={handleMarkCompleted}
                    className="ml-auto px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Mark Finished
                  </button>
                )}
              </form>
            </div>

            {/* Reading Dates */}
            <div className="grid grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 bg-white rounded-xl border border-parchment-200">
                <span className="text-[10px] text-ink-500 uppercase font-semibold block">Date Added</span>
                <span className="font-medium text-ink-800 mt-0.5 block">{formatDate(book.dateAdded)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-parchment-200">
                <span className="text-[10px] text-ink-500 uppercase font-semibold block">Started</span>
                <span className="font-medium text-ink-800 mt-0.5 block">{formatDate(book.startDate)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-parchment-200">
                <span className="text-[10px] text-ink-500 uppercase font-semibold block">Completed</span>
                <span className="font-medium text-ink-800 mt-0.5 block">{formatDate(book.completionDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Notes & Review */}
        {book.notes && (
          <div className="px-6 sm:px-8 py-5 border-t border-parchment-200 bg-parchment-50/60">
            <h3 className="text-xs font-bold text-ink-800 uppercase tracking-wider mb-2">
              Personal Notes & Review
            </h3>
            <p className="text-sm text-ink-700 font-serif leading-relaxed italic whitespace-pre-wrap">
              "{book.notes}"
            </p>
          </div>
        )}
      </div>

      {/* Associated Reading Sessions for this book */}
      <div className="bg-white rounded-3xl border border-parchment-300 shadow-card overflow-hidden">
        <div className="p-6 border-b border-parchment-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-ink-900">
                Reading Sessions History ({sessions.length})
              </h3>
              <p className="text-xs text-ink-500">
                Synchronized with MongoDB collection <code className="font-mono text-forest-700">readingsessions</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSessionModalState({ isOpen: true, session: null })}
            className="px-3.5 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300" />
            Log Session for This Book
          </button>
        </div>

        {sessions.length > 0 ? (
          <div className="divide-y divide-parchment-200">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-parchment-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-forest-800 text-sm">
                      +{session.pagesRead} pages read
                    </span>
                    <span className="text-xs text-ink-500">•</span>
                    <span className="text-xs text-ink-700 font-medium">
                      {formatDuration(session.durationMinutes)}
                    </span>
                    <span className="text-xs text-ink-500">•</span>
                    <span className="text-xs text-ink-500">
                      {formatDate(session.date)}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-xs text-ink-600 italic">
                      "{session.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setSessionModalState({ isOpen: true, session })}
                    className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-parchment-200 transition-colors"
                    title="Edit session"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteSessionModal({ isOpen: true, session })}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-ink-500 text-xs">
            No reading sessions logged yet for this book. Click "Log Session for This Book" to add your first reading session!
          </div>
        )}
      </div>

      {/* Edit Book Modal */}
      <BookModal
        isOpen={isEditModalOpen}
        bookToEdit={book}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchBookDetails}
      />

      {/* Log/Edit Session Modal */}
      <SessionModal
        isOpen={sessionModalState.isOpen}
        sessionToEdit={sessionModalState.session}
        defaultBookId={book._id}
        onClose={() => setSessionModalState({ isOpen: false, session: null })}
        onSuccess={fetchBookDetails}
      />

      {/* Delete Book Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title={`Delete '${book.title}'?`}
        message="This book and its reading sessions will be removed permanently from the local MongoDB database."
        onConfirm={handleDeleteBook}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Delete Session Modal */}
      <DeleteConfirmModal
        isOpen={deleteSessionModal.isOpen}
        title="Delete Reading Session?"
        message="Deleting this session will automatically roll back the pages read from the book's current progress."
        onConfirm={handleDeleteSessionConfirm}
        onCancel={() => setDeleteSessionModal({ isOpen: false, session: null })}
      />
    </div>
  );
};

