import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { booksApi } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  CheckCircle,
  Star,
  Eye,
  Bookmark,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatDate, getBookCover, getStatusBadge } from '../utils/helpers';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

const GENRES = [
  'All',
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
];

export const Books = () => {
  const { refreshTrigger, triggerGlobalRefresh, openBookModal, openSessionModal } = useOutletContext();
  const { showToast } = useApp();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortOption, setSortOption] = useState('dateAdded');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, book: null });
  const [deleting, setDeleting] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await booksApi.getAll({
        search,
        genre: selectedGenre,
        status: selectedStatus,
        sort: sortOption,
      });
      setBooks(res.data || []);
    } catch (err) {
      console.error('Fetch books error:', err);
      showToast(err.message || 'Failed to fetch books from database', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedGenre, selectedStatus, sortOption, showToast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks, refreshTrigger]);

  const handleDeleteConfirm = async () => {
    if (!deleteModal.book) return;
    setDeleting(true);
    try {
      await booksApi.delete(deleteModal.book._id);
      showToast(`'${deleteModal.book.title}' deleted from library.`, 'success');
      setDeleteModal({ isOpen: false, book: null });
      triggerGlobalRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete book', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkCompleted = async (bookId, title) => {
    try {
      await booksApi.markCompleted(bookId);
      showToast(`Congratulations! '${title}' marked as completed!`, 'success');
      triggerGlobalRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to mark completed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-900 tracking-tight">
            My Books Library
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Manage your personal book catalogue ({books.length} titles in MongoDB)
          </p>
        </div>

        <button
          onClick={() => openBookModal()}
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all hover:shadow active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          Add New Book
        </button>
      </div>

      {/* Search, Filter & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-parchment-300 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 bg-parchment-50/50"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 bg-white"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g === 'All' ? 'All Genres' : g}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 bg-white"
            >
              <option value="dateAdded">Newest Added</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="progress_desc">Most Progress</option>
              <option value="pages_desc">Most Pages</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-parchment-300 rounded-xl overflow-hidden p-0.5 bg-parchment-100">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-forest-700 shadow-xs' : 'text-ink-500'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-forest-700 shadow-xs' : 'text-ink-500'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-parchment-200">
          {['All', 'Currently Reading', 'Want to Read', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStatus === status
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'bg-parchment-100 hover:bg-parchment-200 text-ink-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Books Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-white rounded-2xl border border-parchment-200" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-parchment-300 shadow-card max-w-md mx-auto my-8">
          <BookOpen className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-ink-900 text-base mb-1">
            No Books Found
          </h3>
          <p className="text-xs text-ink-500 mb-5">
            {search || selectedGenre !== 'All' || selectedStatus !== 'All'
              ? 'Try adjusting your search query or filters.'
              : 'Your library is empty. Add your first book to begin tracking!'}
          </p>
          <button
            onClick={() => openBookModal()}
            className="px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors shadow-xs"
          >
            + Add New Book
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((book) => {
            const badge = getStatusBadge(book.status);
            const cover = getBookCover(book.coverImage, book.genre);

            return (
              <div
                key={book._id}
                className="bg-white rounded-2xl border border-parchment-300 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Book Card Cover Banner */}
                  <div className="h-44 bg-parchment-100 relative overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={cover}
                      alt={book.title}
                      className="h-full w-28 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Status Pill */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Genre Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-ink-700 backdrop-blur-xs border border-parchment-200">
                        {book.genre}
                      </span>
                    </div>
                  </div>

                  {/* Book Metadata */}
                  <div className="p-4 space-y-2">
                    <div>
                      <h3
                        className="font-serif font-bold text-ink-900 text-sm leading-snug truncate"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <p className="text-xs text-ink-500 truncate">{book.author}</p>
                    </div>

                    {/* Rating Stars */}
                    {book.rating ? (
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-ink-400">Unrated</span>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-parchment-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-forest-700 h-2 rounded-full transition-all"
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
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-parchment-50 border-t border-parchment-200 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/books/${book._id}`}
                      className="p-1.5 rounded-lg text-ink-600 hover:text-forest-800 hover:bg-parchment-200 transition-colors"
                      title="View Book Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => openBookModal(book)}
                      className="p-1.5 rounded-lg text-ink-600 hover:text-forest-800 hover:bg-parchment-200 transition-colors"
                      title="Edit Book"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, book })}
                      className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                      title="Delete Book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {book.status !== 'Completed' && (
                      <button
                        onClick={() => handleMarkCompleted(book._id, book.title)}
                        className="px-2 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Mark Finished"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Finish
                      </button>
                    )}
                    <button
                      onClick={() => openSessionModal(null, book._id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-lg transition-colors"
                    >
                      + Session
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white rounded-2xl border border-parchment-300 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-parchment-50 text-xs text-ink-500 font-semibold uppercase tracking-wider border-b border-parchment-200">
                <tr>
                  <th className="py-3.5 px-6">Book Title</th>
                  <th className="py-3.5 px-6">Genre</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Progress</th>
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200">
                {books.map((book) => {
                  const badge = getStatusBadge(book.status);
                  return (
                    <tr key={book._id} className="hover:bg-parchment-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-ink-900 flex items-center gap-3">
                        <img
                          src={getBookCover(book.coverImage, book.genre)}
                          alt=""
                          className="w-9 h-12 object-cover rounded shadow-xs shrink-0"
                        />
                        <div>
                          <Link
                            to={`/books/${book._id}`}
                            className="font-serif font-bold text-sm text-ink-900 hover:text-forest-700 transition-colors block"
                          >
                            {book.title}
                          </Link>
                          <span className="text-xs text-ink-500">{book.author}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-ink-600">
                        <span className="px-2.5 py-1 rounded-full bg-parchment-100 font-medium">
                          {book.genre}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="w-32 space-y-1">
                          <div className="w-full bg-parchment-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-forest-700 h-1.5 rounded-full"
                              style={{ width: `${book.progressPercentage}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-ink-500 font-medium">
                            {book.currentPage}/{book.totalPages} pgs ({book.progressPercentage}%)
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-xs">
                        {book.rating ? (
                          <span className="font-semibold text-amber-600">★ {book.rating}/5</span>
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1">
                        <button
                          onClick={() => openSessionModal(null, book._id)}
                          className="px-2 py-1 text-xs font-medium text-white bg-forest-700 hover:bg-forest-800 rounded-lg transition-colors"
                        >
                          + Session
                        </button>
                        <button
                          onClick={() => openBookModal(book)}
                          className="p-1.5 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-parchment-200 transition-colors inline-block"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, book })}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors inline-block"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={`Delete '${deleteModal.book?.title}'?`}
        message="This book and all its associated reading sessions will be permanently deleted from your local MongoDB database."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, book: null })}
      />
    </div>
  );
};

