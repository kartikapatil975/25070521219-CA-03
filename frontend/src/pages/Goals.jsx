import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { goalsApi } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Target,
  Edit2,
  Trash2,
  Plus,
  BookOpen,
  Calendar,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { formatDuration } from '../utils/helpers';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const Goals = () => {
  const { refreshTrigger, triggerGlobalRefresh, openGoalModal } = useOutletContext();
  const { showToast } = useApp();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, goal: null });
  const [deleting, setDeleting] = useState(false);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalsApi.getAll();
      setGoals(res.data || []);
    } catch (err) {
      console.error('Fetch goals error:', err);
      showToast(err.message || 'Failed to fetch goals from database', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals, refreshTrigger]);

  const handleDeleteConfirm = async () => {
    if (!deleteModal.goal) return;
    setDeleting(true);
    try {
      await goalsApi.delete(deleteModal.goal._id);
      showToast('Reading goal deleted.', 'success');
      setDeleteModal({ isOpen: false, goal: null });
      triggerGlobalRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete goal', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const activeGoal = goals.find((g) => g.isActive) || goals[0];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-900 tracking-tight">
            Reading Goals & Targets
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Calculated from real MongoDB records in <code className="font-mono text-forest-700">books</code> and{' '}
            <code className="font-mono text-forest-700">readingsessions</code>
          </p>
        </div>

        <button
          onClick={() => openGoalModal()}
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all hover:shadow active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          Set New Goal
        </button>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-64 bg-white rounded-3xl border border-parchment-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-parchment-200" />
            ))}
          </div>
        </div>
      ) : activeGoal ? (
        <>
          {/* Active Primary Goal Card */}
          <div className="bg-white rounded-3xl border border-parchment-300 shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-serif font-bold text-ink-900">
                      {activeGoal.year} Reading Challenge
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Your reading pace is calculated from actual database records
                  </p>
                </div>
              </div>

              <button
                onClick={() => openGoalModal(activeGoal)}
                className="px-3.5 py-2 text-xs font-semibold text-forest-800 bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Targets
              </button>
            </div>

            {/* Three Target Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* 1. Annual Book Target */}
              <div className="p-5 rounded-2xl bg-parchment-50 border border-parchment-200 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-600 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-forest-700" />
                    Annual Books Target
                  </span>
                  <span className="text-lg font-bold font-serif text-forest-800">
                    {activeGoal.progress?.annualBookProgress?.percentage || 0}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-parchment-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-forest-700 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${activeGoal.progress?.annualBookProgress?.percentage || 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-ink-500">
                    <span>
                      {activeGoal.progress?.annualBookProgress?.completed || 0} completed
                    </span>
                    <span>{activeGoal.targetBooks} target</span>
                  </div>
                </div>

                <p className="text-xs text-ink-600 font-medium">
                  {activeGoal.progress?.annualBookProgress?.remaining > 0
                    ? `${activeGoal.progress.annualBookProgress.remaining} books left to reach your ${activeGoal.year} target`
                    : '🎉 Congratulations! You have completed your annual reading goal!'}
                </p>
              </div>

              {/* 2. Monthly Pages Target */}
              <div className="p-5 rounded-2xl bg-parchment-50 border border-parchment-200 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    Monthly Pages Target
                  </span>
                  <span className="text-lg font-bold font-serif text-amber-600">
                    {activeGoal.progress?.monthlyPageProgress?.percentage || 0}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-parchment-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${activeGoal.progress?.monthlyPageProgress?.percentage || 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-ink-500">
                    <span>
                      {activeGoal.progress?.monthlyPageProgress?.completed || 0} pgs read
                    </span>
                    <span>{activeGoal.monthlyPageTarget} target</span>
                  </div>
                </div>

                <p className="text-xs text-ink-600 font-medium">
                  {activeGoal.progress?.monthlyPageProgress?.remaining > 0
                    ? `${activeGoal.progress.monthlyPageProgress.remaining} pages left for this month`
                    : '🎉 Monthly page target achieved!'}
                </p>
              </div>

              {/* 3. Weekly Reading Time Target */}
              <div className="p-5 rounded-2xl bg-parchment-50 border border-parchment-200 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Weekly Duration Target
                  </span>
                  <span className="text-lg font-bold font-serif text-blue-600">
                    {activeGoal.progress?.weeklyDurationProgress?.percentage || 0}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-parchment-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${activeGoal.progress?.weeklyDurationProgress?.percentage || 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-ink-500">
                    <span>
                      {formatDuration(activeGoal.progress?.weeklyDurationProgress?.completed || 0)} read
                    </span>
                    <span>{formatDuration(activeGoal.weeklyDurationTarget || 120)} target</span>
                  </div>
                </div>

                <p className="text-xs text-ink-600 font-medium">
                  {activeGoal.progress?.weeklyDurationProgress?.remaining > 0
                    ? `${formatDuration(activeGoal.progress.weeklyDurationProgress.remaining)} left this week`
                    : '🎉 Weekly reading target achieved!'}
                </p>
              </div>
            </div>
          </div>

          {/* All Configured Goals List */}
          <div className="bg-white rounded-2xl border border-parchment-300 shadow-card overflow-hidden">
            <div className="p-6 border-b border-parchment-200 flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-ink-900">
                Configured Goals in MongoDB ({goals.length})
              </h3>
              <span className="text-xs text-ink-500">
                Collection: <code className="font-mono text-forest-700">readinggoals</code>
              </span>
            </div>

            <div className="divide-y divide-parchment-200">
              {goals.map((g) => (
                <div
                  key={g._id}
                  className="p-5 flex items-center justify-between hover:bg-parchment-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-parchment-100 flex items-center justify-center text-forest-700 font-bold font-serif text-sm">
                      {g.year}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-ink-900">
                          {g.year} Target: {g.targetBooks} Books
                        </span>
                        {g.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {g.monthlyPageTarget} pages/month • {g.weeklyDurationTarget || 120} mins/week
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openGoalModal(g)}
                      className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-parchment-200 transition-colors"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {goals.length > 1 && (
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, goal: g })}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-parchment-300 shadow-card max-w-md mx-auto">
          <Target className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-ink-900 text-base mb-1">No Goals Set</h3>
          <p className="text-xs text-ink-500 mb-5">
            Configure reading goals to stay motivated throughout the year!
          </p>
          <button
            onClick={() => openGoalModal()}
            className="px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors"
          >
            Set Reading Goal
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Reading Goal?"
        message="Are you sure you want to delete this reading goal record from the database?"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, goal: null })}
      />
    </div>
  );
};

