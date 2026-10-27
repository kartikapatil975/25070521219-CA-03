import React, { useState, useEffect } from 'react';
import { sessionsApi, booksApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { X, History, Clock, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SessionModal = ({ isOpen, sessionToEdit, defaultBookId, onClose, onSuccess }) => {
  const { showToast } = useApp();
  const isEditing = Boolean(sessionToEdit);

  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  const [formData, setFormData] = useState({
    book: '',
    pagesRead: '',
    durationMinutes: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load books for the dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchBooks = async () => {
        setLoadingBooks(true);
        try {
          const res = await booksApi.getAll();
          setBooks(res.data || []);
        } catch (e) {
          console.error('Failed to load books for session modal:', e);
        } finally {
          setLoadingBooks(false);
        }
      };
      fetchBooks();
    }
  }, [isOpen]);

  useEffect(() => {
    if (sessionToEdit) {
      setFormData({
        book: sessionToEdit.book?._id || sessionToEdit.book || '',
        pagesRead: sessionToEdit.pagesRead || '',
        durationMinutes: sessionToEdit.durationMinutes || '',
        date: sessionToEdit.date ? sessionToEdit.date.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: sessionToEdit.notes || '',
      });
    } else {
      setFormData({
        book: defaultBookId || '',
        pagesRead: '',
        durationMinutes: 30,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setError('');
  }, [sessionToEdit, defaultBookId, isOpen]);

  // Set default book when books finish loading if none is selected
  useEffect(() => {
    if (!formData.book && books.length > 0 && !defaultBookId) {
      // Prefer a book currently reading
      const currentlyReading = books.find((b) => b.status === 'Currently Reading');
      setFormData((prev) => ({
        ...prev,
        book: currentlyReading ? currentlyReading._id : books[0]._id,
      }));
    }
  }, [books, defaultBookId, formData.book]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedBook = books.find((b) => b._id === formData.book);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pages = Number(formData.pagesRead);
    const duration = Number(formData.durationMinutes);

    if (!formData.book) {
      setError('Please select a book');
      return;
    }
    if (isNaN(pages) || pages < 1) {
      setError('Pages read must be at least 1');
      return;
    }
    if (isNaN(duration) || duration < 1) {
      setError('Session duration must be at least 1 minute');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        book: formData.book,
        pagesRead: pages,
        durationMinutes: duration,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        notes: formData.notes.trim(),
      };

      if (isEditing) {
        await sessionsApi.update(sessionToEdit._id, payload);
        showToast('Reading session updated successfully!', 'success');
      } else {
        await sessionsApi.create(payload);
        showToast(`Logged session: ${pages} pages in ${duration} mins!`, 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save session');
      showToast(err.message || 'Failed to record session', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-parchment-300 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-parchment-200 flex items-center justify-between bg-parchment-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-ink-900">
                {isEditing ? 'Edit Reading Session' : 'Log Reading Session'}
              </h2>
              <p className="text-xs text-ink-500">
                Saves to local MongoDB <code className="font-mono text-forest-700">readingsessions</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-parchment-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Book Selector */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Select Book <span className="text-rose-500">*</span>
            </label>
            {loadingBooks ? (
              <div className="text-xs text-ink-500 py-2">Loading your library...</div>
            ) : books.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                No books found. Please add a book first before logging a session!
              </div>
            ) : (
              <select
                name="book"
                value={formData.book}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
              >
                <option value="" disabled>
                  -- Select a book --
                </option>
                {books.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title} by {b.author} ({b.currentPage}/{b.totalPages} pgs)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Book Progress Banner */}
          {selectedBook && (
            <div className="p-3 rounded-xl bg-forest-50/60 border border-forest-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-forest-700" />
                <span className="text-ink-700 font-medium">
                  Current progress: <strong>{selectedBook.currentPage}</strong> / {selectedBook.totalPages} pages ({selectedBook.progressPercentage}%)
                </span>
              </div>
              <span className="font-semibold text-forest-700">{selectedBook.status}</span>
            </div>
          )}

          {/* Pages Read and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Pages Read <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="pagesRead"
                min="1"
                value={formData.pagesRead}
                onChange={handleChange}
                placeholder="25"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Duration (minutes) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="durationMinutes"
                min="1"
                value={formData.durationMinutes}
                onChange={handleChange}
                placeholder="30"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
              />
            </div>
          </div>

          {/* Session Date */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Session Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
            />
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Session Notes / Thoughts <span className="text-ink-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Completed Chapter 4. Key insight about system queues..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-parchment-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 rounded-xl hover:bg-parchment-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || books.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Recording...' : isEditing ? 'Save Changes' : 'Log Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

