import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-parchment-300 max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>

          <h3 className="text-lg font-serif font-bold text-ink-900 mb-2">
            {title || 'Confirm Deletion'}
          </h3>

          <p className="text-sm text-ink-600 leading-relaxed mb-6">
            {message || 'Are you sure you want to delete this record? This action cannot be undone.'}
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 rounded-xl hover:bg-parchment-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

