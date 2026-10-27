import React, { useState, useEffect } from 'react';
import { booksApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { X, Book, Image as ImageIcon, Star, AlertCircle } from 'lucide-react';
import { DEFAULT_BOOK_COVERS } from '../utils/helpers';

const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Sci-Fi',
  'Fantasy',
  'Mystery',
  'Biography',
  'Self-Help',
  'Philosophy',
  'History',
  'Technology',
  'Business',
  'Poetry',
  'Other',
];

export const BookModal = ({ isOpen, bookToEdit, onClose, onSuccess }) => {
  const { showToast } = useApp();
  const isEditing = Boolean(bookToEdit);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Fiction',
    totalPages: '',
    currentPage: 0,
    status: 'Want to Read',
    rating: '',
    notes: '',
    coverImage: '',
    startDate: '',
    completionDate: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        title: bookToEdit.title || '',
        author: bookToEdit.author || '',
        genre: bookToEdit.genre || 'Fiction',
        totalPages: bookToEdit.totalPages || '',
        currentPage: bookToEdit.currentPage || 0,
        status: bookToEdit.status || 'Want to Read',
        rating: bookToEdit.rating || '',
        notes: bookToEdit.notes || '',
        coverImage: bookToEdit.coverImage || '',
        startDate: bookToEdit.startDate ? bookToEdit.startDate.split('T')[0] : '',
        completionDate: bookToEdit.completionDate ? bookToEdit.completionDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        author: '',
        genre: 'Fiction',
        totalPages: '',
        currentPage: 0,
        status: 'Want to Read',
        rating: '',
        notes: '',
        coverImage: '',
        startDate: '',
        completionDate: '',
      });
    }
    setError('');
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Auto adjust status if pages reach max or start
      if (name === 'currentPage' || name === 'totalPages') {
        const cur = Number(name === 'currentPage' ? value : next.currentPage);
        const tot = Number(name === 'totalPages' ? value : next.totalPages);

        if (tot > 0 && cur >= tot) {
          next.status = 'Completed';
          if (!next.completionDate) {
            next.completionDate = new Date().toISOString().split('T')[0];
          }
        } else if (cur > 0 && next.status === 'Want to Read') {
          next.status = 'Currently Reading';
          if (!next.startDate) {
            next.startDate = new Date().toISOString().split('T')[0];
          }
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const total = Number(formData.totalPages);
    const current = Number(formData.currentPage || 0);

    if (!formData.title.trim()) {
      setError('Please provide a book title');
      return;
    }
    if (!formData.author.trim()) {
      setError('Please provide an author name');
      return;
    }
    if (isNaN(total) || total < 1) {
      setError('Total pages must be at least 1');
      return;
    }
    if (isNaN(current) || current < 0) {
      setError('Current page cannot be negative');
      return;
    }
    if (current > total) {
      setError(`Current page (${current}) cannot exceed total pages (${total})`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre,
        totalPages: total,
        currentPage: current,
        status: formData.status,
        rating: formData.rating ? Number(formData.rating) : null,
        notes: formData.notes.trim(),
        coverImage: formData.coverImage.trim(),
        startDate: formData.startDate || null,
        completionDate: formData.completionDate || null,
      };

      if (isEditing) {
        await booksApi.update(bookToEdit._id, payload);
        showToast(`'${payload.title}' updated successfully!`, 'success');
      } else {
        await booksApi.create(payload);
        showToast(`'${payload.title}' added to your library!`, 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save book to database');
      showToast(err.message || 'Failed to save book', 'error');
    } finally {
      setLoading(false);
    }
  };

  const previewCover = formData.coverImage.trim() || DEFAULT_BOOK_COVERS[formData.genre] || DEFAULT_BOOK_COVERS.Default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-parchment-300 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-parchment-200 flex items-center justify-between bg-parchment-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-xs">
              <Book className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-ink-900">
                {isEditing ? 'Edit Book Record' : 'Add Book to Library'}
              </h2>
              <p className="text-xs text-ink-500">
                Stored in local MongoDB <code className="font-mono text-forest-700">books</code> collection
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left Cover Preview */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-44 rounded-xl overflow-hidden border-2 border-parchment-300 bg-parchment-100 shadow-md relative group">
                <img
                  src={previewCover}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_BOOK_COVERS.Default;
                  }}
                />
              </div>
              <span className="text-[11px] text-ink-500 mt-2 font-medium">Cover Preview</span>
            </div>

            {/* Right Fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. The Midnight Library"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 focus:ring-1 focus:ring-forest-700 transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Author <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="e.g. Matt Haig"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 focus:ring-1 focus:ring-forest-700 transition-all bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Genre</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Reading Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
                  >
                    <option value="Want to Read">Want to Read</option>
                    <option value="Currently Reading">Currently Reading</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Page numbers */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-parchment-200">
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Total Pages <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="totalPages"
                min="1"
                value={formData.totalPages}
                onChange={handleChange}
                placeholder="350"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Current Page</label>
              <input
                type="number"
                name="currentPage"
                min="0"
                max={formData.totalPages || undefined}
                value={formData.currentPage}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
              />
            </div>
          </div>

          {/* Cover image URL */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Cover Image URL <span className="text-ink-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
            />
          </div>

          {/* Rating and dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Personal Rating</label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
              >
                <option value="">No rating yet</option>
                <option value="5">★★★★★ (5 - Masterpiece)</option>
                <option value="4">★★★★☆ (4 - Great)</option>
                <option value="3">★★★☆☆ (3 - Good)</option>
                <option value="2">★★☆☆☆ (2 - Fair)</option>
                <option value="1">★☆☆☆☆ (1 - Poor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Completion Date</label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
              />
            </div>
          </div>

          {/* Notes and review */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Personal Notes & Review
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="What did you learn? Favorite quotes or reflections..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white resize-none"
            />
          </div>

          {/* Submit Buttons */}
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
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

