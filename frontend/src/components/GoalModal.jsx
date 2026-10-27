import React, { useState, useEffect } from 'react';
import { goalsApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { X, Target, AlertCircle } from 'lucide-react';

export const GoalModal = ({ isOpen, goalToEdit, onClose, onSuccess }) => {
  const { showToast } = useApp();
  const isEditing = Boolean(goalToEdit && goalToEdit._id);
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    year: currentYear,
    targetBooks: 12,
    monthlyPageTarget: 300,
    weeklyDurationTarget: 120,
    isActive: true,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setFormData({
        year: goalToEdit.year || currentYear,
        targetBooks: goalToEdit.targetBooks || 12,
        monthlyPageTarget: goalToEdit.monthlyPageTarget || 300,
        weeklyDurationTarget: goalToEdit.weeklyDurationTarget || 120,
        isActive: goalToEdit.isActive !== undefined ? goalToEdit.isActive : true,
      });
    } else {
      setFormData({
        year: currentYear,
        targetBooks: 12,
        monthlyPageTarget: 300,
        weeklyDurationTarget: 120,
        isActive: true,
      });
    }
    setError('');
  }, [goalToEdit, isOpen, currentYear]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetBooks = Number(formData.targetBooks);
    const monthlyPageTarget = Number(formData.monthlyPageTarget);
    const weeklyDurationTarget = Number(formData.weeklyDurationTarget);

    if (isNaN(targetBooks) || targetBooks < 1) {
      setError('Annual book target must be at least 1 book');
      return;
    }
    if (isNaN(monthlyPageTarget) || monthlyPageTarget < 1) {
      setError('Monthly pages target must be at least 1 page');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        year: Number(formData.year),
        targetBooks,
        monthlyPageTarget,
        weeklyDurationTarget,
        isActive: formData.isActive,
      };

      if (isEditing) {
        await goalsApi.update(goalToEdit._id, payload);
        showToast('Reading goal targets updated!', 'success');
      } else {
        await goalsApi.create(payload);
        showToast('New reading goal established!', 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save reading goal');
      showToast(err.message || 'Failed to update goal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-parchment-300 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-parchment-200 flex items-center justify-between bg-parchment-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-xs">
              <Target className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-ink-900">
                {isEditing ? 'Configure Reading Goal' : 'Set New Reading Goal'}
              </h2>
              <p className="text-xs text-ink-500">
                Saves to local MongoDB <code className="font-mono text-forest-700">readinggoals</code>
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

          {/* Goal Year */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Target Year
            </label>
            <input
              type="number"
              name="year"
              min="2020"
              max="2035"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white"
            />
          </div>

          {/* Annual Book Target */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Annual Completed Books Target <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="targetBooks"
                min="1"
                value={formData.targetBooks}
                onChange={handleChange}
                placeholder="12"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white pr-16"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-ink-400 font-medium">books</span>
            </div>
            <p className="text-[11px] text-ink-500 mt-1">
              e.g., 1 book per month = 12 books/year
            </p>
          </div>

          {/* Monthly Pages Target */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Monthly Pages Target <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="monthlyPageTarget"
                min="1"
                value={formData.monthlyPageTarget}
                onChange={handleChange}
                placeholder="300"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white pr-16"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-ink-400 font-medium">pages</span>
            </div>
            <p className="text-[11px] text-ink-500 mt-1">
              e.g., 10 pages/day = 300 pages/month
            </p>
          </div>

          {/* Weekly Duration Target */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Weekly Reading Duration Target (minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                name="weeklyDurationTarget"
                min="0"
                value={formData.weeklyDurationTarget}
                onChange={handleChange}
                placeholder="120"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-300 focus:outline-hidden focus:border-forest-700 transition-all bg-white pr-16"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-ink-400 font-medium">mins/wk</span>
            </div>
            <p className="text-[11px] text-ink-500 mt-1">
              120 mins = 2 hours reading every week
            </p>
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
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Set Goals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

