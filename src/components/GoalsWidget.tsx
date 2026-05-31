"use client";

import { useEffect, useState } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Check, Edit2, Plus, Target, Trash2, X } from 'lucide-react';
import { useIsClient } from '@/hooks/useIsClient';
import { useGoalStore, Goal } from '@/store/useGoalStore';

export default function GoalsWidget() {
  const mounted = useIsClient();
  const goals = useGoalStore((state) => state.goals);
  const fetchGoals = useGoalStore((state) => state.fetchGoals);
  const addGoal = useGoalStore((state) => state.addGoal);
  const updateGoal = useGoalStore((state) => state.updateGoal);
  const deleteGoal = useGoalStore((state) => state.deleteGoal);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [targetDate, setTargetDate] = useState(() => format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')); // +30 days

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (!mounted) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({ title: title.trim(), start_date: startDate, target_date: targetDate });
    setIsAdding(false);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!title.trim()) return;
    updateGoal(id, { title: title.trim(), start_date: startDate, target_date: targetDate });
    setEditingId(null);
  };

  const resetForm = () => {
    setTitle('');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setTargetDate(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  };

  const startEdit = (goal: Goal) => {
    setTitle(goal.title);
    setStartDate(goal.start_date || format(new Date(), 'yyyy-MM-dd'));
    setTargetDate(goal.target_date);
    setEditingId(goal.id);
  };

  const calculateProgress = (start: string, target: string) => {
    const totalDays = differenceInCalendarDays(parseISO(target), parseISO(start));
    if (totalDays <= 0) return 100;
    const daysPassed = differenceInCalendarDays(new Date(), parseISO(start));
    return Math.max(0, Math.min(100, Math.round((daysPassed / totalDays) * 100)));
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-white">
          <Target size={16} className="text-emerald-400" /> Goals
        </h2>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); resetForm(); }}
            className="flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isAdding && (
          <form onSubmit={handleAdd} className="glass-card-strong p-4 animate-fade-in">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title"
              className="w-full rounded-xl border border-white/[0.06] bg-black/40 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500/30 focus:outline-none mb-3"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-[10px] font-medium text-neutral-500 uppercase">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 text-xs text-white focus:border-emerald-500/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-neutral-500 uppercase">Target</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 text-xs text-white focus:border-emerald-500/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="min-h-[44px] rounded-lg px-4 text-xs font-semibold text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="min-h-[44px] rounded-lg bg-emerald-500 px-4 text-xs font-bold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {goals.map((goal) => {
          if (editingId === goal.id) {
            return (
              <form key={goal.id} onSubmit={(e) => handleUpdate(e, goal.id)} className="glass-card p-4 animate-fade-in border-emerald-500/30">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.06] bg-black/40 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500/30 focus:outline-none mb-3"
                />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <label className="text-[10px] font-medium text-neutral-500 uppercase">Start</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 text-xs text-white focus:border-emerald-500/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-neutral-500 uppercase">Target</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 text-xs text-white focus:border-emerald-500/30 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this goal?')) deleteGoal(goal.id);
                    }}
                    className="min-h-[44px] min-w-[44px] grid place-items-center rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="min-h-[44px] rounded-lg px-4 text-xs font-semibold text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!title.trim()}
                      className="min-h-[44px] rounded-lg bg-emerald-500 px-4 text-xs font-bold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            );
          }

          const progress = calculateProgress(goal.start_date || format(new Date(), 'yyyy-MM-dd'), goal.target_date);
          const daysLeft = Math.max(0, differenceInCalendarDays(parseISO(goal.target_date), new Date()));
          const isDone = progress >= 100;

          return (
            <div key={goal.id} className="glass-card p-4 hover:border-white/[0.12] transition-colors relative group">
              <div className="flex items-start justify-between mb-3 pr-8">
                <div>
                  <h3 className={`text-sm font-semibold ${isDone ? 'text-emerald-400 line-through decoration-emerald-500/30' : 'text-white'}`}>
                    {goal.title}
                  </h3>
                  <p className="mt-1 text-[10px] text-neutral-500">
                    {goal.start_date && format(parseISO(goal.start_date), 'MMM d')} {goal.start_date ? '→' : 'Target:'} {format(parseISO(goal.target_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Edit button always visible on top right */}
              <button
                onClick={() => startEdit(goal)}
                className="absolute top-3 right-3 grid min-h-[44px] min-w-[44px] place-items-center rounded-lg text-neutral-500 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                <Edit2 size={14} />
              </button>

              <div className="mt-1">
                <div className="flex justify-between items-end mb-1.5">
                  <span className={`text-xs font-bold ${isDone ? 'text-emerald-400' : 'text-white'}`}>
                    {progress}%
                  </span>
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                    {isDone ? 'Completed' : `${daysLeft} days left`}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && !isAdding && (
          <div className="glass-card p-6 text-center">
            <Target size={24} className="mx-auto mb-2 text-neutral-600" />
            <p className="text-sm font-medium text-neutral-400">No active goals</p>
            <p className="mt-1 text-[10px] text-neutral-500">Set a long-term target to stay focused.</p>
          </div>
        )}
      </div>
    </div>
  );
}
